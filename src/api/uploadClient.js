/**
 * uploadClient.js — custom Cloudinary-backed file uploads.
 *
 * Replaces the removed Base44 `base44.integrations.Core.UploadFile({ file })`.
 * The backend streams the buffer to Cloudinary and returns the secure
 * https://res.cloudinary.com/... URL, so the browser never touches Cloudinary
 * credentials.
 *
 * Endpoints (see backend/src/routes/upload.routes.js):
 *   - Staff:    POST /uploads/:kind          (admin / team_member)
 *   - Student:  POST /uploads/me/:kind        (any authenticated user)
 *
 * Usage — matches the old Base44 return shape ({ file_url }):
 *   import { uploadFile } from "@/api/uploadClient";
 *   const { file_url } = await uploadFile({ file, kind: "video" });
 */
import apiClient from "@/api/apiClient";

/** Kinds that must go through the student-safe /uploads/me/:kind route. */
const STUDENT_KINDS = new Set(["document", "request_attachment"]);

/**
 * Upload a single File to Cloudinary via the backend.
 *
 * @param {object}   params
 * @param {File}     params.file            - the browser File object
 * @param {string}   [params.kind="resource"] - upload category (maps to a
 *   Cloudinary folder + resource type on the server). Staff kinds: resource,
 *   assignment_brief, reading, avatar, thumbnail, video. Student kinds:
 *   document, request_attachment, avatar.
 * @param {(pct:number)=>void} [params.onProgress] - upload progress 0–100.
 * @returns {Promise<{file_url:string, url:string, publicId:string,
 *   bytes:number, format:string, resourceType:string, file_name:string}>}
 */
export async function uploadFile({ file, kind = "resource", onProgress } = {}) {
  if (!file) throw new Error("uploadFile: a `file` is required.");

  const path = STUDENT_KINDS.has(kind) ? `/uploads/me/${kind}` : `/uploads/${kind}`;

  const form = new FormData();
  form.append("file", file); // backend expects the field name "file"

  const { data } = await apiClient.post(path, form, {
    // Do NOT set Content-Type manually. When Axios receives a FormData object
    // the browser (XHR/fetch) must generate the multipart boundary itself and
    // inject it into the Content-Type header automatically, e.g.:
    //   Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXyz
    // Overriding it here strips the boundary, making the server unable to parse
    // the body — multer reads 0 bytes and rejects the request.
    // We only delete the default JSON header so Axios doesn't send it instead.
    headers: { 'Content-Type': undefined },
    timeout: 0, // videos can be large — disable the 15s default timeout
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  // sendCreated wraps the payload as { success, message, data }.
  return data.data;
}

export default uploadFile;
