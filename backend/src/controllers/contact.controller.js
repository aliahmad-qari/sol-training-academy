import validator from 'validator';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from '../services/email/email.service.js';

const CONTACT_TO_EMAIL = 'info@solbusinessconsultant.com.au';

const SERVICE_LABELS = {
  ndis_registration: 'NDIS Registration Support',
  software_automation: 'Easy Compliance / Automation',
  accountancy: 'Finance Operations Support',
  support_coordination_training: 'Support Coordination Training',
  business_registration: 'Company Registration',
  website_development: 'Website Development',
  accountancy_payroll: 'Payroll Process Support',
  general_enquiry: 'Other / Multiple Services',
};

const PHONE_RE = /^[+\d\s().-]{8,24}$/;

const cleanSingleLine = (value, maxLength = 160) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const cleanMessage = (value, maxLength = 5000) =>
  String(value ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
    .slice(0, maxLength);

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const detail = (field, message) => ({ field, message });

const buildContactEmail = ({ name, email, phone, company, serviceLabel, message, submittedAt, origin, userAgent }) => {
  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Company', company || 'Not provided'],
    ['Service', serviceLabel],
    ['Submitted', submittedAt],
    ['Website source', origin || 'Not available'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-weight:600;width:150px;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#0f172a;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="padding:26px 28px;background:#111827;color:#ffffff;">
          <p style="margin:0 0 8px;color:#f59e0b;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">SOL Business Consultant</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;">New website enquiry</h1>
        </div>
        <div style="padding:26px 28px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${rowsHtml}</table>
          <h2 style="font-size:16px;margin:0 0 10px;color:#111827;">Client message</h2>
          <div style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:16px;line-height:1.6;color:#1f2937;">${escapeHtml(message)}</div>
          <div style="margin-top:24px;">
            <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:999px;">Reply to ${escapeHtml(name)}</a>
          </div>
          <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;">User agent: ${escapeHtml(userAgent || 'Not available')}</p>
        </div>
      </div>
    </div>`;

  const text = [
    'New website enquiry received.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Company: ${company || 'Not provided'}`,
    `Service: ${serviceLabel}`,
    `Submitted: ${submittedAt}`,
    `Website source: ${origin || 'Not available'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  return { html, text };
};

/**
 * POST /api/v1/contact
 * Public website enquiry endpoint. Sends a Brevo transactional email to SOL.
 */
export const submitContactEnquiry = asyncHandler(async (req, res) => {
  const website = cleanSingleLine(req.body.website, 200);

  // Honeypot: quietly accept bot submissions without sending email.
  if (website) {
    return sendCreated(res, { delivered: true }, 'Contact enquiry received.');
  }

  const name = cleanSingleLine(req.body.name, 120);
  const email = cleanSingleLine(req.body.email, 180).toLowerCase();
  const phone = cleanSingleLine(req.body.phone, 40);
  const company = cleanSingleLine(req.body.company, 180);
  const service = cleanSingleLine(req.body.service, 80);
  const message = cleanMessage(req.body.message);
  const serviceLabel = SERVICE_LABELS[service] || SERVICE_LABELS.general_enquiry;

  const errors = [];
  if (name.length < 2) errors.push(detail('name', 'Please enter your full name.'));
  if (!validator.isEmail(email)) errors.push(detail('email', 'Please enter a valid email address.'));
  if (phone && !PHONE_RE.test(phone)) errors.push(detail('phone', 'Please enter a valid phone number.'));
  if (!service || !SERVICE_LABELS[service]) errors.push(detail('service', 'Please select the service you need.'));
  if (message.length < 10) errors.push(detail('message', 'Please add a few details so we can help properly.'));

  if (errors.length) {
    throw ApiError.unprocessable('Please check the highlighted fields.', errors);
  }

  const submittedAt = new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Australia/Melbourne',
  }).format(new Date());

  const { html, text } = buildContactEmail({
    name,
    email,
    phone,
    company,
    serviceLabel,
    message,
    submittedAt,
    origin: req.get('origin') || req.get('referer') || '',
    userAgent: req.get('user-agent') || '',
  });

  const replyName = name.replace(/[<>]/g, '').trim() || 'Website visitor';

  const result = await sendEmail({
    to: `SOL Business Consultant <${CONTACT_TO_EMAIL}>`,
    subject: `New website enquiry - ${serviceLabel}`,
    html,
    text,
    replyTo: `${replyName} <${email}>`,
  });

  return sendCreated(
    res,
    {
      delivered: true,
      email_id: result.id,
    },
    'Contact enquiry sent.'
  );
});

export default submitContactEnquiry;
