import { Router } from 'express';
import { uploadFile, uploadFileAsStudent } from '../controllers/upload.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  uploadResource,
  uploadSingleFile,
  uploadVideo,
  normalizeSingleFile,
  withMulter,
} from '../middleware/upload.js';

const router = Router();

/**
 * Dedicated course-video upload endpoint.
 * POST /api/v1/uploads/video   (admin/team_member)
 * multipart/form-data field "file" OR "video"
 *
 * Declared BEFORE '/:kind' so the literal "video" segment is not captured by
 * the :kind param (which would route it through the 100 MB / mp4-only generic
 * handler). 200 MB cap + full video-container allow-list live in uploadVideo.
 * `kind` is forced to 'video' so the controller uses the course-videos folder
 * and resource_type: 'video'.
 */
router.post(
  '/video',
  protect,
  authorize('admin', 'team_member'),
  withMulter(uploadVideo),
  normalizeSingleFile,
  (req, res, next) => {
    req.params.kind = 'video';
    next();
  },
  uploadFile
);

/**
 * Student-facing upload endpoint for compliance documents and request
 * attachments (kinds restricted server-side to STUDENT_KIND_CONFIG).
 * Any authenticated user may call this. Declared BEFORE '/:kind' so that
 * the literal "me" segment is not swallowed by the :kind param.
 * 25 MB cap (uploadSingleFile) — no large video uploads on the student path.
 */
router.post(
  '/me/:kind',
  protect,
  withMulter(uploadSingleFile),
  uploadFileAsStudent
);

/**
 * Generic staff upload endpoint for course resources, briefs, reading files,
 * thumbnails, and course videos. Student-facing assignment submission uploads
 * are handled by the submissions route (Module 10) so they attach to a record.
 * 100 MB cap (uploadResource) to accommodate course video files.
 */
router.post(
  '/:kind',
  protect,
  authorize('admin', 'team_member'),
  withMulter(uploadResource),
  uploadFile
);

export default router;
