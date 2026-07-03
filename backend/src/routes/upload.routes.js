import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadResource, withMulter } from '../middleware/upload.js';

const router = Router();

/**
 * Generic staff upload endpoint for course resources, briefs, reading files,
 * thumbnails, and avatars. Student-facing assignment submission uploads are
 * handled by the submissions route (Module 10) so they attach to a record.
 */
router.post(
  '/:kind',
  protect,
  authorize('admin', 'team_member'),
  withMulter(uploadResource),
  uploadFile
);

export default router;
