import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/users   (staff)
 * Filter by role/is_active; search by name/email.
 */
export const listUsers = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['role', 'is_active'],
    searchFields: ['full_name', 'email'],
    defaultSort: '-createdAt',
  });
  const [items, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return sendOk(res, items, 'Users', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/users/:id   (staff, or self)
 */
export const getUser = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(req.params.id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot access this user.');
  }
  const user = await User.findById(req.params.id).lean();
  if (!user) throw ApiError.notFound('User not found.');
  return sendOk(res, user, 'User detail');
});

/**
 * POST /api/v1/users   (admin) — create staff/student accounts
 * Body: { full_name, email, password, role?, page_permissions? }
 */
export const createUser = asyncHandler(async (req, res) => {
  const { full_name, email, password, role = 'student', phone, page_permissions } = req.body;
  if (!full_name || !email || !password) {
    throw ApiError.badRequest('full_name, email and password are required.');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw ApiError.conflict('A user with this email already exists.');

  const user = await User.create({
    full_name,
    email,
    password,
    role,
    phone,
    // Admin-provisioned accounts are trusted — they get their password directly
    // from the admin and log in without the self-service OTP step.
    is_verified: true,
    page_permissions: role === 'team_member' ? page_permissions || [] : [],
  });
  return sendCreated(res, user.toJSON(), 'User created');
});

/**
 * PATCH /api/v1/users/me   (protected) — update own profile
 * Body: { full_name?, phone?, avatar_url? }
 */
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['full_name', 'phone', 'avatar_url'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  });
  return sendOk(res, user.toJSON(), 'Profile updated');
});

/**
 * PATCH /api/v1/users/:id   (admin) — update role/permissions/active
 * Body: { role?, page_permissions?, is_active?, full_name? }
 */
export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ['role', 'page_permissions', 'is_active', 'full_name', 'phone'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found.');
  return sendOk(res, user.toJSON(), 'User updated');
});

/**
 * DELETE /api/v1/users/:id   (admin) — soft delete (deactivate)
 */
export const deactivateUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot deactivate your own account.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
  if (!user) throw ApiError.notFound('User not found.');
  return sendOk(res, { id: req.params.id }, 'User deactivated');
});
