import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  durationToMs,
  refreshCookieOptions,
  REFRESH_COOKIE_NAME,
} from '../helpers/token.js';
import { env } from '../config/env.js';

/**
 * Persist a new refresh token hash on the user and prune expired/oversized sets.
 */
const storeRefreshToken = async (user, refreshToken) => {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + durationToMs(env.jwt.refreshExpiresIn));

  // Load with the (normally hidden) refresh_tokens field.
  const dbUser = await User.findById(user._id).select('+refresh_tokens');
  // Drop expired tokens, then cap to the 5 most recent sessions.
  dbUser.refresh_tokens = (dbUser.refresh_tokens || [])
    .filter((t) => t.expires_at.getTime() > Date.now())
    .slice(-4);
  dbUser.refresh_tokens.push({ token_hash: tokenHash, expires_at: expiresAt });
  await dbUser.save({ validateBeforeSave: false });
};

/**
 * Issue access + refresh tokens, set the refresh cookie, return the access token.
 */
const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await storeRefreshToken(user, refreshToken);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
};

/**
 * POST /api/v1/auth/register
 * Body: { full_name, email, password, phone? }
 * 201 → { user, accessToken }
 */
export const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({ full_name, email, password, phone, role: 'student' });

  const accessToken = await issueTokens(user, res);
  user.last_login_at = new Date();
  await user.save({ validateBeforeSave: false });

  return sendCreated(res, { user: user.toJSON(), accessToken }, 'Registration successful');
});

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 * 200 → { user, accessToken }
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password.');
  if (!user.is_active) throw ApiError.forbidden('Account is disabled.');

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password.');

  const accessToken = await issueTokens(user, res);
  user.last_login_at = new Date();
  await user.save({ validateBeforeSave: false });

  return sendOk(res, { user: user.toJSON(), accessToken }, 'Login successful');
});

/**
 * POST /api/v1/auth/refresh
 * Reads refresh token from the httpOnly cookie, rotates it, returns a new access token.
 * 200 → { accessToken }
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw ApiError.unauthorized('No refresh token provided.');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.sub).select('+refresh_tokens');
  if (!user || !user.is_active) throw ApiError.unauthorized('User not found or disabled.');

  const incomingHash = hashToken(token);
  const stored = (user.refresh_tokens || []).find((t) => t.token_hash === incomingHash);
  if (!stored || stored.expires_at.getTime() < Date.now()) {
    throw ApiError.unauthorized('Refresh token has been revoked or expired.');
  }

  // Rotate: remove the old token, issue a fresh pair.
  user.refresh_tokens = user.refresh_tokens.filter((t) => t.token_hash !== incomingHash);
  await user.save({ validateBeforeSave: false });

  const accessToken = await issueTokens(user, res);
  return sendOk(res, { accessToken }, 'Token refreshed');
});

/**
 * POST /api/v1/auth/logout
 * Revokes the current refresh token and clears the cookie.
 * 200 → {}
 */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.sub).select('+refresh_tokens');
      if (user) {
        const incomingHash = hashToken(token);
        user.refresh_tokens = (user.refresh_tokens || []).filter((t) => t.token_hash !== incomingHash);
        await user.save({ validateBeforeSave: false });
      }
    } catch {
      // token already invalid — nothing to revoke
    }
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
  return sendOk(res, null, 'Logged out');
});

/**
 * GET /api/v1/auth/me   (protected)
 * 200 → { user }
 */
export const me = asyncHandler(async (req, res) => {
  return sendOk(res, { user: req.user.toJSON() }, 'Current user');
});

/**
 * PATCH /api/v1/auth/change-password   (protected)
 * Body: { current_password, new_password }
 * Revokes all sessions after a successful change.
 * 200 → {}
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  const user = await User.findById(req.user._id).select('+password +refresh_tokens');
  const match = await user.comparePassword(current_password);
  if (!match) throw ApiError.unauthorized('Current password is incorrect.');

  user.password = new_password;
  user.refresh_tokens = []; // force re-login on all devices
  await user.save();

  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
  return sendOk(res, null, 'Password changed. Please log in again.');
});
