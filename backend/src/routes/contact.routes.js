import { Router } from 'express';
import { submitContactEnquiry } from '../controllers/contact.controller.js';
import { contactLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', contactLimiter, submitContactEnquiry);

export default router;
