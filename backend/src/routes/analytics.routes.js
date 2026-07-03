import { Router } from 'express';
import {
  revenueByMonth,
  enrollmentsByCourse,
  topCourses,
  catalogueSummary,
} from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin', 'team_member'));

router.get('/revenue', revenueByMonth);
router.get('/enrollments', enrollmentsByCourse);
router.get('/top-courses', topCourses);
router.get('/summary', catalogueSummary);

export default router;
