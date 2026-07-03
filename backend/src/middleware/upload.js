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
