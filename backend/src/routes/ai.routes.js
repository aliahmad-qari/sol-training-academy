import { Router } from 'express';
import { runStudentTool, runAdminTool, extractDocument } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

/**
 * AI tool routes. All require authentication. A dedicated per-user rate limiter
 * (aiLimiter) protects the Gemini free-tier quota and returns a clean 429
 * instead of letting a burst crash on a provider quota error.
 */
const router = Router();

router.use(protect);

// Document text extraction (used by the two upload-based tools) — any authed user.
router.post('/extract', aiLimiter, extractDocument);

// Student tools — any authenticated user.
router.post('/student/:toolId', aiLimiter, runStudentTool);

// Admin tools — staff only.
router.post('/admin/:toolId', authorize('admin', 'team_member'), aiLimiter, runAdminTool);

export default router;
