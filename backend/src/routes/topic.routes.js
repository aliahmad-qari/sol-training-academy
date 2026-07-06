import { Router } from 'express';
import {
  listTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} from '../controllers/topic.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { checkCourseAccess } from '../middleware/checkCourseAccess.js';

const router = Router();

// Enrollment-gated: only staff or students enrolled in the queried course may
// list topics (protects paid Cloudinary video/reading URLs from harvesting).
router.get('/', optionalAuth, checkCourseAccess, listTopics);
router.get('/:id', optionalAuth, getTopic);

router.post('/', protect, authorize('admin', 'team_member'), createTopic);
router.patch('/reorder', protect, authorize('admin', 'team_member'), reorderTopics);
router.put('/:id', protect, authorize('admin', 'team_member'), updateTopic);
router.delete('/:id', protect, authorize('admin', 'team_member'), deleteTopic);

export default router;
