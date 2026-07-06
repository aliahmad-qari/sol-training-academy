/**
 * uploadClient.js — Signed Direct-to-Cloudinary upload.
 *
 * Architecture (Render memory-safe):
 *   1. Frontend requests a short-lived HMAC signature from our Express backend.
 *      → GET /api/v1/uploads/sign-cloudinary?kind=video
 *      → Backend calls cloudinary.utils.api_sign_request() — no bytes involved.
 *
 *   2. Frontend POSTs the binary file DIRECTLY to Cloudinary's upload API
 *      using that signature. Render never loads the file into RAM.
 *      → POST https://api.cloudinary.com/v1_1/<cloudName>/<resourceType>/upload
 *
 *   3. Cloudinary returns { secure_url, public_id, bytes, format, ... }
 *      which we normalise into the same { file_url, publicId, ... } shape
 *      used everywhere else in the codebase — callers need zero changes.
 *
 * Non-video uploads (documents, avatars, thumbnails ≤ 25 MB) still go through
 * the backend via the legacy `uploadFileDirect` export — they are small enough
 * that the proxy path is fine and keeps the flow simple.
 *
 * Public API:
 *   import { uploadFile } from "@/api/uploadClient";
 *   const { file_url, publicId } = await uploadFile({ file, kind: "video", onProgress });
 */
import axios from 'axios';
import apiClient from '@/api/apiClient';

// Kinds that bypass Render and go direct to Cloudinary (large binary assets).
const DIRECT_KINDS = new Set(['video', 'resource', 'reading', 'assignment_brief', 'thumbnail']);

// Kinds a student submits — must go through the backend /uploads/me/:kind route.
const STUDENT_KINDS = new Set(['document', 'request_attachment', 'assignment', 'avatar']);

/**
 * Upload a single File to Cloudinary.
 *
 * For large/video kinds: fetches a signed upload token from the backend, then
 * POSTs the file directly to Cloudinary — Render RAM is never touched.
 *
 * For small student kinds: proxies through the backend (≤ 25 MB, safe).
 *
 * @param {object}                    params
 * @param {File}                      params.file        Browser File object.
 * @param {string}                   [params.kind]       Upload category.
 *   Staff direct kinds : video, resource, reading, assignment_brief, thumbnail
 *   Student proxy kinds: document, request_attachment, assignment, avatar
 * @param {(pct: number) => void}    [params.onProgress] Progress callback 0–100.
 * @returns {Promise<{
 *   file_url:     string,   // secure Cloudinary URL (primary field)
 *   url:          string,   // alias for file_url
 *   publicId:     string,
 *   bytes:        number,
 *   format:       string,
 *   resourceType: string,
 *   file_name:    string,
 * }>}
 */
export async function uploadFile({ file, kind = 'resource', onProgress } = {}) {
  if (!file) throw new Error('uploadFile: a `file` is required.');

  // ── Student proxy path (small files, backend-buffered) ──────────────────
  if (STUDENT_KINDS.has(kind)) {
    return uploadViaProxy({ file, path: `/uploads/me/${kind}`, onProgress });
  }

  // ── Signed direct-to-Cloudinary path (large files, zero Render RAM) ─────
  if (DIRECT_KINDS.has(kind)) {
    return uploadDirect({ file, kind, onProgress });
  }

  // Unknown kinds fall back to the proxy (safe default).
  return uploadViaProxy({ file, path: `/uploads/${kind}`, onProgress });
}

// ── Internal: signed direct upload ─────────────────────────────────────────

async function uploadDirect({ file, kind, onProgress }) {
  // Step 1 — fetch a short-lived signature from our backend.
  // The backend signs {folder, resource_type, timestamp} with the Cloudinary
  // API secret. No file bytes are involved here.
  const { data: sigData } = await apiClient.get(
    `/uploads/sign-cloudinary?kind=${encodeURIComponent(kind)}`
  );
  const { signature, timestamp, apiKey, cloudName, folder, resourceType } =
    sigData.data;

  // Step 2 — build the FormData payload for Cloudinary's upload API.
  // The Content-Type boundary is set automatically by the browser — do NOT
  // set it manually or the boundary will be stripped and the upload will fail.
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);
  form.append('resource_type', resourceType);

  // Step 3 — POST directly to Cloudinary.
  // We use a plain axios instance (not apiClient) so our JWT interceptors and
  // base URL don't interfere with the external Cloudinary endpoint.
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const { data: result } = await axios.post(cloudinaryUrl, form, {
    timeout: 0, // large videos can take minutes — no timeout
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  // Normalise Cloudinary's response into our standard upload shape.
  return normalise(result, file.name);
}

// ── Internal: proxy upload through backend ──────────────────────────────────

async function uploadViaProxy({ file, path, onProgress }) {
  const form = new FormData();
  form.append('file', file);

  const { data } = await apiClient.post(path, form, {
    // Let the browser set the multipart/form-data boundary automatically.
    // Setting Content-Type manually strips the boundary → multer reads 0 bytes.
    headers: { 'Content-Type': undefined },
    timeout: 0,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  // Backend wraps in { success, message, data }.
  return data.data;
}

// ── Normalise Cloudinary's raw response into our stable shape ───────────────

function normalise(result, originalName) {
  const url = result.secure_url || result.url || '';
  return {
    file_url:     url,           // primary field used throughout the codebase
    url,                         // alias
    publicId:     result.public_id,
    bytes:        result.bytes,
    format:       result.format,
    resourceType: result.resource_type,
    file_name:    originalName,
  };
}

export default uploadFile;
