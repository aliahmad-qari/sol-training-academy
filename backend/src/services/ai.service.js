import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

let _client = null;

const getClient = () => {
  if (!env.groq.apiKey) {
    throw ApiError.internal('AI is not configured (GROQ_API_KEY missing).');
  }
  if (!_client) {
    _client = new Groq({ apiKey: env.groq.apiKey });
  }
  return _client;
};

const toApiError = (err, fallbackMsg) => {
  if (err instanceof ApiError) return err;
  const status = err?.status ?? err?.response?.status;
  const raw = String(err?.message || '');

  if (status === 429 || /rate.?limit|quota|RESOURCE_EXHAUSTED/i.test(raw)) {
    return ApiError.tooMany('The AI service is busy. Please try again in a moment.');
  }
  if (status === 401 || status === 403 || /api.?key|auth|PERMISSION/i.test(raw)) {
    return ApiError.internal('AI request rejected (check the API key configuration).');
  }
  logger.error(`[ai.service] ${fallbackMsg}: ${raw}`);
  return ApiError.internal(fallbackMsg);
};

/**
 * Low-level Groq call. `opts` lets callers opt into JSON mode, tune sampling,
 * and cap output length. Defaults preserve the original text behavior.
 */
const complete = async (messages, opts = {}) => {
  const { json = false, temperature = 0.7, maxTokens } = opts;

  const params = {
    model: env.groq.model,
    messages,
    temperature,
  };
  // Native JSON mode: forces syntactically valid JSON, so the model can't
  // wrap the object in prose / Markdown fences that break JSON.parse.
  if (json) params.response_format = { type: 'json_object' };
  // Cap output so large structured payloads (outlines, 20-question quizzes)
  // don't silently truncate into invalid JSON.
  if (maxTokens) params.max_tokens = maxTokens;

  const res = await getClient().chat.completions.create(params);
  return res.choices[0]?.message?.content?.trim() ?? '';
};

const chat = async (prompt, systemInstruction, opts = {}) => {
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: prompt });
  return complete(messages, opts);
};

export const generateText = async ({ prompt, systemInstruction }) => {
  try {
    const text = await chat(prompt, systemInstruction);
    if (!text) throw ApiError.internal('The AI returned an empty response. Please try again.');
    return text;
  } catch (err) {
    throw toApiError(err, 'AI text generation failed.');
  }
};

export const generateJSON = async ({ prompt, systemInstruction, schema }) => {
  const schemaHint = schema
    ? `\n\nRespond with ONLY valid JSON matching this schema: ${JSON.stringify(schema)}`
    : '\n\nRespond with ONLY valid JSON.';

  try {
    // Low temperature + native JSON mode + a generous token cap make structured
    // output reliable. We still strip a stray code fence as a belt-and-braces
    // fallback in case a future model ignores response_format.
    const text = await chat(prompt + schemaHint, systemInstruction, {
      json: true,
      temperature: 0.1,
      maxTokens: 4096,
    });
    const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    try {
      return JSON.parse(jsonStr);
    } catch {
      logger.error(`[ai.service] JSON parse failed. Raw: ${jsonStr.slice(0, 500)}`);
      throw ApiError.internal('The AI returned malformed data. Please try again.');
    }
  } catch (err) {
    throw toApiError(err, 'AI structured generation failed.');
  }
};

/**
 * Stateless multi-turn chat for the public SOL Assistant. The frontend keeps
 * the running message array and sends the recent turns each call; we prepend
 * the system persona and forward to Groq. `history` = [{ role, content }, ...]
 * with role 'user' | 'assistant'.
 */
export const chatConversation = async ({ history = [], systemInstruction }) => {
  const clean = (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && String(m.content || '').trim())
    .slice(-12) // cap context: last 12 turns is plenty and bounds token cost
    .map((m) => ({ role: m.role, content: String(m.content).trim() }));

  if (clean.length === 0) {
    throw ApiError.badRequest('A message is required to chat.');
  }

  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push(...clean);

  try {
    const text = await complete(messages, { temperature: 0.6, maxTokens: 1024 });
    if (!text) throw ApiError.internal('The assistant returned an empty response. Please try again.');
    return text;
  } catch (err) {
    throw toApiError(err, 'AI chat failed.');
  }
};

/**
 * Extract plain text from an uploaded document.
 *
 * Groq's llama models are text-only (no multimodal file input), so we extract
 * the text server-side and hand THAT to the AI tools:
 *   - PDF  → pdf-parse (PDFParse class)
 *   - DOCX → mammoth (raw text)
 *   - TXT  → decoded inline
 * Legacy .doc (binary Word) and images are not supported — callers should
 * paste the text instead.
 */
const guessKind = (mimeType, fileName = '') => {
  const mime = (mimeType || '').toLowerCase();
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return 'docx';
  }
  if (mime.startsWith('text/') || ext === 'txt') return 'txt';
  if (mime === 'application/msword' || ext === 'doc') return 'doc';
  return 'unknown';
};

export const extractText = async ({ buffer, mimeType, fileName = '' }) => {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  if (buf.length === 0) throw ApiError.badRequest('The uploaded file is empty.');

  const kind = guessKind(mimeType, fileName);

  if (kind === 'doc' || kind === 'unknown') {
    throw ApiError.badRequest(
      'This file type cannot be read automatically (legacy .doc and images are not supported). Please upload a PDF, DOCX, or TXT file, or paste the text instead.'
    );
  }

  let text = '';
  try {
    if (kind === 'txt') {
      text = buf.toString('utf-8');
    } else if (kind === 'pdf') {
      // pdf-parse v2 exposes a PDFParse class; getText() returns { text }.
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buf });
      const result = await parser.getText();
      text = result?.text || '';
      await parser.destroy?.();
      // pdf-parse v2 injects page separators like "-- 1 of 3 --"; strip them so
      // the text handed to the AI isn't polluted with page markers.
      text = text.replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gim, '').trim();
    } else if (kind === 'docx') {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result?.value || '';
    }
  } catch (err) {
    logger.error(`[ai.service] extractText (${kind}) failed: ${err?.message}`);
    throw ApiError.badRequest(
      'We could not read text from this file. It may be scanned, image-based, or corrupted — please paste the text instead.'
    );
  }

  text = text.trim();
  if (!text) {
    throw ApiError.badRequest(
      'No readable text could be extracted (the file may be scanned or image-based). Please paste the text instead.'
    );
  }
  return text;
};

export default { generateText, generateJSON, extractText, chatConversation };
