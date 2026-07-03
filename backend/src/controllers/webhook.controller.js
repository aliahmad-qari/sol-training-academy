import { getStripe } from '../stripe/stripe.client.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { CoursePayment } from '../models/index.js';
import { fulfillCheckout } from '../services/payment.service.js';

/**
 * Stripe webhook handler. Receives the RAW request body (see webhook.routes.js).
 * Verifies the signature, then fulfills or fails the payment.
 *
 * Always responds 2xx quickly once the event is accepted, so Stripe doesn't
 * retry. Processing errors are logged but still acked to avoid retry storms;
 * fulfillment is idempotent so a manual re-drive is safe.
 */
export const handleStripeWebhook = async (req, res) => {
  if (!env.stripe.webhookSecret) {
    logger.error('[webhook] STRIPE_WEBHOOK_SECRET not set; rejecting.');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  const signature = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    // req.body is a Buffer here (express.raw()).
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripe.webhookSecret);
  } catch (err) {
    logger.warn(`[webhook] Signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await fulfillCheckout({
            sessionId: session.id,
            paymentIntentId: session.payment_intent,
          });
        }
        break;
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        await CoursePayment.findOneAndUpdate(
          { stripe_session_id: session.id, payment_status: { $ne: 'completed' } },
          { payment_status: 'failed' }
        );
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        await CoursePayment.findOneAndUpdate(
          { stripe_payment_intent: charge.payment_intent },
          { payment_status: 'refunded' }
        );
        break;
      }

      default:
        logger.debug(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    // Log but still 200 so Stripe stops retrying; fulfillment is idempotent.
    logger.error(`[webhook] Error processing ${event.type}: ${err.message}`);
  }

  return res.status(200).json({ received: true });
};

export default handleStripeWebhook;
