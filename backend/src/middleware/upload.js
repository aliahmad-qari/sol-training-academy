import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

/**
 * Multer configured with in-memory storage so we can stream buffers straight
 * to Cloudinary without writing to the ephemeral Render/Railway disk.
 */

const MB = 1024 * 1024;

// Reasonable default allow-list covering assignments + resources.
const DEFAULT_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'txt', 'csv', 'xlsx'];

// Video containers the admin curriculum uploader accepts. The frontend input
// uses accept="video/*", so anything beyond mp4 (e.g. .mov from iPhone/QuickTime,
// .webm, .mkv) must be allowed here or multer's fileFilter rejects it with a 400.
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'ogg', 'ogv'];

const buildFileFilter = (allowed) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.includes(ext)) return cb(null, true);
  return cb(ApiError.badRequest(`File type ".${ext}" is not allowed. Allowed: ${allowed.join(', ')}`));
};

/**
 * Factory: build an upload middleware.
 * @param {object} opts
 * @param {number} [opts.maxSizeMb=25]
 * @param {string[]} [opts.allowed=DEFAULT_EXTENSIONS]
 */
export const buildUploader = ({ maxSizeMb = 25, allowed = DEFAULT_EXTENSIONS } = {}) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMb * MB, files: 1 },
    fileFilter: buildFileFilter(allowed),
  });

// Common presets used by routes.
export const uploadSingleFile = buildUploader({ maxSizeMb: 25 }).single('file');
export const uploadImage = buildUploader({ maxSizeMb: 5, allowed: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }).single('file');
export const uploadResource = buildUploader({ maxSizeMb: 100 }).single('file');

/**
 * Dedicated course-video uploader.
 *  - 200 MB cap so large lesson videos don't trip LIMIT_FILE_SIZE (→ 400).
 *  - Accepts the file under EITHER form field name: "file" (current frontend)
 *    or "video" (defensive against a field-name mismatch → LIMIT_UNEXPECTED_FILE).
 * Because .fields() yields req.files (keyed by field), pair it with
 * normalizeSingleFile below so downstream controllers keep reading req.file.
 */
export const uploadVideo = buildUploader({ maxSizeMb: 200, allowed: VIDEO_EXTENSIONS }).fields([
  { name: 'file', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

/**
 * Bridge .fields() output → req.file. Picks whichever of the accepted field
 * names carried the upload so the rest of the pipeline is unchanged.
 */
export const normalizeSingleFile = (req, res, next) => {
  if (!req.file && req.files) {
    const picked = req.files.file?.[0] || req.files.video?.[0];
    if (picked) req.file = picked;
  }
  next();
};

/**
 * Wraps a multer middleware so its errors become clean ApiErrors.
 */
export const withMulter = (multerMw) => (req, res, next) => {
  multerMw(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return next(ApiError.badRequest('File too large.'));
      return next(ApiError.badRequest(err.message));
    }
    return next(err);
  });
};

export default buildUploader;
