/**
 * Transactional email templates (OTP + password reset).
 *
 * Each builder returns { subject, html, text }. HTML is table-based with inline
 * CSS (the only reliable cross-client approach) and a 600px container, styled to
 * match the app's brand palette:
 *   ink     #0F172A  (dark heading / footer)
 *   harvest #D97706  (accent / OTP chip / button)
 *
 * A plain-text alternative is always included for accessibility and deliverability.
 */

import { env } from '../../config/env.js';

const BRAND = {
  ink: '#0F172A',
  harvest: '#D97706',
  slate: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
};

const companyName = () => env.company?.name || 'SOL Business Consultant';

/**
 * Shared responsive shell. `bodyHtml` is dropped into the white card.
 */
const layout = (bodyHtml) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                 style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <!-- Header (white so the dark logo is visible) -->
            <tr>
              <td align="center" style="background:#ffffff;padding:28px 32px;border-bottom:1px solid ${BRAND.border};">
                <img src="${env.email.logoUrl}" alt="${companyName()}" height="44"
                     style="display:block;height:44px;width:auto;border:0;outline:none;text-decoration:none;" />
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px;color:${BRAND.ink};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${BRAND.border};">
                <p style="margin:0;color:${BRAND.slate};font-size:12px;line-height:1.5;">
                  This is an automated message from ${companyName()}. If you didn't request it,
                  you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/**
 * 6-digit OTP verification email.
 * @param {{ name?: string, code: string }} params
 */
export const otpEmail = ({ name, code }) => {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${BRAND.ink};">Verify your email</h1>
    <p style="margin:0 0 20px;color:${BRAND.slate};">${greeting}</p>
    <p style="margin:0 0 20px;">Use the verification code below to finish setting up your account. This code expires in <strong>10 minutes</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:18px 28px;">
          <span style="font-size:34px;font-weight:700;letter-spacing:10px;color:${BRAND.harvest};font-family:'Courier New',monospace;">${code}</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:${BRAND.slate};font-size:13px;">If you didn't create an account, no action is needed and you can ignore this email.</p>
  `);
  const text = `${greeting}\n\nYour ${companyName()} verification code is: ${code}\nIt expires in 10 minutes.\n\nIf you didn't create an account, you can ignore this email.`;
  return { subject: `Your verification code: ${code}`, html, text };
};

/**
 * Password reset email with a tokenized link.
 * @param {{ name?: string, url: string }} params
 */
export const resetPasswordEmail = ({ name, url }) => {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${BRAND.ink};">Reset your password</h1>
    <p style="margin:0 0 20px;color:${BRAND.slate};">${greeting}</p>
    <p style="margin:0 0 24px;">We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>30 minutes</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:${BRAND.harvest};border-radius:10px;">
          <a href="${url}" target="_blank"
             style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
            Reset password
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;color:${BRAND.slate};font-size:13px;">Or paste this link into your browser:</p>
    <p style="margin:0 0 20px;word-break:break-all;"><a href="${url}" target="_blank" style="color:${BRAND.harvest};font-size:13px;">${url}</a></p>
    <p style="margin:0;color:${BRAND.slate};font-size:13px;">If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
  `);
  const text = `${greeting}\n\nReset your ${companyName()} password using the link below (expires in 30 minutes):\n${url}\n\nIf you didn't request this, you can ignore this email.`;
  return { subject: 'Reset your password', html, text };
};

export default { otpEmail, resetPasswordEmail };
