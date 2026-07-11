import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { CoursePayment, Course } from '../models/index.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import {
  createCheckoutSession,
  fulfillCheckout,
  priceWithCoupon,
} from '../services/payment.service.js';
import { enrollUserInCourse } from '../services/enrollment.service.js';
import { getStripe } from '../stripe/stripe.client.js';

/**
 * POST /api/v1/payments/checkout   (protected)
 * Body: { course_id, coupon_code? }
 * 200 ? { url, sessionId }  |  free enrollment ? { free:true, enrollment }
 */
export const createCheckout = asyncHandler(async (req, res) => {
  const { course_id, coupon_code } = req.body;
  if (!course_id) throw ApiError.badRequest('course_id is required.');

  const result = await createCheckoutSession({
    user: req.user,
    courseId: course_id,
    couponCode: coupon_code,
  });

  // Fully-discounted course ? enroll immediately, no payment.
  if (result.free) {
    const { enrollment } = await enrollUserInCourse({
      userId: req.user._id,
      courseId: course_id,
      actorId: req.user._id,
      source: 'free_checkout',
    });
    return sendCreated(res, { free: true, enrollment }, 'Enrolled (free after discount)');
  }

  return sendOk(res, { url: result.url, sessionId: result.sessionId }, 'Checkout session created');
});

/**
 * POST /api/v1/payments/verify   (protected)
 * Body: { session_id }
 * Client-side confirmation after Stripe redirect. Idempotent with webhook.
 * 200 ? { payment_status, enrollment_created, payment }
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) throw ApiError.badRequest('session_id is required.');

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (!session) throw ApiError.notFound('Checkout session not found.');

  // Ownership check via metadata.
  if (session.metadata?.user_id && String(session.metadata.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('This session does not belong to you.');
  }

  let payment;
  if (session.payment_status === 'paid') {
    payment = await fulfillCheckout({
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
    });
  } else {
    payment = await CoursePayment.findOne({ stripe_session_id: session.id });
  }

  if (!payment) throw ApiError.notFound('Payment record not found.');

  return sendOk(
    res,
    {
      payment_status: payment.payment_status,
      enrollment_created: payment.enrollment_created,
      enrollment_id: payment.enrollment_id,
      payment,
    },
    'Payment verified'
  );
});

/**
 * POST /api/v1/payments/preview-coupon   (protected)
 * Body: { course_id, coupon_code }
 * 200 ? { base_price, discount, final_price }
 */
export const previewCoupon = asyncHandler(async (req, res) => {
  const { course_id, coupon_code } = req.body;
  const course = await Course.findById(course_id);
  if (!course) throw ApiError.notFound('Course not found.');

  const { finalPrice, discount } = await priceWithCoupon({ course, couponCode: coupon_code });
  return sendOk(
    res,
    { base_price: course.price, discount, final_price: finalPrice },
    'Coupon applied'
  );
});

/**
 * GET /api/v1/payments   (protected)
 * Students ? own payments; staff ? all (with filters/pagination).
 * 200 ? [payments] + meta
 */
export const listPayments = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const baseFilter = isStaff ? {} : { user_id: req.user._id };

  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['payment_status', 'payment_method', 'course_id', 'user_id'],
    searchFields: ['course_title', 'transaction_id', 'user_email'],
    defaultSort: '-createdAt',
  });

  const finalFilter = { ...baseFilter, ...filter };
  const [items, total] = await Promise.all([
    CoursePayment.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    CoursePayment.countDocuments(finalFilter),
  ]);

  return sendOk(res, items, 'Payments', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/payments/:id   (protected; owner or staff)
 */
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await CoursePayment.findById(req.params.id).lean();
  if (!payment) throw ApiError.notFound('Payment not found.');

  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(payment.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot access this payment.');
  }
  return sendOk(res, payment, 'Payment');
});


