import {
  User,
  CourseEnrollment,
  AssignmentSubmission,
  QuizAttempt,
  Certificate,
  CoursePayment,
  Invoice,
  SupportTicket,
  StudentNote,
  StudentGoal,
  StudentDocument,
  CourseFeedback,
  Referral,
  DiscussionPost,
  Notification,
} from '../models/index.js';
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
 * PATCH /api/v1/users/:id/deactivate   (admin) — soft delete (deactivate)
 * Kept as an explicit, reversible action separate from hard delete.
 */
export const deactivateUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot deactivate your own account.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
  if (!user) throw ApiError.notFound('User not found.');
  return sendOk(res, { id: req.params.id }, 'User deactivated');
});

/**
 * DELETE /api/v1/users/:id   (admin) — HARD delete + related-data cleanup.
 * Permanently removes the user and everything they own so no orphaned records
 * are left behind. This cannot be undone; use deactivate for a reversible block.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot delete your own account.');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');

  // Protect admin accounts from deletion via this endpoint.
  if (user.role === 'admin') {
    throw ApiError.badRequest('Admin accounts cannot be deleted here.');
  }

  const userId = user._id;

  // Remove all records that belong to this user. Each collection keys off the
  // user via `user_id`, except Referral (referrer_id) and Notification
  // (recipient_id / sender_id).
  await Promise.all([
    CourseEnrollment.deleteMany({ user_id: userId }),
    AssignmentSubmission.deleteMany({ user_id: userId }),
    QuizAttempt.deleteMany({ user_id: userId }),
    Certificate.deleteMany({ user_id: userId }),
    CoursePayment.deleteMany({ user_id: userId }),
    Invoice.deleteMany({ user_id: userId }),
    SupportTicket.deleteMany({ user_id: userId }),
    StudentNote.deleteMany({ user_id: userId }),
    StudentGoal.deleteMany({ user_id: userId }),
    StudentDocument.deleteMany({ user_id: userId }),
    CourseFeedback.deleteMany({ user_id: userId }),
    DiscussionPost.deleteMany({ user_id: userId }),
    Referral.deleteMany({ referrer_id: userId }),
    Notification.deleteMany({ $or: [{ recipient_id: userId }, { sender_id: userId }] }),
  ]);

  await user.deleteOne();

  return sendOk(res, { id: req.params.id }, 'User and related data permanently deleted');
});
