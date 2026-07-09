import { Router } from 'express';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listAnnouncements);
router.post('/', protect, authorize('admin', 'team_member'), createAnnouncement);
router.patch('/:id', protect, authorize('admin', 'team_member'), updateAnnouncement);
router.delete('/:id', protect, authorize('admin', 'team_member'), deleteAnnouncement);

export default router;
