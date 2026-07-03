import { Router } from 'express';
import { adminOverview, adminRecent } from '../controllers/dashboard.controller.js';
import {
  revenueByMonth,
  enrollmentsByCourse,
  topCourses,
  catalogueSummary,
} from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require staff privileges.
router.use(protect, authorize('admin', 'team_member'));

router.get('/overview', adminOverview);
router.get('/recent', adminRecent);

// Analytics live under /admin/analytics as well as the top-level /analytics.
router.get('/analytics/revenue', revenueByMonth);
router.get('/analytics/enrollments', enrollmentsByCourse);
router.get('/analytics/top-courses', topCourses);
router.get('/analytics/summary', catalogueSummary);

export default router;
