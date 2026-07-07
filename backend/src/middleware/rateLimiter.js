import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

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
 * Per-user limiter for AI (Gemini) endpoints. Gemini's free tier allows
 * 15 requests/minute; we key by the authenticated user id so one user's burst
 * can't exhaust the shared quota, and return a friendly 429 instead of a
 * provider quota crash. Applied after `protect`, so `req.user` is set.
 * Raising `max` is all that's needed when moving to a paid Gemini tier.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user?._id || req.ip),
  message: { success: false, message: 'Too many AI requests. Please wait a moment and try again.' },
});

export default apiLimiter;
