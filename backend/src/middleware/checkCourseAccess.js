import mongoose from 'mongoose';
import { CourseEnrollment, CourseModule, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const STAFF_ROLES = ['admin', 'team_member'];

/**
 * Resolve the target course_id for a curriculum list request.
 *
 * The Student Portal always queries `?course_id=...`, but the topics endpoint
 * also supports `?module_id=...` (curriculum builder). When only a module_id is
 * present we look up its parent course so access can still be enforced.
 *
 * @returns {Promise<string|null>} the course id, or null if none can be derived
 */
const resolveCourseId = async (query) => {
  if (query.course_id && mongoose.isValidObjectId(query.course_id)) {
    return String(query.course_id);
  }
  if (query.module_id && mongoose.isValidObjectId(query.module_id)) {
    const mod = await CourseModule.findById(query.module_id).select('course_id').lean();
    return mod ? String(mod.course_id) : null;
  }
  return null;
};

/**
 * checkCourseAccess — enrollment gateway for student-facing curriculum reads
 * (GET /api/v1/topics, GET /api/v1/modules).
 *
 * WHY: these endpoints expose paid content — Cloudinary video URLs, reading
 * files, assessment briefs. Previously mounted with `optionalAuth` and no
 * enrollment check, so any guest could enumerate `?course_id=` and harvest the
 * entire paid catalogue. This middleware closes that leak.
 *
 * Access rules (evaluated in order):
 *   1. Staff (admin / team_member) — always allowed (authoring & preview).
 *   2. A resolvable course_id is required. A bare, unscoped list (no course_id
 *      / module_id) is rejected for non-staff so the full catalogue can't be
 *      dumped in one call.
 *   3. The course must exist. If it is unpublished, only staff may see it
 *      (already covered by rule 1), so non-staff get 404 to avoid leaking its
 *      existence.
 *   4. An authenticated student must hold a CourseEnrollment for that course
 *      whose status is not 'expired' and whose expiry_date (if set) is in the
 *      future. Otherwise 403.
 *   5. Unauthenticated users are rejected with 401.
 *
 * Assumes `optionalAuth` (or `protect`) ran earlier so `req.user` may be set.
 * Mount as: router.get('/', optionalAuth, checkCourseAccess, listTopics)
 */
export const checkCourseAccess = asyncHandler(async (req, res, next) => {
  // 1. Staff bypass — authors/reviewers need unrestricted read access.
  if (req.user && STAFF_ROLES.includes(req.user.role)) return next();

  // 2. Non-staff must scope the request to a single course.
  const courseId = await resolveCourseId(req.query);
  if (!courseId) {
    throw ApiError.badRequest(
      'A valid course_id (or module_id) query parameter is required to view curriculum.'
    );
  }

  // 3. The course must exist and be published for non-staff viewers.
  const course = await Course.findById(courseId).select('_id is_published').lean();
  if (!course || !course.is_published) {
    // 404 (not 403) so we don't reveal that an unpublished/hidden course exists.
    throw ApiError.notFound('Course not found.');
  }

  // 5. Beyond a published course, curriculum bodies are enrollment-gated.
  if (!req.user) {
    throw ApiError.unauthorized('Please sign in and enrol to access this course content.');
  }

  // 4. Verify an active, unexpired enrollment for this student + course.
  const enrollment = await CourseEnrollment.findOne({
    user_id: req.user._id,
    course_id: courseId,
    status: { $ne: 'expired' },
    $or: [{ expiry_date: null }, { expiry_date: { $exists: false } }, { expiry_date: { $gt: new Date() } }],
  })
    .select('_id')
    .lean();

  if (!enrollment) {
    throw ApiError.forbidden('You are not enrolled in this course, or your access has expired.');
  }

  // Cache the verified course_id for downstream handlers if they want it.
  req.verifiedCourseId = courseId;
  return next();
});

export default checkCourseAccess;
