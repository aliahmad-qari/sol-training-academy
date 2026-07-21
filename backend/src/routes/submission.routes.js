import { Router } from 'express';
import {
  createSubmission,
  getSubmissionAccess,
  listSubmissions,
  getSubmission,
  gradeSubmission,
  replyToSubmission,
  deleteSubmission,
} from '../controllers/submission.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';
import { uploadSingleFile, withMulter } from '../middleware/upload.js';

const router = Router();

router.use(protect);

router.post('/access', getSubmissionAccess);
router.get('/', authorizePage('gradebook', 'assessments'), listSubmissions);
router.post('/', withMulter(uploadSingleFile), createSubmission);
router.get('/:id', getSubmission);
router.patch('/:id/grade', authorize('admin', 'team_member'), authorizePage('gradebook'), gradeSubmission);
router.post('/:id/reply', authorizePage('gradebook', 'assessments'), replyToSubmission);
router.delete('/:id', deleteSubmission);

export default router;
