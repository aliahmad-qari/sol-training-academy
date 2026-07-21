import { Router } from 'express';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', authorizePage('assessments', 'gradebook'), listAssignments);
router.post('/', authorize('admin', 'team_member'), authorizePage('assessments'), createAssignment);
router.get('/:id', getAssignment);
router.put('/:id', authorize('admin', 'team_member'), authorizePage('assessments'), updateAssignment);
router.delete('/:id', authorize('admin', 'team_member'), authorizePage('assessments'), deleteAssignment);

export default router;
