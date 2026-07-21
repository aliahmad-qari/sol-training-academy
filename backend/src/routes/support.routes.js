import { Router } from 'express';
import {
  listTickets,
  getTicket,
  createTicket,
  replyToTicket,
  updateTicket,
} from '../controllers/support.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', authorizePage('support'), listTickets);
router.post('/', createTicket);
router.get('/:id', authorizePage('support'), getTicket);
router.post('/:id/reply', authorizePage('support'), replyToTicket);
router.patch('/:id', authorize('admin', 'team_member'), authorizePage('support'), updateTicket);

export default router;
