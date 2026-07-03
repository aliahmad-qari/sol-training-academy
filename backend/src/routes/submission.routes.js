import { Router } from 'express';
import {
  createSubmission,
  listSubmissions,
  getSubmission,
  gradeSubmission,
  deleteSubmission,
} from '../controllers/submission.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingleFile, withMulter } from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.get('/', listSubmissions);
router.post('/', withMulter(uploadSingleFile), createSubmission);
router.get('/:id', getSubmission);
router.patch('/:id/grade', authorize('admin', 'team_member'), gradeSubmission);
router.delete('/:id', deleteSubmission);

export default router;
