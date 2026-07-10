/**
 * Email delivery service — provider-abstracted.
 *
 * Default provider: Mailjet
 *   - Single Sender Verification: verify one email address via an inbox
 *     confirmation link (no DNS/DKIM records needed). Works on Render
 *     immediately, sends to ANY external recipient.
 *   - Pure HTTPS REST API — no SMTP ports (which Render blocks/greylists).
 *   - Free tier: 6,000 emails/month, 200/day — sufficient for OTP + resets.
 *   - SDK: node-mailjet  (`npm install node-mailjet`)
 *
 * Fallback provider: Resend
 *   - Keep as a seam for when the custom domain is DNS-verified. At that
 *     point switch EMAIL_PROVIDER=resend and set EMAIL_FROM to the branded
 *     address.
 *
 * Callers never import a specific provider — they only call `sendEmail`.
 * Switching providers is a single env-var change on Render: EMAIL_PROVIDER.
 *
 * Required env vars:
 *   EMAIL_PROVIDER      'mailjet' (default) | 'resend'
 *   MJ_APIKEY_PUBLIC    Mailjet public API key
 *   MJ_APIKEY_PRIVATE   Mailjet private API secret
 *   EMAIL_FROM          Verified sender  e.g. "SOL <noreply@yourdomain.com>"
 */

import Mailjet from 'node-mailjet';
import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// ── Lazy SDK clients (instantiated on first send, not at boot) ───────────────

let mailjetClient = null;
const getMailjetClient = () => {
  if (!mailjetClient) {
    mailjetClient = new Mailjet({
      apiKey:    env.email.apiKey,
      apiSecret: env.email.apiSecret,
    });
  }
  return mailjetClient;
};

let resendClient = null;
const getResendClient = () => {
  if (!resendClient) resendClient = new Resend(env.email.apiKey);
  return resendClient;
};

// ── Parse "Display Name <address>" → { Name, Email } for Mailjet ────────────
const parseAddress = (raw) => {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { Name: match[1].trim(), Email: match[2].trim() };
  return { Name: '', Email: raw.trim() };
};

/**
 * Send a transactional email through the configured provider.
 *
 * @param {{
 *   to:       string,
 *   subject:  string,
 *   html:     string,
 *   text?:    string,
 * }} msg
 * @returns {Promise<{ id?: string }>} Provider message ID when available.
 * @throws  {ApiError} 500 if the provider rejects or is misconfigured.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  // ── Dev / test fallback when no credentials are set ─────────────────────
  const missingMailjet = !env.email.apiKey || !env.email.apiSecret;
  const missingResend  = !env.email.apiKey;

  const noCredentials =
    env.email.provider === 'mailjet' ? missingMailjet : missingResend;

  if (noCredentials) {
    if (env.isProd) {
      logger.error('[email] API credentials are not set — cannot send email.');
      throw ApiError.internal('Email service is not configured.');
    }
    // In development, print the email to the console so OTPs / reset links are
    // accessible without a live provider.
    logger.warn('[email] No credentials — logging email to console (dev only).');
    logger.info(
      `[email:dev]\n  To:      ${to}\n  Subject: ${subject}\n\n${text || '(html only)'}`
    );
    return { id: 'dev-console' };
  }

  const from = env.email.from;

  try {
    switch (env.email.provider) {

      // ── Mailjet ──────────────────────────────────────────────────────────
      case 'mailjet': {
        const mj = getMailjetClient();

        const fromParsed = parseAddress(from);
        const toParsed   = parseAddress(to);

        // Mailjet Send API v3.1 — uses the /send endpoint via the SDK's
        // fluent request builder.
        const response = await mj
          .post('send', { version: 'v3.1' })
          .request({
            Messages: [
              {
                From:    { Email: fromParsed.Email, Name: fromParsed.Name },
                To:      [{ Email: toParsed.Email,  Name: toParsed.Name  }],
                Subject: subject,
                HTMLPart: html,
                ...(text ? { TextPart: text } : {}),
              },
            ],
          });

        // Mailjet's SDK resolves with the Axios response; the message ID is
        // nested inside Messages[0].To[0].MessageID.
        const msgId = response?.body?.Messages?.[0]?.To?.[0]?.MessageID;
        logger.info(`[email] Mailjet sent → ${to} (id: ${msgId ?? 'n/a'})`);
        return { id: String(msgId ?? '') };
      }

      // ── Resend (fallback / future DNS-verified path) ──────────────────────
      case 'resend': {
        const client = getResendClient();
        const { data, error } = await client.emails.send({
          from,
          to,
          subject,
          html,
          text,
        });
        if (error) {
          logger.error('[email] Resend send failed:', error);
          throw ApiError.internal('Failed to send email. Please try again later.');
        }
        logger.info(`[email] Resend sent → ${to} (id: ${data?.id ?? 'n/a'})`);
        return { id: data?.id };
      }

      default:
        throw ApiError.internal(`Unknown email provider: "${env.email.provider}".`);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error('[email] Unexpected send error:', err?.message ?? err);
    throw ApiError.internal('Failed to send email. Please try again later.');
  }
};

export default sendEmail;
