import { Router } from 'express';
import {
  listEnrollments,
  getEnrollment,
  createEnrollment,
  bulkEnroll,
  updateProgress,
  updateEnrollment,
  deleteEnrollment,
} from '../controllers/enrollment.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listEnrollments);
router.post('/', authorize('admin', 'team_member'), createEnrollment);
router.post('/bulk', authorize('admin', 'team_member'), bulkEnroll);
router.get('/:id', getEnrollment);
router.patch('/:id/progress', updateProgress);
router.patch('/:id', authorize('admin', 'team_member'), updateEnrollment);
router.delete('/:id', authorize('admin', 'team_member'), deleteEnrollment);

export default router;
