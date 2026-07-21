import { Router } from 'express';
import {
  listEnrollments,
  getEnrollment,
  createEnrollment,
  bulkEnroll,
  updateProgress,
  updateEnrollment,
  runExpiryReminders,
  deleteEnrollment,
} from '../controllers/enrollment.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', authorizePage('students', 'expiry'), listEnrollments);
router.post('/', authorize('admin', 'team_member'), authorizePage('students'), createEnrollment);
router.post('/bulk', authorize('admin', 'team_member'), authorizePage('students'), bulkEnroll);
router.post('/expiry-reminders', authorize('admin', 'team_member'), authorizePage('expiry'), runExpiryReminders);
router.get('/:id', getEnrollment);
router.patch('/:id/progress', updateProgress);
router.patch('/:id', authorize('admin', 'team_member'), authorizePage('students', 'expiry'), updateEnrollment);
router.delete('/:id', authorize('admin', 'team_member'), authorizePage('students'), deleteEnrollment);

export default router;
