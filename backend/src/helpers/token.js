import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * JWT helpers for the access/refresh token scheme.
 * - Access token: short-lived, sent in Authorization: Bearer header.
 * - Refresh token: long-lived, stored in an httpOnly cookie; its hash is
 *   persisted on the user so it can be revoked.
 */

export const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/**
 * Hash a refresh token before storing it (so a DB leak can't reuse tokens).
 */
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Convert a JWT-style duration (e.g. "7d", "15m") into milliseconds.
 * Used to set the refresh cookie maxAge and the stored expiry.
 */
export const durationToMs = (duration) => {
  const match = /^(\d+)([smhd])$/.exec(String(duration).trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * unitMs[unit];
};

/**
 * Standard cookie options for the refresh token.
 */
export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.secure ? 'none' : 'lax',
  domain: env.cookie.domain || undefined,
  maxAge: durationToMs(env.jwt.refreshExpiresIn),
  path: '/api/v1/auth',
});

export const REFRESH_COOKIE_NAME = 'sol_refresh';
