import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';

import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { xssSanitizer, mongoSanitizer } from './middleware/security.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import apiRouter from './routes/index.js';
import { stripeWebhookRouter } from './routes/webhook.routes.js';

const app = express();

// Render/Railway sit behind a proxy; trust it so secure cookies &
// express-rate-limit see the real client IP.
app.set('trust proxy', 1);

// --------------------------------------------------------------------------
//  Stripe webhook MUST receive the raw body for signature verification,
//  so it is mounted BEFORE express.json(). It uses express.raw() internally.
// --------------------------------------------------------------------------
app.use('/api/v1/webhooks/stripe', stripeWebhookRouter);

// --------------------------------------------------------------------------
//  Security headers
// --------------------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// --------------------------------------------------------------------------
//  CORS — allow configured origins + all Vercel preview deployments.
//  Credentials (cookies) require an explicit origin, never wildcard.
// --------------------------------------------------------------------------
const VERCEL_PREVIEW_RE = /^https:\/\/[\w-]+-[\w-]+\.vercel\.app$/;

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (curl / Postman / Render health-checks) with no Origin.
    if (!origin) return callback(null, true);

    // Allow any configured explicit origin (e.g. your production Vercel URL).
    if (env.clientOrigins.includes(origin)) return callback(null, true);

    // Allow all Vercel preview-deploy URLs (*.vercel.app) so PR previews work.
    if (VERCEL_PREVIEW_RE.test(origin)) return callback(null, true);

    // Allow localhost on any port for local development.
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);

    return callback(new Error(`CORS: origin "${origin}" is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// --------------------------------------------------------------------------
//  Body parsing (with sane size limits) & cookies
// --------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// --------------------------------------------------------------------------
//  Request logging
// --------------------------------------------------------------------------
const morganFormat = env.isProd ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.originalUrl === '/api/v1/health',
  })
);

// --------------------------------------------------------------------------
//  Input hardening: HTTP param pollution, Mongo operator injection, XSS
// --------------------------------------------------------------------------
app.use(hpp());
app.use(mongoSanitizer);
app.use(xssSanitizer);

// --------------------------------------------------------------------------
//  Rate limiting (applied to the API surface)
// --------------------------------------------------------------------------
app.use('/api', apiLimiter);

// --------------------------------------------------------------------------
//  Routes
// --------------------------------------------------------------------------
app.use('/api/v1', apiRouter);

// Root probe (useful for uptime checks that hit "/")
app.get('/', (req, res) => {
  res.json({ success: true, message: 'SOL Training Academy API', version: 'v1' });
});

// --------------------------------------------------------------------------
//  404 + global error handler (must be last)
// --------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
