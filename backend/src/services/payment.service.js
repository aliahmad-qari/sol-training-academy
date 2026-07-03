import { getStripe } from '../stripe/stripe.client.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { CoursePayment, Course, Coupon } from '../models/index.js';
import { enrollUserInCourse } from './enrollment.service.js';
import { createInvoiceForPayment } from './invoice.service.js';

/**
 * Validate a coupon against a course and return pricing.
 * Throws 400 if invalid. Returns { finalPrice, discount, coupon }.
 */
export const priceWithCoupon = async ({ course, couponCode }) => {
  const base = course.price;
  if (!couponCode) return { finalPrice: base, discount: 0, coupon: null };

  const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
  if (!coupon || !coupon.isRedeemable()) {
    throw ApiError.badRequest('Coupon is invalid, expired, or fully redeemed.');
  }
  if (coupon.course_id && String(coupon.course_id) !== String(course._id)) {
    throw ApiError.badRequest('Coupon does not apply to this course.');
  }
  const { discount, finalPrice } = coupon.applyTo(base);
  return { finalPrice, discount, coupon };
};

/**
 * Create a Stripe Checkout Session for a course purchase.
 * Also creates a CoursePayment record in `processing` state, keyed by session.
 *
 * @returns {Promise<{ url: string, sessionId: string, payment: object }>}
 */
export const createCheckoutSession = async ({ user, courseId, couponCode }) => {
  const stripe = getStripe();

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found.');
  if (!course.is_published) throw ApiError.badRequest('This course is not available for purchase.');
  if (!course.price || course.price <= 0) throw ApiError.badRequest('This course has no purchasable price.');

  const { finalPrice, discount, coupon } = await priceWithCoupon({ course, couponCode });

  // Free after coupon → no Stripe needed; caller can enroll directly.
  if (finalPrice <= 0) {
    return { url: null, sessionId: null, free: true, course, discount, coupon };
  }

  // Create the pending payment first so the webhook can find it by session id.
  const payment = await CoursePayment.create({
    user_id: user._id,
    user_email: user.email,
    user_name: user.full_name,
    course_id: course._id,
    course_title: course.title,
    course_price: course.price,
    payment_method: 'stripe',
    payment_status: 'processing',
    amount_paid: finalPrice,
    currency: (env.stripe.currency || 'aud').toUpperCase(),
    coupon_code: coupon?.code,
    discount_amount: discount,
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: env.stripe.currency || 'aud',
          product_data: {
            name: course.title,
            description: course.description?.slice(0, 300) || undefined,
          },
          // Stripe expects the smallest currency unit (cents).
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      payment_id: payment._id.toString(),
      user_id: user._id.toString(),
      course_id: course._id.toString(),
      coupon_code: coupon?.code || '',
    },
    success_url: `${env.stripe.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.stripe.cancelUrl,
  });

  payment.stripe_session_id = session.id;
  await payment.save();

  return { url: session.url, sessionId: session.id, payment: payment.toJSON(), free: false };
};

/**
 * Fulfill a successful payment. Idempotent — safe to call from both the
 * webhook and the client-side verify endpoint.
 *
 * @param {object} params
 * @param {string} params.sessionId       Stripe checkout session id
 * @param {string} [params.paymentIntentId]
 * @returns {Promise<import('mongoose').Document>} the updated CoursePayment
 */
export const fulfillCheckout = async ({ sessionId, paymentIntentId }) => {
  const payment = await CoursePayment.findOne({ stripe_session_id: sessionId }).populate('user_id');
  if (!payment) {
    logger.warn(`[payment] No CoursePayment found for session ${sessionId}`);
    return null;
  }

  // Idempotency guard.
  if (payment.payment_status === 'completed') return payment;

  payment.payment_status = 'completed';
  payment.transaction_id = paymentIntentId || payment.transaction_id || sessionId;
  if (paymentIntentId) payment.stripe_payment_intent = paymentIntentId;

  // 1. Enrollment
  const { enrollment } = await enrollUserInCourse({
    userId: payment.user_id._id || payment.user_id,
    courseId: payment.course_id,
  });
  payment.enrollment_id = enrollment._id;
  payment.enrollment_created = true;

  // 2. Coupon usage increment (best-effort)
  if (payment.coupon_code) {
    await Coupon.updateOne({ code: payment.coupon_code }, { $inc: { used_count: 1 } });
  }

  await payment.save();

  // 3. Invoice (best-effort; failure logged inside service)
  const user = payment.user_id?._id ? payment.user_id : await (await import('../models/index.js')).User.findById(payment.user_id);
  const invoice = await createInvoiceForPayment({ payment, user });
  payment.invoice_id = invoice._id;
  await payment.save();

  logger.info(`[payment] Fulfilled ${payment._id} → enrollment ${enrollment._id}, invoice ${invoice.invoice_number}`);
  return payment;
};

export default createCheckoutSession;
