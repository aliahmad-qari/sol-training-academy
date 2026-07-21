import { Router } from 'express';
import { studentOverview } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';
import { enrollUserInCourse } from '../services/enrollment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated, sendOk } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { CourseEnrollment } from '../models/index.js';

const router = Router();

router.use(protect);

router.get('/overview', studentOverview);

/**
 * GET /api/v1/student/co-learners?course_ids=id1,id2,...
 * Returns fellow students enrolled in the same courses as the caller.
 * Exposes only: user_id, user_name, course_id, course_title,
 *               progress_percent, status, updatedAt — nothing sensitive.
 * Students can only query courses they are themselves enrolled in.
 */
router.get('/co-learners', asyncHandler(async (req, res) => {
  // Resolve which course IDs to query.
  const requested = req.query.course_ids
    ? String(req.query.course_ids).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Always scope to courses the caller is enrolled in (security gate).
  const myEnrollments = await CourseEnrollment.find({ user_id: req.user._id })
    .select('course_id')
    .lean();
  const myIds = myEnrollments.map(e => String(e.course_id));

  const targetIds = requested.length > 0
    ? requested.filter(id => myIds.includes(id))   // intersect with caller's courses
    : myIds;                                         // default: all caller's courses

  if (targetIds.length === 0) return sendOk(res, [], 'Co-learners');

  const peers = await CourseEnrollment.find({
    course_id:  { $in: targetIds },
    user_id:    { $ne: req.user._id },   // exclude self
    status:     { $in: ['active', 'completed'] },
  })
    .select('user_id user_name course_id course_title progress_percent status updatedAt')
    .sort('-updatedAt')
    .lean();

  // Safe minimal projection — no emails, no PII beyond display name.
  const safe = peers.map(e => ({
    user_id:          String(e.user_id),
    user_name:        e.user_name || 'Student',
    course_id:        String(e.course_id),
    course_title:     e.course_title || '',
    progress_percent: e.progress_percent || 0,
    status:           e.status,
    updatedAt:        e.updatedAt,
  }));

  return sendOk(res, safe, 'Co-learners');
}));

/**
 * POST /api/v1/student/enroll
 * Body: { course_id }
 * Lets a student self-enroll in a free/available course.
 */
router.post('/enroll', asyncHandler(async (req, res) => {
  const { course_id } = req.body;
  if (!course_id) throw ApiError.badRequest('course_id is required.');
  const { enrollment, created } = await enrollUserInCourse({
    userId: req.user._id,
    courseId: course_id,
    actorId: req.user._id,
    source: 'student_self_enroll',
  });
  return sendCreated(res, enrollment, created ? 'Enrolled successfully' : 'Already enrolled');
}));

export default router;


