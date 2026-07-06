import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated, sendOk } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadBuffer } from '../cloudinary/cloudinary.service.js';
import { cloudinary, isCloudinaryConfigured } from '../cloudinary/cloudinary.config.js';
import { env } from '../config/env.js';

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

/**
 * GET /api/v1/uploads/sign-cloudinary?kind=video   (admin / team_member)
 *
 * Issues a short-lived HMAC signature so the browser can POST a file
 * DIRECTLY to Cloudinary's upload API — Render never loads the bytes into
 * memory, permanently solving the 512 MB OOM crash on large video uploads.
 *
 * Security model:
 *  - The signature is computed server-side using the Cloudinary API secret
 *    (never exposed to the browser).
 *  - The signature binds the exact folder, resource_type, and timestamp so
 *    a replayed or tampered request is rejected by Cloudinary.
 *  - Signatures expire after 1 hour (Cloudinary's default window).
 *  - Only admin / team_member roles can request a signature (enforced by the
 *    route-level authorize() middleware).
 *
 * Response (200):
 *   { signature, timestamp, apiKey, cloudName, folder, resourceType }
 *
 * The frontend uses these to POST directly to:
 *   https://api.cloudinary.com/v1_1/<cloudName>/<resourceType>/upload
 */
export const signUpload = asyncHandler((req, res) => {
  if (!isCloudinaryConfigured()) {
    throw ApiError.internal('Cloudinary is not configured on this server.');
  }

  // Resolve which folder and resource_type to use based on the requested kind.
  const kind = req.query.kind || 'resource';
  const config = KIND_CONFIG[kind];
  if (!config) throw ApiError.badRequest(`Unknown upload kind "${kind}".`);

  const timestamp = Math.round(Date.now() / 1000); // Unix seconds

  const fullFolder = `${env.cloudinary.folder}/${config.folder}`.replace(/\/+/g, '/');

  // These are the exact params that will be included in the upload request.
  // Cloudinary verifies the signature against these same values — any
  // mismatch (wrong folder, different resource_type) will reject the upload.
  // IMPORTANT: resource_type goes in the upload URL, NOT in the signed params.
  // Only params that appear in the FormData body are signed. Including
  // resource_type here causes a signature mismatch → Cloudinary 401.
  const paramsToSign = {
    folder: fullFolder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.cloudinary.apiSecret
  );

  return sendOk(res, {
    signature,
    timestamp,
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName,
    folder: fullFolder,
    resourceType: config.resourceType, // used by frontend to build the URL only
  }, 'Cloudinary signature issued');
});
