import { Router } from 'express';
import { studentOverview } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.js';
import { enrollUserInCourse } from '../services/enrollment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

router.use(protect);

router.get('/overview', studentOverview);

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


