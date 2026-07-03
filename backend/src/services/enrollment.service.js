import { CourseEnrollment, Course, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Create (or return existing) enrollment for a user in a course.
 * Idempotent thanks to the unique (user_id, course_id) index.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.courseId
 * @returns {Promise<{enrollment: import('mongoose').Document, created: boolean}>}
 */
export const enrollUserInCourse = async ({ userId, courseId }) => {
  const existing = await CourseEnrollment.findOne({ user_id: userId, course_id: courseId });
  if (existing) return { enrollment: existing, created: false };

  const [user, course] = await Promise.all([User.findById(userId), Course.findById(courseId)]);
  if (!user) throw ApiError.notFound('User not found.');
  if (!course) throw ApiError.notFound('Course not found.');

  // Compute expiry from the course access window (0 = unlimited).
  let expiryDate;
  if (course.access_duration_days && course.access_duration_days > 0) {
    expiryDate = new Date(Date.now() + course.access_duration_days * 86400000);
  }

  try {
    const enrollment = await CourseEnrollment.create({
      user_id: user._id,
      user_email: user.email,
      user_name: user.full_name,
      course_id: course._id,
      course_level: course.level,
      course_title: course.title,
      status: 'active',
      progress_percent: 0,
      expiry_date: expiryDate,
    });
    return { enrollment, created: true };
  } catch (err) {
    // Race: another request created it between our check and insert.
    if (err.code === 11000) {
      const enrollment = await CourseEnrollment.findOne({ user_id: userId, course_id: courseId });
      return { enrollment, created: false };
    }
    throw err;
  }
};

export default enrollUserInCourse;
