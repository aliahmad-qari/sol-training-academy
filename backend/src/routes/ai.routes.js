import { Router } from 'express';
import {
  runStudentTool,
  runAdminTool,
  extractDocument,
  runChatAssistant,
} from '../controllers/ai.controller.js';
import { protect, authorize, optionalAuth, authorizePage } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

/**
 * AI tool routes. A dedicated per-user/IP rate limiter (aiLimiter) protects the
 * Groq quota and returns a clean 429 instead of letting a burst crash on a
 * provider quota error.
 */
const router = Router();

// --------------------------------------------------------------------------
//  PUBLIC: SOL Assistant chat. Mounted BEFORE `protect` so logged-out visitors
//  on the marketing pages can use it. `optionalAuth` enriches req.user (and
//  therefore the rate-limit key) when a token is present, but never rejects.
// --------------------------------------------------------------------------
router.post('/chat', optionalAuth, aiLimiter, runChatAssistant);

// Everything below requires authentication.
router.use(protect);

// Document text extraction (used by the two upload-based tools) — any authenticated user.
router.post('/extract', aiLimiter, extractDocument);

// Student tools — any authenticated user.
router.post('/student/:toolId', aiLimiter, runStudentTool);

// Admin tools — staff only.
router.post('/admin/:toolId', authorize('admin', 'team_member'), authorizePage('aitools'), aiLimiter, runAdminTool);

export default router;
