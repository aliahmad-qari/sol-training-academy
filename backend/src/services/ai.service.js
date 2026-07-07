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

const chat = async (prompt, systemInstruction) => {
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: prompt });

  const res = await getClient().chat.completions.create({
    model: env.groq.model,
    messages,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content?.trim() ?? '';
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
    const text = await chat(prompt + schemaHint, systemInstruction);
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

const EXTRACTABLE_MIME = new Set([
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export const extractText = async ({ buffer, mimeType }) => {
  const mime = (mimeType || '').toLowerCase();
  if (!EXTRACTABLE_MIME.has(mime)) {
    throw ApiError.badRequest(
      'This file type cannot be read automatically (DOCX/DOC are not supported). Please paste the text instead.'
    );
  }
  // Groq does not support multimodal file input — extract text via base64 for plain text,
  // or instruct the caller to use a PDF-to-text step before calling this.
  if (mime === 'text/plain') {
    const text = Buffer.from(buffer).toString('utf-8').trim();
    if (!text) throw ApiError.badRequest('No readable text could be extracted. Please paste the text instead.');
    return text;
  }
  throw ApiError.badRequest(
    'Image/PDF extraction requires a PDF parser. Please paste the text content instead.'
  );
};

export default { generateText, generateJSON, extractText };
