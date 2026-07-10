import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized, validated environment configuration.
 * Fails fast at boot if a critical variable is missing, so we never
 * deploy a half-configured server to Render/Railway.
 */

const required = (key) => {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    // In production we hard-fail. In development we warn so the dev can
    // still boot partial features (e.g. before Stripe keys exist).
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    // eslint-disable-next-line no-console
    console.warn(`[env] WARNING: environment variable "${key}" is not set.`);
    return undefined;
  }
  return value;
};

const optional = (key, fallback) => {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
};

const toNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toBool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
};

const parseOrigins = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProd: optional('NODE_ENV', 'development') === 'production',
  port: toNumber(process.env.PORT, 5000),

  clientOrigins: parseOrigins(optional('CLIENT_URL', 'http://localhost:5173')),
  // First configured client origin — used to build absolute links in emails
  // (e.g. the password-reset link). Falls back to the local dev URL.
  clientUrl: parseOrigins(optional('CLIENT_URL', 'http://localhost:5173'))[0] || 'http://localhost:5173',
  apiUrl: optional('API_URL', 'http://localhost:5000'),

  mongoUri: required('MONGODB_URI'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  cookie: {
    domain: optional('COOKIE_DOMAIN', undefined),
    secure: toBool(process.env.COOKIE_SECURE, false),
  },

  stripe: {
    secretKey: optional('STRIPE_SECRET_KEY', ''),
    webhookSecret: optional('STRIPE_WEBHOOK_SECRET', ''),
    currency: optional('STRIPE_CURRENCY', 'aud'),
    successUrl: optional('STRIPE_SUCCESS_URL', 'http://localhost:5173/payment-success'),
    cancelUrl: optional('STRIPE_CANCEL_URL', 'http://localhost:5173/checkout'),
  },

  // Transactional email (OTP + password reset). Delivered over an HTTPS API
  // (Resend by default) rather than SMTP, which Render blocks/greylists.
  // `optional` so the server still boots without a key in dev; the email
  // service then throws a clear "not configured" error only at send time.
  email: {
    provider: optional('EMAIL_PROVIDER', 'resend'), // 'resend' | 'sendgrid'
    // Accept RESEND_API_KEY (what's set on Render) OR the generic EMAIL_API_KEY.
    apiKey: optional('RESEND_API_KEY', optional('EMAIL_API_KEY', '')),
    from: optional('EMAIL_FROM', 'SOL Business Consultant <saf@solbusinessconsultant.com.au>'),
    // Absolute URL to the logo used in email headers. Emails require a public
    // absolute URL (clients block relative paths / most base64). Served from the
    // frontend's /public. Falls back to the first client origin.
    logoUrl: optional(
      'EMAIL_LOGO_URL',
      `${parseOrigins(optional('CLIENT_URL', 'http://localhost:5173'))[0] || 'http://localhost:5173'}/sol-logo.jpg`
    ),
  },

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: optional('CLOUDINARY_API_KEY', ''),
    apiSecret: optional('CLOUDINARY_API_SECRET', ''),
    folder: optional('CLOUDINARY_FOLDER', 'sol_training_academy'),
  },

  // Groq AI. Kept `optional` so the server still boots
  // without a key in dev; AI routes then return a clear "not configured" error.
  groq: {
    apiKey: optional('GROQ_API_KEY', ''),
    model: optional('GROQ_MODEL', 'llama-3.3-70b-versatile'),
  },

  company: {
    name: optional('COMPANY_NAME', 'SOL Business Consultant Pty Ltd'),
    abn: optional('COMPANY_ABN', ''),
    address: optional('COMPANY_ADDRESS', 'Australia'),
    gstRate: toNumber(process.env.GST_RATE, 0.1),
  },

  rateLimit: {
    windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toNumber(process.env.RATE_LIMIT_MAX, 300),
    authMax: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 20),
    // AI endpoints (Groq). Defaults raised from the old Gemini free-tier 15/min.
    aiWindowMs: toNumber(process.env.AI_RATE_LIMIT_WINDOW_MS, 60 * 1000),
    aiMax: toNumber(process.env.AI_RATE_LIMIT_MAX, 30),
  },

  seedAdmin: {
    name: optional('SEED_ADMIN_NAME', 'SOL Admin'),
    email: optional('SEED_ADMIN_EMAIL', ''),
    password: optional('SEED_ADMIN_PASSWORD', ''),
  },
};

export default env;
