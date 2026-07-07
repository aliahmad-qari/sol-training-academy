/**
 * aiClient.js — thin frontend helpers for the SOL Training Academy AI routes.
 *
 * These wrap the shared `apiClient` axios instance, so they automatically get
 * the Bearer access token, the silent 401→refresh retry, and the generous 60s
 * timeout (which covers Render free-tier cold starts). Every helper returns the
 * unwrapped `data` payload from the standard `{ success, message, data }`
 * envelope, matching how the dashboards consume results.
 *
 * The backend owns all prompt text and JSON schemas (see backend
 * ai.prompts.js); callers only send structured inputs.
 */
import apiClient from '@/api/apiClient';

/** Run a student AI tool. `toolId` must match a key in backend STUDENT_TOOLS. */
export const runStudentTool = (toolId, input = {}) =>
  apiClient.post(`/ai/student/${toolId}`, input).then((r) => r.data.data);

/** Run an admin AI tool. `toolId` must match a key in backend ADMIN_TOOLS. */
export const runAdminTool = (toolId, input = {}) =>
  apiClient.post(`/ai/admin/${toolId}`, input).then((r) => r.data.data);

/**
 * Extract text from an already-uploaded document/image (Cloudinary URL).
 * Returns { text }.
 */
export const extractDocument = ({ file_url, mimeType } = {}) =>
  apiClient.post('/ai/extract', { file_url, mimeType }).then((r) => r.data.data);

export default { runStudentTool, runAdminTool, extractDocument };
