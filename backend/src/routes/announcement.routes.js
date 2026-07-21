import { Router } from 'express';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller.js';
import { protect, authorize, optionalAuth, authorizePage } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listAnnouncements);
router.post('/', protect, authorize('admin', 'team_member'), authorizePage('announcements'), createAnnouncement);
router.patch('/:id', protect, authorize('admin', 'team_member'), authorizePage('announcements'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin', 'team_member'), authorizePage('announcements'), deleteAnnouncement);

export default router;
