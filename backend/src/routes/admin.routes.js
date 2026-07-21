import { Router } from 'express';
import { adminOverview, adminRecent } from '../controllers/dashboard.controller.js';
import {
  revenueByMonth,
  enrollmentsByCourse,
  topCourses,
  catalogueSummary,
} from '../controllers/analytics.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

// All admin routes require staff privileges.
router.use(protect, authorize('admin', 'team_member'));

router.get('/overview', adminOverview);
router.get('/recent', adminRecent);

// Analytics live under /admin/analytics as well as the top-level /analytics.
router.get('/analytics/revenue', authorizePage('analytics', 'revenue'), revenueByMonth);
router.get('/analytics/enrollments', authorizePage('analytics'), enrollmentsByCourse);
router.get('/analytics/top-courses', authorizePage('analytics'), topCourses);
router.get('/analytics/summary', authorizePage('analytics'), catalogueSummary);

export default router;
