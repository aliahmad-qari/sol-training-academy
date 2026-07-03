import { verifyAccessToken } from '../helpers/token.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

/**
 * `protect` — require a valid access token. Attaches `req.user`.
 * Reads the token from the Authorization: Bearer header.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.slice(7).trim();
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. No token provided.');
  }

  // Throws JsonWebTokenError/TokenExpiredError → handled by errorHandler.
  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists.');
  }
  if (!user.is_active) {
    throw ApiError.forbidden('Account is disabled.');
  }

  req.user = user;
  return next();
});

/**
 * `authorize(...roles)` — RBAC gate. Use after `protect`.
 * Example: router.post('/', protect, authorize('admin', 'team_member'), handler)
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required.'));
  }
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action.'));
  }
  return next();
};

/**
 * `optionalAuth` — attach req.user if a valid token is present, but never
 * reject the request. Useful for endpoints with public + enriched views.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const decoded = verifyAccessToken(header.slice(7).trim());
    const user = await User.findById(decoded.sub);
    if (user && user.is_active) req.user = user;
  } catch {
    // ignore invalid token for optional auth
  }
  return next();
});

export default protect;
