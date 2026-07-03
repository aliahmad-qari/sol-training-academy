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

export default apiLimiter;
