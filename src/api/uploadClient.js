/**
 * uploadClient.js — Signed Direct-to-Cloudinary upload.
 *
 * Architecture (Render memory-safe):
 *   1. Frontend requests a short-lived HMAC signature from our Express backend.
 *      → GET /api/v1/uploads/sign-cloudinary?kind=video
 *      → Backend signs { folder, timestamp } with the Cloudinary API secret.
 *
 *   2. Frontend POSTs the binary file DIRECTLY to Cloudinary's upload API
 *      using that signature. Render never loads the file into RAM.
 *      → POST https://api.cloudinary.com/v1_1/<cloudName>/<resourceType>/upload
 *
 *   3. Cloudinary returns { secure_url, public_id, bytes, format, ... }
 *      normalised into { file_url, publicId, ... } — callers need zero changes.
 *
 * Non-video uploads (documents, avatars ≤ 25 MB) proxy through the backend.
 *
 * Public API:
 *   import { uploadFile } from "@/api/uploadClient";
 *   const { file_url, publicId } = await uploadFile({ file, kind: "video", onProgress });
 */
import axios from 'axios';
import apiClient from '@/api/apiClient';

// Dedicated vanilla axios instance for Cloudinary — completely isolated from
// apiClient so none of our interceptors (Authorization: Bearer, baseURL,
// withCredentials) can leak into the external Cloudinary request.
const cloudinaryAxios = axios.create();

// Kinds that bypass Render and go direct to Cloudinary (large binary assets).
const DIRECT_KINDS = new Set(['video', 'resource', 'reading', 'assignment_brief', 'thumbnail']);

// Kinds a student submits — must go through the backend /uploads/me/:kind route.
const STUDENT_KINDS = new Set(['document', 'request_attachment', 'assignment', 'avatar']);

/**
 * Upload a single File to Cloudinary.
 *
 * @param {object}                    params
 * @param {File}                      params.file        Browser File object.
 * @param {string}                   [params.kind]       Upload category.
 * @param {(pct: number) => void}    [params.onProgress] Progress callback 0–100.
 * @returns {Promise<{ file_url, url, publicId, bytes, format, resourceType, file_name }>}
 */
export async function uploadFile({ file, kind = 'resource', onProgress } = {}) {
  if (!file) throw new Error('uploadFile: a `file` is required.');

  if (STUDENT_KINDS.has(kind)) {
    return uploadViaProxy({ file, path: `/uploads/me/${kind}`, onProgress });
  }

  if (DIRECT_KINDS.has(kind)) {
    return uploadDirect({ file, kind, onProgress });
  }

  // Unknown kinds fall back to the proxy (safe default).
  return uploadViaProxy({ file, path: `/uploads/${kind}`, onProgress });
}

// ── Internal: signed direct upload ─────────────────────────────────────────

async function uploadDirect({ file, kind, onProgress }) {
  // Step 1 — fetch a short-lived signature from our backend.
  // Backend signs { folder, timestamp } only — resource_type is NOT signed
  // because it belongs in the URL, not the FormData body.
  const { data: sigData } = await apiClient.get(
    `/uploads/sign-cloudinary?kind=${encodeURIComponent(kind)}`
  );
  const { signature, timestamp, apiKey, cloudName, folder, resourceType } = sigData.data;

  // Step 2 — build the FormData payload.
  // Signed params: file, api_key, timestamp, signature, folder.
  // resource_type is NOT appended to FormData — it is part of the URL only.
  // Do NOT set Content-Type manually; the browser sets multipart/form-data
  // with the correct boundary automatically.
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);

  // Step 3 — POST directly to Cloudinary using the isolated axios instance.
  // cloudinaryAxios has no interceptors, no baseURL, no Authorization header,
  // no withCredentials — a completely clean external HTTP call.
  const cloudinaryUrl =
    `https://api.cloudinary.com/v1_1/${cloudName.trim()}/${resourceType}/upload`;

  const { data: result } = await cloudinaryAxios.post(cloudinaryUrl, form, {
    timeout: 0, // large videos can take minutes
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return normalise(result, file.name);
}

// ── Internal: proxy upload through backend ──────────────────────────────────

async function uploadViaProxy({ file, path, onProgress }) {
  const form = new FormData();
  form.append('file', file);

  const { data } = await apiClient.post(path, form, {
    // Let the browser set the multipart/form-data boundary automatically.
    headers: { 'Content-Type': undefined },
    timeout: 0,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return data.data;
}

// ── Normalise Cloudinary's raw response into our stable shape ───────────────

function normalise(result, originalName) {
  const url = result.secure_url || result.url || '';
  return {
    file_url:     url,
    url,
    publicId:     result.public_id,
    bytes:        result.bytes,
    format:       result.format,
    resourceType: result.resource_type,
    file_name:    originalName,
  };
}

export default uploadFile;
