import Stripe from 'stripe';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Lazily-initialized Stripe client. We don't instantiate at import time so the
 * server can boot without Stripe keys (e.g. during initial Render setup).
 */
let stripeInstance = null;

export const getStripe = () => {
  if (stripeInstance) return stripeInstance;
  if (!env.stripe.secretKey) {
    throw ApiError.internal('Stripe is not configured (STRIPE_SECRET_KEY missing).');
  }
  stripeInstance = new Stripe(env.stripe.secretKey, {
    apiVersion: '2024-12-18.acacia',
    appInfo: { name: 'SOL Training Academy', version: '1.0.0' },
  });
  logger.info('[stripe] Client initialized.');
  return stripeInstance;
};

export const isStripeConfigured = () => Boolean(env.stripe.secretKey);

export default getStripe;
