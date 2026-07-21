import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getThread,
  sendMessage,
  unreadCounts,
  adminListAll,
} from '../controllers/directMessage.controller.js';

const router = Router();

router.use(protect);

router.get('/unread-counts', unreadCounts);   // GET  /direct-messages/unread-counts
router.get('/admin',         authorize('admin', 'team_member'), adminListAll); // GET /direct-messages/admin
router.get('/',              getThread);       // GET  /direct-messages?course_id=&other_user_id=
router.post('/',             sendMessage);     // POST /direct-messages

export default router;
