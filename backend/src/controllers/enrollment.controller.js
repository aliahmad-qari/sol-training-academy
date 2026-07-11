import { CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { enrollUserInCourse } from '../services/enrollment.service.js';
import { applyTopicProgress } from '../services/enrollmentProgress.service.js';

/**
 * GET /api/v1/enrollments   (protected)
 * Students -> own enrollments; staff -> all (filters/pagination).
 */
export const listEnrollments = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const baseFilter = isStaff ? {} : { user_id: req.user._id };

  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['status', 'course_id', 'user_id', 'course_level'],
    searchFields: ['course_title', 'user_name', 'user_email'],
    defaultSort: '-createdAt',
  });

  const finalFilter = { ...baseFilter, ...filter };
  const [items, total] = await Promise.all([
    CourseEnrollment.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    CourseEnrollment.countDocuments(finalFilter),
  ]);

  return sendOk(res, items, 'Enrollments', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/enrollments/:id   (protected; owner or staff)
 */
export const getEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await CourseEnrollment.findById(req.params.id).lean();
  if (!enrollment) throw ApiError.notFound('Enrollment not found.');

  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(enrollment.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot access this enrollment.');
  }
  return sendOk(res, enrollment, 'Enrollment detail');
});

/**
 * POST /api/v1/enrollments   (staff) -> manual/free enrollment
 * Body: { user_id, course_id }
 */
export const createEnrollment = asyncHandler(async (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id) throw ApiError.badRequest('user_id and course_id are required.');
  const { enrollment, created } = await enrollUserInCourse({ userId: user_id, courseId: course_id, actorId: req.user._id, source: 'admin' });
  return sendCreated(res, enrollment, created ? 'Enrollment created' : 'Already enrolled');
});

/**
 * POST /api/v1/enrollments/bulk   (staff)
 * Body: { user_ids: [], course_id } OR { user_id, course_ids: [] }
 */
export const bulkEnroll = asyncHandler(async (req, res) => {
  const { user_ids, course_ids, course_id, user_id } = req.body;
  const results = [];

  if (Array.isArray(user_ids) && course_id) {
    for (const uid of user_ids) {
      // eslint-disable-next-line no-await-in-loop
      const { enrollment, created } = await enrollUserInCourse({ userId: uid, courseId: course_id, actorId: req.user._id, source: 'admin_bulk' });
      results.push({ user_id: uid, enrollment_id: enrollment._id, created });
    }
  } else if (Array.isArray(course_ids) && user_id) {
    for (const cid of course_ids) {
      // eslint-disable-next-line no-await-in-loop
      const { enrollment, created } = await enrollUserInCourse({ userId: user_id, courseId: cid, actorId: req.user._id, source: 'admin_bulk' });
      results.push({ course_id: cid, enrollment_id: enrollment._id, created });
    }
  } else {
    throw ApiError.badRequest('Provide (user_ids + course_id) or (course_ids + user_id).');
  }

  return sendCreated(res, { count: results.length, results }, 'Bulk enrollment complete');
});

/**
 * PATCH /api/v1/enrollments/:id/progress   (protected; owner)
 * Body: { topic_id, completed, watch_progress_percent, last_position_seconds, duration_seconds }
 */
export const updateProgress = asyncHandler(async (req, res) => {
  const {
    topic_id,
    completed,
    watch_progress_percent,
    last_position_seconds,
    duration_seconds,
  } = req.body;

  const result = await applyTopicProgress({
    enrollmentId: req.params.id,
    actor: req.user,
    topicId: topic_id,
    completed,
    watchProgressPercent: watch_progress_percent,
    lastPositionSeconds: last_position_seconds,
    durationSeconds: duration_seconds,
    enforceOwnership: true,
  });

  return sendOk(res, result, 'Progress updated');
});

/**
 * PATCH /api/v1/enrollments/:id   (staff) -> update status / expiry
 */
export const updateEnrollment = asyncHandler(async (req, res) => {
  const allowed = ['status', 'expiry_date', 'progress_percent'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const enrollment = await CourseEnrollment.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found.');
  return sendOk(res, enrollment, 'Enrollment updated');
});

/**
 * DELETE /api/v1/enrollments/:id   (staff)
 */
export const deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await CourseEnrollment.findByIdAndDelete(req.params.id);
  if (!enrollment) throw ApiError.notFound('Enrollment not found.');
  return sendOk(res, { id: req.params.id }, 'Enrollment deleted');
});
