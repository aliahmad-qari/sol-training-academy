import { Router } from 'express';
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  me,
  changePassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { runValidator } from '../validators/validate.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateEmailOnly,
  validateResetPassword,
  validateChangePassword,
} from '../validators/auth.validator.js';

const router = Router();

// Public (rate-limited) auth endpoints
router.post('/register', authLimiter, runValidator(validateRegister), register);
router.post('/login', authLimiter, runValidator(validateLogin), login);
router.post('/verify-otp', authLimiter, runValidator(validateVerifyOtp), verifyOtp);
router.post('/resend-otp', authLimiter, runValidator(validateEmailOnly), resendOtp);
router.post('/forgot-password', authLimiter, runValidator(validateEmailOnly), forgotPassword);
router.post('/reset-password', authLimiter, runValidator(validateResetPassword), resetPassword);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);

// Protected
router.get('/me', protect, me);
router.patch('/change-password', protect, runValidator(validateChangePassword), changePassword);

export default router;
