import validator from 'validator';
import { fieldError } from './validate.js';

/**
 * Validate + normalize the registration payload.
 */
export const validateRegister = (body) => {
  const errors = [];
  const value = {};

  const fullName = String(body.full_name || '').trim();
  if (fullName.length < 2) errors.push(fieldError('full_name', 'Full name must be at least 2 characters.'));
  value.full_name = fullName;

  const email = String(body.email || '').trim().toLowerCase();
  if (!validator.isEmail(email)) errors.push(fieldError('email', 'A valid email is required.'));
  value.email = email;

  const password = String(body.password || '');
  if (password.length < 8) errors.push(fieldError('password', 'Password must be at least 8 characters.'));
  value.password = password;

  if (body.phone !== undefined) value.phone = String(body.phone).trim();

  // Role is NOT accepted from the client on public register (defaults to student).
  // Admin creation happens via seed script or admin-only endpoints.
  return { value, errors };
};

/**
 * Validate the login payload.
 */
export const validateLogin = (body) => {
  const errors = [];
  const value = {};

  const email = String(body.email || '').trim().toLowerCase();
  if (!validator.isEmail(email)) errors.push(fieldError('email', 'A valid email is required.'));
  value.email = email;

  const password = String(body.password || '');
  if (password.length === 0) errors.push(fieldError('password', 'Password is required.'));
  value.password = password;

  return { value, errors };
};

/**
 * Validate the OTP-verification payload: { email, otp }.
 */
export const validateVerifyOtp = (body) => {
  const errors = [];
  const value = {};

  const email = String(body.email || '').trim().toLowerCase();
  if (!validator.isEmail(email)) errors.push(fieldError('email', 'A valid email is required.'));
  value.email = email;

  const otp = String(body.otp || '').trim();
  if (!/^\d{6}$/.test(otp)) errors.push(fieldError('otp', 'Enter the 6-digit code.'));
  value.otp = otp;

  return { value, errors };
};

/**
 * Validate an email-only payload (forgot-password / resend-otp).
 */
export const validateEmailOnly = (body) => {
  const errors = [];
  const value = {};

  const email = String(body.email || '').trim().toLowerCase();
  if (!validator.isEmail(email)) errors.push(fieldError('email', 'A valid email is required.'));
  value.email = email;

  return { value, errors };
};

/**
 * Validate the reset-password payload: { token, new_password }.
 */
export const validateResetPassword = (body) => {
  const errors = [];
  const value = {};

  value.token = String(body.token || '').trim();
  if (value.token.length === 0) errors.push(fieldError('token', 'A reset token is required.'));

  value.new_password = String(body.new_password || '');
  if (value.new_password.length < 8) {
    errors.push(fieldError('new_password', 'New password must be at least 8 characters.'));
  }

  return { value, errors };
};

/**
 * Validate a password-change payload (authenticated user).
 */
export const validateChangePassword = (body) => {
  const errors = [];
  const value = {};

  value.current_password = String(body.current_password || '');
  if (value.current_password.length === 0) {
    errors.push(fieldError('current_password', 'Current password is required.'));
  }
  value.new_password = String(body.new_password || '');
  if (value.new_password.length < 8) {
    errors.push(fieldError('new_password', 'New password must be at least 8 characters.'));
  }
  return { value, errors };
};
