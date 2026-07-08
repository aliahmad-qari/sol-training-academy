import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateText, generateJSON, extractText, chatConversation } from '../services/ai.service.js';
import { STUDENT_TOOLS, ADMIN_TOOLS, CHAT_ASSISTANT } from '../services/ai.prompts.js';

/**
 * ai.controller.js — dispatches AI tool requests to Groq.
 *
 * The frontend sends structured inputs (topic, level, ticket text, precomputed
 * stats) to /ai/student/:toolId or /ai/admin/:toolId. The prompt text and JSON
 * schema live server-side in ai.prompts.js; here we just look up the tool,
 * build the prompt, and return the model output in the standard envelope.
 */

/** Shared runner: look up the tool in `registry`, build the prompt, call Groq. */
const runTool = async (registry, toolId, input) => {
  const tool = registry[toolId];
  if (!tool) throw ApiError.notFound(`Unknown AI tool: "${toolId}".`);

  const prompt = tool.buildPrompt(input || {});
  if (!prompt || !String(prompt).trim()) {
    throw ApiError.badRequest('Missing required input for this AI tool.');
  }

  if (tool.mode === 'json') {
    return generateJSON({
      prompt,
      systemInstruction: tool.systemInstruction,
      schema: tool.schema,
    });
  }
  return generateText({ prompt, systemInstruction: tool.systemInstruction });
};

/**
 * POST /api/v1/ai/student/:toolId   (protected; any authenticated user)
 */
export const runStudentTool = asyncHandler(async (req, res) => {
  const result = await runTool(STUDENT_TOOLS, req.params.toolId, req.body);
  return sendOk(res, result, 'AI result');
});

/**
 * POST /api/v1/ai/admin/:toolId   (protected; admin / team_member)
 */
export const runAdminTool = asyncHandler(async (req, res) => {
  const result = await runTool(ADMIN_TOOLS, req.params.toolId, req.body);
  return sendOk(res, result, 'AI result');
});

/**
 * POST /api/v1/ai/extract   (protected)
 * Body: { file_url, mimeType }
 * Fetches the (already uploaded) file from its Cloudinary URL and returns the
 * extracted text. Mirrors the old base44 ExtractDataFromUploadedFile contract.
 */
export const extractDocument = asyncHandler(async (req, res) => {
  const { file_url, mimeType, fileName } = req.body;
  if (!file_url) throw ApiError.badRequest('file_url is required.');

  let buffer;
  try {
    const fileRes = await fetch(file_url);
    if (!fileRes.ok) throw new Error(`status ${fileRes.status}`);
    buffer = Buffer.from(await fileRes.arrayBuffer());
  } catch {
    throw ApiError.badRequest('Could not download the uploaded file for extraction.');
  }

  // Fall back to the file_url's own extension when no explicit fileName is sent.
  const nameForKind = fileName || file_url.split('?')[0];
  const text = await extractText({ buffer, mimeType, fileName: nameForKind });
  return sendOk(res, { text }, 'Document extracted');
});

/**
 * POST /api/v1/ai/chat   (public; optionalAuth)
 * Body: { messages: [{ role: 'user' | 'assistant', content }] }
 * Stateless SOL Assistant chat — the client sends the running history and we
 * return a single assistant reply. Also accepts a single { message } string
 * for convenience.
 */
export const runChatAssistant = asyncHandler(async (req, res) => {
  let { messages, message } = req.body;

  // Convenience: allow a bare { message } and wrap it as one user turn.
  if (!Array.isArray(messages)) {
    if (typeof message === 'string' && message.trim()) {
      messages = [{ role: 'user', content: message }];
    } else {
      throw ApiError.badRequest('Provide `messages` (array) or `message` (string).');
    }
  }

  const reply = await chatConversation({
    history: messages,
    systemInstruction: CHAT_ASSISTANT.systemInstruction,
  });

  return sendOk(res, { reply }, 'AI reply');
});

export default { runStudentTool, runAdminTool, extractDocument, runChatAssistant };
