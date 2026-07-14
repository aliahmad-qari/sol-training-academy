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
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

// Roles an admin is allowed to provision via POST /users. `admin` is included
// so admins can create other admins, but the value is validated explicitly here
// rather than trusting whatever the client sends (defence-in-depth on top of the
// schema enum, and it yields a clean 400 instead of a Mongoose ValidationError).
const CREATABLE_ROLES = ['student', 'team_member', 'admin'];

/**
 * Generate a strong, human-shareable temporary password.
 * ~20 chars of URL-safe base64 → well above the 8-char schema minimum and far
 * beyond brute-force range. Returned to the admin ONCE (never stored in plain
 * text — the pre-save hook hashes it with bcrypt).
 */
const generateTempPassword = () =>
  crypto.randomBytes(15).toString('base64url'); // 15 bytes → 20 url-safe chars

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
 * POST /api/v1/users   (admin) — create staff/student/team accounts
 *
 * Body: {
 *   full_name, email,
 *   password?,               // if omitted, a strong temp password is generated
 *   role?,                   // 'student' (default) | 'team_member' | 'admin'
 *   phone?,
 *   page_permissions?,       // [pageId] — only applied for role 'team_member'
 *   job_title?, department?, job_role?,  // team-member profile (optional)
 * }
 *
 * This is the ONE endpoint admins use to create ANY account. It is deliberately
 * separate from /auth/register (student self-signup, OTP-gated) so there is no
 * conflict between the two pipelines — admin-provisioned accounts skip OTP and
 * are created verified. When `password` is omitted the backend generates one and
 * returns it ONCE so the admin can share it securely (used by the team-invite
 * flow); it is bcrypt-hashed before storage by the User pre-save hook.
 *
 * Returns: { ...user, generated_password? }  (generated_password present only
 * when the server generated the password).
 */
export const createUser = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    role = 'student',
    phone,
    page_permissions,
    job_title,
    department,
    job_role,
  } = req.body;

  if (!full_name || !email) {
    throw ApiError.badRequest('full_name and email are required.');
  }

  // Strict role-scope validation — never trust the client's role string.
  if (!CREATABLE_ROLES.includes(role)) {
    throw ApiError.badRequest(
      `Invalid role "${role}". Must be one of: ${CREATABLE_ROLES.join(', ')}.`
    );
  }

  // A provided password must satisfy the schema minimum; otherwise we generate.
  if (password !== undefined && String(password).length < 8) {
    throw ApiError.badRequest('Password must be at least 8 characters.');
  }
  const wasGenerated = !password;
  const finalPassword = password || generateTempPassword();

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw ApiError.conflict('A user with this email already exists.');

  const isTeam = role === 'team_member';

  const user = await User.create({
    full_name,
    email,
    password: finalPassword,
    role,
    phone,
    // Admin-provisioned accounts are trusted — they get their password directly
    // from the admin and log in without the self-service OTP step.
    is_verified: true,
    // page_permissions only carry meaning for team members; scrub them for other
    // roles so a stray payload can't grant an admin/student a bogus perm list.
    page_permissions: isTeam ? page_permissions || [] : [],
    // Profile fields only stored for team members.
    ...(isTeam ? { job_title, department, job_role } : {}),
    ...(isTeam && req.user ? { invited_by: req.user.full_name || String(req.user._id) } : {}),
  });

  const data = user.toJSON();
  // Surface the generated password exactly once so the admin can relay it. It is
  // NOT persisted in plain text and will never be returned by any other endpoint.
  if (wasGenerated) data.generated_password = finalPassword;

  return sendCreated(res, data, 'User created');
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
  const allowed = [
    'role', 'page_permissions', 'is_active', 'full_name', 'phone',
    'job_title', 'department', 'job_role',
  ];
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
