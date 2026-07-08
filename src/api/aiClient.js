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
export const extractDocument = ({ file_url, mimeType, fileName } = {}) =>
  apiClient.post('/ai/extract', { file_url, mimeType, fileName }).then((r) => r.data.data);

/**
 * Send a message to the public SOL Assistant chat. Stateless: pass the running
 * history as `messages` ([{ role: 'user' | 'assistant', content }]) and it
 * returns the assistant's reply string. Works logged-out (the /ai/chat route
 * uses optionalAuth), so it never triggers the 401→/login redirect.
 */
export const runChatAssistant = (messages = []) =>
  apiClient.post('/ai/chat', { messages }).then((r) => r.data.data.reply);

export default { runStudentTool, runAdminTool, extractDocument, runChatAssistant };
