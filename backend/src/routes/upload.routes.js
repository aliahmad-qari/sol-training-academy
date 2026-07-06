import { Router } from 'express';
import { uploadFile, uploadFileAsStudent, signUpload } from '../controllers/upload.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  uploadResource,
  uploadSingleFile,
  withMulter,
} from '../middleware/upload.js';

const router = Router();

// ── Signed direct-to-Cloudinary upload (staff videos & large files) ─────────
//
// GET /api/v1/uploads/sign-cloudinary?kind=video   (admin / team_member)
//
// Returns a short-lived HMAC signature so the browser can POST the file
// directly to Cloudinary's API without routing the bytes through Render.
// Render never loads the binary into memory → no 512 MB OOM crash.
// Must be declared BEFORE '/:kind' so "sign-cloudinary" isn't treated as a kind.
router.get(
  '/sign-cloudinary',
  protect,
  authorize('admin', 'team_member'),
  signUpload
);

// ── Student-facing upload (documents / attachments — ≤25 MB) ────────────────
// Declared BEFORE '/:kind' so the literal "me" segment isn't captured by :kind.
router.post(
  '/me/:kind',
  protect,
  withMulter(uploadSingleFile),
  uploadFileAsStudent
);

// ── Generic staff upload for non-video kinds (resource, thumbnail, reading) ──
// Videos must use the signed direct-upload flow above — this route is
// intentionally left for small binary assets only (≤200 MB via uploadResource).
router.post(
  '/:kind',
  protect,
  authorize('admin', 'team_member'),
  withMulter(uploadResource),
  uploadFile
);

export default router;
