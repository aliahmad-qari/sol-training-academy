/**
 * Email delivery service.
 *
 * Delivers transactional email over an HTTPS provider API (Resend by default)
 * instead of SMTP — Render blocks/greylists outbound SMTP ports, which kills
 * deliverability for Nodemailer-style setups.
 *
 * Provider-abstracted: callers only ever import `sendEmail`. Adding SendGrid
 * later is a self-contained change in the `switch` below — no controller edits.
 *
 * Configuration (see config/env.js → env.email):
 *   EMAIL_PROVIDER   'resend' (default) | 'sendgrid'
 *   EMAIL_API_KEY    provider API key
 *   EMAIL_FROM       verified sender, e.g. "SOL Business <noreply@yourdomain.com>"
 */

import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

// Lazily instantiate the SDK client so the server boots even with no key set
// (dev). The client is only created on first send, when a key is present.
let resendClient = null;
const getResendClient = () => {
  if (!resendClient) resendClient = new Resend(env.email.apiKey);
  return resendClient;
};

/**
 * Send an email through the configured provider.
 *
 * @param {{ to: string, subject: string, html: string, text?: string }} msg
 * @returns {Promise<{ id?: string }>} provider message id when available
 * @throws {ApiError} 500 if email is not configured or the provider rejects.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.email.apiKey) {
    // In production a missing key is a real misconfiguration — fail loudly.
    if (env.isProd) {
      logger.error('[email] RESEND_API_KEY / EMAIL_API_KEY is not set — cannot send email.');
      throw ApiError.internal('Email service is not configured.');
    }
    // In dev/test, log the message (OTP/link included) so the flow is testable
    // without a Resend key, instead of crashing registration.
    logger.warn('[email] No API key set — logging email to console (dev/test only).');
    logger.info(`[email:dev] To: ${to} | Subject: ${subject}\n${text || ''}`);
    return { id: 'dev-console' };
  }

  const from = env.email.from;

  try {
    switch (env.email.provider) {
      case 'resend': {
        const client = getResendClient();
        const { data, error } = await client.emails.send({ from, to, subject, html, text });
        // The Resend SDK returns errors in the payload rather than throwing.
        if (error) {
          logger.error('[email] Resend send failed:', error);
          throw ApiError.internal('Failed to send email. Please try again later.');
        }
        return { id: data?.id };
      }

      // Seam for a future provider. Install @sendgrid/mail and implement here.
      case 'sendgrid':
        throw ApiError.internal('SendGrid provider is not implemented yet.');

      default:
        throw ApiError.internal(`Unknown email provider: ${env.email.provider}`);
    }
  } catch (err) {
    // Re-throw our own operational errors untouched; wrap anything unexpected.
    if (err instanceof ApiError) throw err;
    logger.error('[email] Unexpected email error:', err);
    throw ApiError.internal('Failed to send email. Please try again later.');
  }
};

export default sendEmail;
