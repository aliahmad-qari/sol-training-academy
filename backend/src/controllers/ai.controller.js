import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateText, generateJSON, extractText } from '../services/ai.service.js';
import { STUDENT_TOOLS, ADMIN_TOOLS } from '../services/ai.prompts.js';

/**
 * ai.controller.js — dispatches AI tool requests to Gemini.
 *
 * The frontend sends structured inputs (topic, level, ticket text, precomputed
 * stats) to /ai/student/:toolId or /ai/admin/:toolId. The prompt text and JSON
 * schema live server-side in ai.prompts.js; here we just look up the tool,
 * build the prompt, and return the model output in the standard envelope.
 */

/** Shared runner: look up the tool in `registry`, build the prompt, call Gemini. */
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
  const { file_url, mimeType } = req.body;
  if (!file_url) throw ApiError.badRequest('file_url is required.');

  let buffer;
  try {
    const fileRes = await fetch(file_url);
    if (!fileRes.ok) throw new Error(`status ${fileRes.status}`);
    buffer = Buffer.from(await fileRes.arrayBuffer());
  } catch {
    throw ApiError.badRequest('Could not download the uploaded file for extraction.');
  }

  const text = await extractText({ buffer, mimeType });
  return sendOk(res, { text }, 'Document extracted');
});

export default { runStudentTool, runAdminTool, extractDocument };
