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
//  CORS — allow configured origins + all Vercel deployments.
//  Credentials (cookies) require an explicit origin, never wildcard.
// --------------------------------------------------------------------------
// Any *.vercel.app host (production alias AND preview builds). Broadened from
// the old `-`-requiring preview pattern so the bare production alias
// (https://sol-training-academy.vercel.app) is matched with certainty and
// never depends on CLIENT_URL being set correctly on Render.
const VERCEL_RE = /^https:\/\/[\w-]+\.vercel\.app$/;

// Known production origins, hardcoded as a safety net in case the CLIENT_URL
// env var is missing/misspelled on the host. env.clientOrigins is still honored.
const STATIC_ALLOWED_ORIGINS = ['https://sol-training-academy.vercel.app'];

const isAllowedOrigin = (origin) =>
  env.clientOrigins.includes(origin) ||
  STATIC_ALLOWED_ORIGINS.includes(origin) ||
  VERCEL_RE.test(origin) ||
  /^http:\/\/localhost(:\d+)?$/.test(origin) ||
  /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (curl / Postman / Render health-checks) with no Origin.
    if (!origin) return callback(null, true);
    // IMPORTANT: reject by returning `false`, NOT by throwing. A thrown error
    // routes to the error handler, which sends a 500 with NO CORS headers —
    // making a disallowed origin look identical to a server crash. Returning
    // false lets `cors` respond cleanly without the ACAO header.
    return callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // Authorization is required (Bearer token); the rest are safelisted or
  // commonly sent by Axios/upload clients. multipart/form-data itself needs no
  // special header here — the browser sets Content-Type with the boundary.
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  // Cache the preflight result for 24h so browsers don't re-OPTIONS every
  // upload (also avoids preflight being affected by cold starts repeatedly).
  maxAge: 86400,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
// Answer ALL preflight OPTIONS with the same policy, before any auth / rate
// limiting / body parsing can interfere with the handshake.
app.options('*', cors(corsOptions));

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
