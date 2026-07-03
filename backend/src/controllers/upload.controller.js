import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadBuffer } from '../cloudinary/cloudinary.service.js';

/**
 * Map a requested upload "kind" to a Cloudinary subfolder + resource type.
 * `raw` is used for documents/archives so Cloudinary serves them as files.
 */
const KIND_CONFIG = {
  resource: { folder: 'course-resources', resourceType: 'auto' },
  assignment_brief: { folder: 'assignment-briefs', resourceType: 'auto' },
  reading: { folder: 'reading-materials', resourceType: 'auto' },
  avatar: { folder: 'avatars', resourceType: 'image' },
  thumbnail: { folder: 'course-thumbnails', resourceType: 'image' },
};

/**
 * POST /api/v1/uploads/:kind   (protected; admin/team_member)
 * multipart/form-data field "file"
 * 201 → { url, publicId, bytes, format, file_name }
 */
export const uploadFile = asyncHandler(async (req, res) => {
  const { kind } = req.params;
  const config = KIND_CONFIG[kind];
  if (!config) throw ApiError.badRequest(`Unknown upload kind "${kind}".`);
  if (!req.file) throw ApiError.badRequest('No file provided. Use form field "file".');

  const result = await uploadBuffer(req.file.buffer, {
    folder: config.folder,
    resourceType: config.resourceType,
    filename: req.file.originalname,
  });

  return sendCreated(
    res,
    {
      url: result.url,
      publicId: result.publicId,
      bytes: result.bytes,
      format: result.format,
      resourceType: result.resourceType,
      file_name: req.file.originalname,
    },
    'File uploaded'
  );
});
