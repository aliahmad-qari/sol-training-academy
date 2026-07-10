/**
 * Email delivery service — Brevo (formerly Sendinblue).
 *
 * Why Brevo:
 *   - Single Sender Verification: verify one email address via inbox link —
 *     no DNS records needed. Sends to ANY external recipient immediately.
 *   - Pure HTTPS REST API on port 443 — Render never blocks it.
 *   - Free tier: 300 emails/day, 9,000/month — sufficient for OTP + resets.
 *   - No SDK install required — uses axios (already in backend dependencies).
 *     This avoids all CJS/ESM compatibility issues.
 *
 * Setup (one-time):
 *   1. Sign up at brevo.com
 *   2. Settings → Senders & IP → Senders → Add a sender
 *      - Enter name + email address → confirm inbox link
 *   3. Settings → API Keys → Generate a new API key
 *   4. Set on Render:
 *        EMAIL_PROVIDER  = brevo
 *        BREVO_API_KEY   = xkeysib-xxxxxxxxxxxx
 *        EMAIL_FROM      = SOL Business Consultant <saf@solbusinessconsultant.com.au>
 *
 * Callers never import a specific provider — they only call `sendEmail`.
 * Switching providers later is a single env-var change (EMAIL_PROVIDER).
 */

import axios from 'axios';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// Brevo Send Transactional Email endpoint
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// ── Parse "Display Name <address@example.com>" → { name, email } ─────────────
const parseAddress = (raw) => {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: '', email: raw.trim() };
};

/**
 * Send a transactional email via the configured provider.
 *
 * @param {{
 *   to:      string,   - recipient e.g. "Jane <jane@example.com>" or "jane@example.com"
 *   subject: string,
 *   html:    string,
 *   text?:   string,   - plain text fallback (recommended for deliverability)
 * }} msg
 * @returns {Promise<{ id?: string }>}
 * @throws  {ApiError} 500 on misconfiguration or provider rejection.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  // ── Dev fallback: no API key set → log to console instead of crashing ───
  if (!env.email.apiKey) {
    if (env.isProd) {
      logger.error('[email] BREVO_API_KEY is not set — cannot send email.');
      throw ApiError.internal('Email service is not configured.');
    }
    logger.warn('[email] No API key — logging email to console (dev only).');
    logger.info(`[email:dev]\n  To:      ${to}\n  Subject: ${subject}\n\n${text || '(html only)'}`);
    return { id: 'dev-console' };
  }

  const fromParsed = parseAddress(env.email.from);
  const toParsed   = parseAddress(to);

  // ── Brevo REST API payload ───────────────────────────────────────────────
  const payload = {
    sender: {
      name:  fromParsed.name  || 'SOL Business Consultant',
      email: fromParsed.email,
    },
    to: [
      {
        email: toParsed.email,
        ...(toParsed.name ? { name: toParsed.name } : {}),
      },
    ],
    subject,
    htmlContent: html,
    ...(text ? { textContent: text } : {}),
  };

  try {
    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key':      env.email.apiKey,  // Brevo authenticates via this header
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      timeout: 10_000,
    });

    // Brevo returns { messageId: '<...>' } on success (HTTP 201).
    const messageId = response.data?.messageId ?? null;
    logger.info(`[email] Brevo sent → ${toParsed.email} (id: ${messageId ?? 'n/a'})`);
    return { id: messageId };

  } catch (err) {
    // Axios wraps HTTP error responses — extract the Brevo error message.
    if (err.response) {
      const code    = err.response.status;
      const details = err.response.data?.message ?? JSON.stringify(err.response.data);
      logger.error(`[email] Brevo API error ${code}: ${details}`);

      // 401 = wrong/missing key, 400 = unverified sender, 429 = rate limit
      if (code === 401) throw ApiError.internal('Brevo API key is invalid or not set.');
      if (code === 400) throw ApiError.internal(`Brevo rejected the request: ${details}`);
      if (code === 429) throw ApiError.tooMany('Email rate limit reached. Please try again shortly.');
    } else {
      logger.error('[email] Brevo network error:', err.message);
    }
    throw ApiError.internal('Failed to send email. Please try again later.');
  }
};

export default sendEmail;
