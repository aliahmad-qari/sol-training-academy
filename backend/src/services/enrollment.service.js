import { CourseEnrollment, Course, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { safeCreateNotification, safeNotifyAdmins } from './notification.service.js';

/**
 * Create (or return existing) enrollment for a user in a course.
 * Idempotent thanks to the unique (user_id, course_id) index.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.courseId
 * @returns {Promise<{enrollment: import('mongoose').Document, created: boolean}>}
 */
export const enrollUserInCourse = async ({ userId, courseId, actorId = null, source = 'system' }) => {
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
      course_thumbnail_url: course.thumbnail_url || '',
      status: 'active',
      progress_percent: 0,
      expiry_date: expiryDate,
    });

    void safeCreateNotification({
      recipientId: user._id,
      senderId: actorId,
      type: 'course_enrolled',
      title: 'Course enrollment confirmed',
      message: `You now have access to ${course.title}.`,
      category: 'course',
      priority: 'normal',
      actionUrl: '/student-dashboard',
      metadata: { tab: 'courses', course_id: course._id, enrollment_id: enrollment._id, source },
      eventKey: `course_enrolled:${enrollment._id}`,
    });

    void safeNotifyAdmins({
      senderId: actorId || user._id,
      type: 'student_enrolled',
      title: 'Student enrolled in a course',
      message: `${user.full_name} enrolled in ${course.title}.`,
      category: 'course',
      priority: 'normal',
      actionUrl: '/lms-admin',
      metadata: { tab: 'students', course_id: course._id, enrollment_id: enrollment._id, student_id: user._id, source },
      eventKey: `student_enrolled:${enrollment._id}`,
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

