import { Router } from 'express';
import {
  createNotification,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
} from '../controllers/notification.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getUserNotifications);
router.post('/', authorize('admin', 'team_member'), createNotification);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
