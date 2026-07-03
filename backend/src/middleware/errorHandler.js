import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * 404 handler for unmatched routes. Placed after all route registrations.
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Normalizes any thrown value into an ApiError-like shape.
 */
const normalizeError = (err) => {
  // Already an operational ApiError.
  if (err instanceof ApiError) return err;

  // Mongoose: bad ObjectId / cast failure.
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid value for field "${err.path}": ${err.value}`);
  }

  // Mongoose: schema validation failed.
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.unprocessable('Validation failed', details);
  }

  // Mongo duplicate key (unique index violation).
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for "${field}". It already exists.`);
  }

  // JWT errors.
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid authentication token.');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Authentication token has expired.');
  }

  // Stripe signature / API errors carry a statusCode.
  if (err.type && String(err.type).startsWith('Stripe')) {
    return new ApiError(err.statusCode || 400, err.message || 'Payment processing error');
  }

  // JSON body parse error from express.json().
  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Invalid JSON payload.');
  }

  // Fallback: treat as internal server error (a bug), keep original message.
  const fallback = new ApiError(err.statusCode || 500, err.message || 'Internal server error');
  fallback.isOperational = false;
  fallback.stack = err.stack;
  return fallback;
};

/**
 * Global error-handling middleware. Must have the 4-arg signature.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  // Log server-side. Only log full stack for non-operational (unexpected) errors.
  if (!error.isOperational || error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${error.statusCode} ${error.message}`);
    if (error.stack) logger.error(error.stack);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${error.statusCode} ${error.message}`);
  }

  const body = {
    success: false,
    message: error.message,
  };
  if (error.details) body.details = error.details;
  // Never leak stack traces in production.
  if (!env.isProd && error.stack) body.stack = error.stack;

  res.status(error.statusCode || 500).json(body);
};

export default errorHandler;
