import express, { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Stripe webhook router.
 *
 * Mounted in app.js BEFORE express.json() because Stripe signature
 * verification requires the untouched raw request body.
 *
 * The event-handling logic (fulfilling checkout → creating enrollment,
 * invoice, and payment records) is implemented in Module 7 and imported
 * lazily so this router — and the whole app — boots even before Stripe
 * secrets are configured.
 */
export const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      // Lazy import so a missing/unconfigured Stripe key never blocks boot.
      const { handleStripeWebhook } = await import('../controllers/webhook.controller.js');
      return await handleStripeWebhook(req, res, next);
    } catch (err) {
      // If the controller module doesn't exist yet (pre-Module 7), ack safely
      // so Stripe doesn't hammer retries during setup.
      if (err && err.code === 'ERR_MODULE_NOT_FOUND') {
        logger.warn('[webhook] Stripe webhook handler not yet implemented; acknowledging event.');
        return res.status(200).json({ received: true });
      }
      return next(err);
    }
  }
);

export default stripeWebhookRouter;
