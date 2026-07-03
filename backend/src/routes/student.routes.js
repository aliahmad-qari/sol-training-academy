import { Router } from 'express';
import { studentOverview } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/overview', studentOverview);

export default router;
