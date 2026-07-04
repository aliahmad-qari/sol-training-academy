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
  // Course videos are streamed by Cloudinary — force the `video` resource type
  // so transformations/streaming URLs (…/video/upload/…) are generated.
  video: { folder: 'course-videos', resourceType: 'video' },
};

/**
 * Kinds a regular authenticated user (student) is allowed to upload.
 * Deliberately excludes staff-only kinds like `thumbnail`/`video`.
 */
const STUDENT_KIND_CONFIG = {
  document: { folder: 'student-documents', resourceType: 'auto' },
  request_attachment: { folder: 'student-requests', resourceType: 'auto' },
  assignment: { folder: 'assignment-submissions', resourceType: 'auto' },
  avatar: { folder: 'avatars', resourceType: 'image' },
};

/**
 * Shared handler: validate the requested kind against a config map, stream the
 * buffer to Cloudinary, and return a stable response shape. The `file_url`
 * alias is included so the frontend upload helper can read a single field
 * regardless of endpoint.
 */
const handleUpload = async (req, res, configMap) => {
  const { kind } = req.params;
  const config = configMap[kind];
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
      file_url: result.url, // alias — matches the frontend uploadFile() contract
      publicId: result.publicId,
      bytes: result.bytes,
      format: result.format,
      resourceType: result.resourceType,
      file_name: req.file.originalname,
    },
    'File uploaded'
  );
};

/**
 * POST /api/v1/uploads/:kind   (protected; admin/team_member)
 * multipart/form-data field "file"
 * 201 → { url, file_url, publicId, bytes, format, file_name }
 */
export const uploadFile = asyncHandler((req, res) => handleUpload(req, res, KIND_CONFIG));

/**
 * POST /api/v1/uploads/me/:kind   (protected; any authenticated user)
 * Student-safe upload for compliance documents and request attachments.
 * Restricted to STUDENT_KIND_CONFIG so students can't write to staff folders.
 */
export const uploadFileAsStudent = asyncHandler((req, res) =>
  handleUpload(req, res, STUDENT_KIND_CONFIG)
);
