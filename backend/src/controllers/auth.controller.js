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
import { sendEmail } from '../services/email/email.service.js';
import { otpEmail, resetPasswordEmail } from '../services/email/email.templates.js';
import { logger } from '../utils/logger.js';

/**
 * Generate a fresh OTP for a user, persist it, and email it.
 * Shared by register / login-gate / resend so the behaviour stays identical.
 */
const issueOtp = async (user) => {
  const code = user.generateOtp();
  await user.save({ validateBeforeSave: false });
  await sendEmail({ to: user.email, ...otpEmail({ name: user.full_name, code }) });
};

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
 *
 * New accounts start UNVERIFIED — no JWT is issued here. We generate a 6-digit
 * OTP (10-min expiry), email it, and return a pending-verification state. The
 * client then completes sign-up via POST /verify-otp.
 *
 * 201 → { email, pending_verification: true }
 */
export const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({
    full_name,
    email,
    password,
    phone,
    role: 'student',
    is_verified: false,
  });

  await issueOtp(user);

  return sendCreated(
    res,
    { email: user.email, pending_verification: true },
    'Verification code sent to your email.'
  );
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

  // Gate unverified accounts: re-issue a fresh OTP and tell the client to send
  // the user to the verification screen. Existing accounts predating email
  // verification are backfilled to is_verified:true (see migrate:verified),
  // so this only affects genuinely-unverified new sign-ups.
  if (!user.is_verified) {
    await issueOtp(user);
    throw new ApiError(403, 'Please verify your email to continue. We sent you a new code.', {
      pending_verification: true,
      email: user.email,
    });
  }

  const accessToken = await issueTokens(user, res);
  user.last_login_at = new Date();
  await user.save({ validateBeforeSave: false });

  return sendOk(res, { user: user.toJSON(), accessToken }, 'Login successful');
});

/**
 * POST /api/v1/auth/verify-otp
 * Body: { email, otp }
 * Validates the 6-digit code; on success flips is_verified and issues tokens.
 * 200 → { user, accessToken }
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp_code +otp_expires');
  // Generic error throughout to avoid leaking which accounts exist / their state.
  if (!user) throw ApiError.badRequest('Invalid or expired verification code.');
  if (!user.is_active) throw ApiError.forbidden('Account is disabled.');

  if (user.is_verified) {
    // Already verified — nothing to do, but let them proceed to login cleanly.
    throw ApiError.badRequest('This account is already verified. Please log in.');
  }

  if (!user.verifyOtp(otp)) {
    throw ApiError.badRequest('Invalid or expired verification code.');
  }

  user.is_verified = true;
  user.clearOtp();
  user.last_login_at = new Date();

  const accessToken = await issueTokens(user, res);
  await user.save({ validateBeforeSave: false });

  return sendOk(res, { user: user.toJSON(), accessToken }, 'Email verified. Welcome!');
});

/**
 * POST /api/v1/auth/resend-otp
 * Body: { email }
 * Regenerates + resends an OTP for an unverified account. Always responds 200
 * with a generic message (no account enumeration).
 * 200 → {}
 */
export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user && user.is_active && !user.is_verified) {
    await issueOtp(user);
  }

  return sendOk(
    res,
    null,
    'If an unverified account exists for that email, a new code has been sent.'
  );
});

/**
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 * Emails a tokenized reset link if the account exists. Always responds 200 with
 * a generic message (no account enumeration).
 * 200 → {}
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user && user.is_active) {
    const token = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const url = `${env.clientUrl}/reset-password?token=${token}`;
    try {
      await sendEmail({ to: user.email, ...resetPasswordEmail({ name: user.full_name, url }) });
    } catch (err) {
      // Roll back the token so a failed send doesn't leave a dangling reset.
      user.clearPasswordReset();
      await user.save({ validateBeforeSave: false });
      logger.error('[auth] Failed to send reset email:', err);
      throw err;
    }
  }

  return sendOk(
    res,
    null,
    'If an account exists for that email, a password reset link has been sent.'
  );
});

/**
 * POST /api/v1/auth/reset-password
 * Body: { token, new_password }
 * Validates the reset token, sets the new password, and revokes all sessions.
 * 200 → {}
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, new_password } = req.body;

  const tokenHash = User.hashResetToken(token);
  const user = await User.findOne({
    reset_password_token: tokenHash,
    reset_password_expires: { $gt: new Date() },
  }).select('+refresh_tokens');

  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired.');

  user.password = new_password; // pre-save hook re-hashes
  user.clearPasswordReset();
  user.refresh_tokens = []; // force re-login on all devices
  // A password reset via a verified email link also confirms ownership.
  user.is_verified = true;
  await user.save();

  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
  return sendOk(res, null, 'Password reset successful. Please log in with your new password.');
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
