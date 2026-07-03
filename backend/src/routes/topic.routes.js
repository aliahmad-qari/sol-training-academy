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

const router = Router();

router.get('/', optionalAuth, listTopics);
router.get('/:id', optionalAuth, getTopic);

router.post('/', protect, authorize('admin', 'team_member'), createTopic);
router.patch('/reorder', protect, authorize('admin', 'team_member'), reorderTopics);
router.put('/:id', protect, authorize('admin', 'team_member'), updateTopic);
router.delete('/:id', protect, authorize('admin', 'team_member'), deleteTopic);

export default router;
