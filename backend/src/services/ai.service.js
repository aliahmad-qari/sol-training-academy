import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * ai.service.js — thin, reusable wrapper around the Google Gemini SDK.
 *
 * All prompt text and JSON schemas live in `ai.prompts.js`; this module only
 * knows how to *talk* to Gemini and normalize its responses/errors into the
 * shapes the rest of the app expects (plain string, parsed object, or a
 * well-typed ApiError).
 *
 * The client is constructed lazily and cached, so importing this module never
 * crashes a server that booted without GEMINI_API_KEY — the error surfaces
 * only when an AI route is actually hit.
 */

let _client = null;

/** Lazily build (and cache) the Gemini client. Throws if the key is missing. */
const getClient = () => {
  if (!env.gemini.apiKey) {
    // 500-class: the deployment is misconfigured, not the caller's fault.
    throw ApiError.internal('AI is not configured (GEMINI_API_KEY missing).');
  }
  if (!_client) {
    _client = new GoogleGenerativeAI(env.gemini.apiKey, { apiVersion: 'v1' });
  }
  return _client;
};

/**
 * Translate an SDK/network error into an operational ApiError.
 * Gemini surfaces quota/rate issues as 429 and key/permission issues as 400/403.
 */
const toApiError = (err, fallbackMsg) => {
  if (err instanceof ApiError) return err;
  const status = err?.status ?? err?.response?.status;
  const raw = String(err?.message || '');

  if (status === 429 || /quota|rate limit|RESOURCE_EXHAUSTED/i.test(raw)) {
    return ApiError.tooMany('The AI service is busy or the daily quota is reached. Please try again shortly.');
  }
  if (status === 400 || status === 403 || /API key|PERMISSION_DENIED/i.test(raw)) {
    return ApiError.internal('AI request rejected (check the API key / model configuration).');
  }
  logger.error(`[ai.service] ${fallbackMsg}: ${raw}`);
  return ApiError.internal(fallbackMsg);
};

/**
 * generateText — free-text generation. Returns a plain string.
 * Used by the ~13 tools whose UI renders the response as-is in <ResultBox>.
 */
export const generateText = async ({ prompt, systemInstruction }) => {
  try {
    const model = getClient().getGenerativeModel({
      model: env.gemini.model,
      ...(systemInstruction ? { systemInstruction } : {}),
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text || !text.trim()) {
      throw ApiError.internal('The AI returned an empty response. Please try again.');
    }
    return text.trim();
  } catch (err) {
    throw toApiError(err, 'AI text generation failed.');
  }
};

/**
 * generateJSON — structured generation with an enforced response schema.
 * Gemini is put into JSON mode (responseMimeType + responseSchema) so the model
 * is *constrained* to emit valid JSON matching `schema`; we still JSON.parse
 * defensively and wrap any parse failure as a clean 500.
 * Returns the parsed object (arrays/objects the frontend maps directly).
 */
export const generateJSON = async ({ prompt, systemInstruction, schema }) => {
  try {
    const model = getClient().getGenerativeModel({
      model: env.gemini.model,
      ...(systemInstruction ? { systemInstruction } : {}),
      generationConfig: {
        responseMimeType: 'application/json',
        ...(schema ? { responseSchema: schema } : {}),
      },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    try {
      return JSON.parse(text);
    } catch {
      logger.error(`[ai.service] JSON parse failed. Raw: ${String(text).slice(0, 500)}`);
      throw ApiError.internal('The AI returned malformed data. Please try again.');
    }
  } catch (err) {
    throw toApiError(err, 'AI structured generation failed.');
  }
};

// MIME types Gemini can read natively as inline data for text extraction.
// DOCX/DOC have no native Gemini MIME type — callers get a clear 400 and the
// frontend falls back to its "paste the text" path.
const EXTRACTABLE_MIME = new Set([
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
]);

/**
 * extractText — pull the readable text out of an uploaded document/image using
 * Gemini's multimodal input. `buffer` is the raw file bytes; `mimeType` is the
 * browser-reported content type.
 */
export const extractText = async ({ buffer, mimeType }) => {
  const mime = (mimeType || '').toLowerCase();
  if (!EXTRACTABLE_MIME.has(mime)) {
    throw ApiError.badRequest(
      'This file type cannot be read automatically (DOCX/DOC are not supported). Please paste the text instead.'
    );
  }
  try {
    const model = getClient().getGenerativeModel({ model: env.gemini.model });
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(buffer).toString('base64'),
          mimeType: mime,
        },
      },
      {
        text:
          'Extract and return ONLY the full readable text content of this document, ' +
          'preserving paragraphs and headings. Do not summarize, add commentary, or omit content.',
      },
    ]);
    const text = result.response.text();
    if (!text || !text.trim()) {
      throw ApiError.badRequest('No readable text could be extracted. Please paste the text instead.');
    }
    return text.trim();
  } catch (err) {
    throw toApiError(err, 'Document text extraction failed.');
  }
};

export default { generateText, generateJSON, extractText };
