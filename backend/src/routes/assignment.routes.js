import { Router } from 'express';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listAssignments);
router.post('/', authorize('admin', 'team_member'), createAssignment);
router.get('/:id', getAssignment);
router.put('/:id', authorize('admin', 'team_member'), updateAssignment);
router.delete('/:id', authorize('admin', 'team_member'), deleteAssignment);

export default router;
