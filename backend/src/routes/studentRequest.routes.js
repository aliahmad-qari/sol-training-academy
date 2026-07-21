import { Router } from 'express';
import {
  listRequests,
  createRequest,
  updateRequest,
  deleteRequest,
} from '../controllers/studentRequest.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', authorizePage('requests', 'support'), listRequests);
router.post('/', createRequest);
router.patch('/:id', authorize('admin', 'team_member'), authorizePage('requests', 'support'), updateRequest);
router.delete('/:id', authorizePage('requests', 'support'), deleteRequest);

export default router;
