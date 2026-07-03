import streamifier from 'streamifier';
import { cloudinary, isCloudinaryConfigured } from './cloudinary.config.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Upload an in-memory buffer to Cloudinary via an upload stream.
 *
 * @param {Buffer} buffer      - file bytes (from multer memoryStorage)
 * @param {object} options
 * @param {string} options.folder      - subfolder under the app root folder
 * @param {string} [options.publicId]  - explicit public_id
 * @param {'image'|'video'|'raw'|'auto'} [options.resourceType='auto']
 * @param {string} [options.filename]  - original filename (for raw files)
 * @returns {Promise<{url:string, publicId:string, bytes:number, format:string, resourceType:string}>}
 */
export const uploadBuffer = (buffer, { folder, publicId, resourceType = 'auto', filename } = {}) => {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(ApiError.internal('Cloudinary is not configured on the server.'));
  }

  const fullFolder = `${env.cloudinary.folder}/${folder}`.replace(/\/+/g, '/');

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: fullFolder,
        public_id: publicId,
        resource_type: resourceType,
        use_filename: Boolean(filename),
        unique_filename: !publicId,
        overwrite: Boolean(publicId),
        filename_override: filename,
      },
      (error, result) => {
        if (error) return reject(new ApiError(502, `Cloudinary upload failed: ${error.message}`));
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type,
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete an asset by public_id. Safe to call with a falsy id (no-op).
 */
export const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId || !isCloudinaryConfigured()) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // Deletion failures should not break the main flow.
    return null;
  }
};

export default uploadBuffer;
