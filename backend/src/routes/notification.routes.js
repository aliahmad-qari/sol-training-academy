import { Router } from 'express';
import {
  createNotification,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getUserNotifications);
router.post('/', authorize('admin', 'team_member'), authorizePage('announcements', 'support'), createNotification);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
