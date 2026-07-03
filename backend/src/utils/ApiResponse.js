/**
 * Standard success envelope used by every controller so the frontend
 * always receives a predictable shape:
 *
 *   { success: true, message, data, meta? }
 *
 * `meta` carries pagination info when present.
 */
export const sendResponse = (res, statusCode, { message = 'OK', data = null, meta = undefined } = {}) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, data, message = 'Created successfully') =>
  sendResponse(res, 201, { message, data });

export const sendOk = (res, data, message = 'OK', meta) =>
  sendResponse(res, 200, { message, data, meta });

export default sendResponse;
