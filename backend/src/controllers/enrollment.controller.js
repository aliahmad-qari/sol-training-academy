import { CourseEnrollment, CourseTopic, User, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { enrollUserInCourse } from '../services/enrollment.service.js';
import { issueCertificate } from '../services/certificate.service.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/v1/enrollments   (protected)
 * Students → own enrollments; staff → all (filters/pagination).
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
 * POST /api/v1/enrollments   (staff)  — manual/free enrollment
 * Body: { user_id, course_id }
 */
export const createEnrollment = asyncHandler(async (req, res) => {
  const { user_id, course_id } = req.body;
  if (!user_id || !course_id) throw ApiError.badRequest('user_id and course_id are required.');
  const { enrollment, created } = await enrollUserInCourse({ userId: user_id, courseId: course_id });
  return sendCreated(res, enrollment, created ? 'Enrollment created' : 'Already enrolled');
});

/**
 * POST /api/v1/enrollments/bulk   (staff)
 * Body: { user_ids: [], course_id }  OR  { user_id, course_ids: [] }
 */
export const bulkEnroll = asyncHandler(async (req, res) => {
  const { user_ids, course_ids, course_id, user_id } = req.body;
  const results = [];

  if (Array.isArray(user_ids) && course_id) {
    for (const uid of user_ids) {
      // eslint-disable-next-line no-await-in-loop
      const { enrollment, created } = await enrollUserInCourse({ userId: uid, courseId: course_id });
      results.push({ user_id: uid, enrollment_id: enrollment._id, created });
    }
  } else if (Array.isArray(course_ids) && user_id) {
    for (const cid of course_ids) {
      // eslint-disable-next-line no-await-in-loop
      const { enrollment, created } = await enrollUserInCourse({ userId: user_id, courseId: cid });
      results.push({ course_id: cid, enrollment_id: enrollment._id, created });
    }
  } else {
    throw ApiError.badRequest('Provide (user_ids + course_id) or (course_ids + user_id).');
  }

  return sendCreated(res, { count: results.length, results }, 'Bulk enrollment complete');
});

/**
 * PATCH /api/v1/enrollments/:id/progress   (protected; owner)
 * Body: { topic_id, completed: true }
 * Marks a topic complete, recomputes progress %, and auto-issues a
 * certificate + completion when all topics are done.
 */
export const updateProgress = asyncHandler(async (req, res) => {
  const { topic_id, completed = true } = req.body;
  if (!topic_id) throw ApiError.badRequest('topic_id is required.');

  const enrollment = await CourseEnrollment.findById(req.params.id);
  if (!enrollment) throw ApiError.notFound('Enrollment not found.');

  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(enrollment.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot update this enrollment.');
  }

  // Verify the topic belongs to this course.
  const topic = await CourseTopic.findById(topic_id).lean();
  if (!topic || String(topic.course_id) !== String(enrollment.course_id)) {
    throw ApiError.badRequest('Topic does not belong to this course.');
  }

  const set = new Set((enrollment.completed_topic_ids || []).map(String));
  if (completed) set.add(String(topic_id));
  else set.delete(String(topic_id));
  enrollment.completed_topic_ids = [...set];
  enrollment.last_topic_id = topic_id;

  // Recompute progress against the course's total topics.
  const totalTopics = await CourseTopic.countDocuments({ course_id: enrollment.course_id });
  const done = enrollment.completed_topic_ids.length;
  enrollment.progress_percent = totalTopics > 0 ? Math.min(100, Math.round((done / totalTopics) * 100)) : 0;

  let certificate = null;
  if (totalTopics > 0 && done >= totalTopics && enrollment.status !== 'completed') {
    enrollment.status = 'completed';
    enrollment.completed_date = new Date();
  }
  await enrollment.save();

  // Auto-issue certificate on completion (idempotent, best-effort).
  // A certificate/upload failure (e.g. Cloudinary down or unconfigured) must
  // NOT fail the progress update — the completion is already persisted. We
  // surface a warning flag so the student can retry via POST /certificates/issue.
  let certificateError = null;
  if (enrollment.status === 'completed' && !enrollment.certificate_issued) {
    try {
      certificate = await issueCertificate({
        userId: enrollment.user_id,
        courseId: enrollment.course_id,
        enrollmentId: enrollment._id,
      });
    } catch (err) {
      logger.error(`[enrollment] Certificate issuance failed for ${enrollment._id}: ${err.message}`);
      certificateError = 'Certificate could not be generated yet. Please try again later.';
    }
  }

  const fresh = await CourseEnrollment.findById(enrollment._id).lean();
  return sendOk(res, { enrollment: fresh, certificate, certificate_error: certificateError }, 'Progress updated');
});

/**
 * PATCH /api/v1/enrollments/:id   (staff) — update status / expiry
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
