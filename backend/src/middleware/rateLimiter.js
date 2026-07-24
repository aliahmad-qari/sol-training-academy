import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Normalize a client IP for use as a rate-limit key. IPv6 addresses are
 * collapsed to their /64 subnet so a single client can't trivially rotate
 * through addresses to evade the limit (this mirrors express-rate-limit v7's
 * built-in IP handling, which is otherwise bypassed when a custom
 * `keyGenerator` is supplied).
 */
const ipKey = (req) => {
  const ip = req.ip || '';
  if (ip.includes(':')) {
    // IPv6 → first 4 hextets (/64). Handles "::" compressed forms loosely.
    return ip.split(':').slice(0, 4).join(':');
  }
  return ip;
};

/**
 * Global API rate limiter. Applied to all /api routes.
 * Standard headers on, legacy headers off.
 */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * Stricter limiter for authentication endpoints (login/register/refresh)
 * to slow down credential-stuffing / brute-force attempts.
 */
export const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

/**
 * Per-user limiter for AI (Groq) endpoints. We key by the authenticated user id
 * when present so one user's burst can't exhaust the shared quota, falling back
 * to the client IP for public/unauthenticated traffic (the /ai/chat route).
 * Returns a friendly 429 instead of a provider quota crash.
 *
 * Tunable via env (AI_RATE_LIMIT_MAX / AI_RATE_LIMIT_WINDOW_MS) so moving to a
 * higher Groq tier needs no code change/redeploy.
 *
 * Keyed by user id when authenticated, else by normalized IP (see `ipKey`).
 */
export const aiLimiter = rateLimit({
  windowMs: env.rateLimit.aiWindowMs,
  max: env.rateLimit.aiMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?._id ? `user:${req.user._id}` : `ip:${ipKey(req)}`),
  message: { success: false, message: 'Too many AI requests. Please wait a moment and try again.' },
});

/**
 * Public contact form limiter. This endpoint can trigger outbound Brevo email,
 * so keep it tighter than the general API limiter to protect the sender quota.
 */
export const contactLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.contactMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact requests. Please wait a moment and try again.' },
});
export default apiLimiter;
