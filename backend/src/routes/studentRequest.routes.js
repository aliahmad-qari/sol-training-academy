import { Router } from 'express';
import {
  listRequests,
  createRequest,
  updateRequest,
  deleteRequest,
} from '../controllers/studentRequest.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listRequests);
router.post('/', createRequest);
router.patch('/:id', authorize('admin', 'team_member'), updateRequest);
router.delete('/:id', deleteRequest);

export default router;
