import { Router } from 'express';
import {
  register,
  login,
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
  validateChangePassword,
} from '../validators/auth.validator.js';

const router = Router();

// Public (rate-limited) auth endpoints
router.post('/register', authLimiter, runValidator(validateRegister), register);
router.post('/login', authLimiter, runValidator(validateLogin), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);

// Protected
router.get('/me', protect, me);
router.patch('/change-password', protect, runValidator(validateChangePassword), changePassword);

export default router;
