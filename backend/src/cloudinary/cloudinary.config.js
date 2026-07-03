import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Configure the Cloudinary SDK once at import time.
 * If credentials are missing (e.g. before they're set on Render), we log a
 * warning rather than crash — upload calls will then fail loudly at runtime.
 */
if (env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
} else {
  logger.warn('[cloudinary] Credentials not fully configured. Uploads will fail until set.');
}

export const isCloudinaryConfigured = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

export { cloudinary };
export default cloudinary;
