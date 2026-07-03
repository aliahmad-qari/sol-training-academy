import { Router } from 'express';
import {
  listTickets,
  getTicket,
  createTicket,
  replyToTicket,
  updateTicket,
} from '../controllers/support.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listTickets);
router.post('/', createTicket);
router.get('/:id', getTicket);
router.post('/:id/reply', replyToTicket);
router.patch('/:id', authorize('admin', 'team_member'), updateTicket);

export default router;
