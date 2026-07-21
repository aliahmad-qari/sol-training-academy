import { CourseEnrollment, User } from '../models/index.js';
import { safeCreateNotification } from '../services/notification.service.js';
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

  // Attach each user's live account status + last login so staff UIs can show
  // the correct Suspend/Activate action and when the student last signed in.
  // Enrollments don't store these themselves — they live on the User — so a
  // suspended student would otherwise still look active.
  if (isStaff && items.length) {
    const userIds = [...new Set(items.map((e) => String(e.user_id)))];
    const users = await User.find({ _id: { $in: userIds } }, 'is_active last_login_at').lean();
    const byId = new Map(users.map((u) => [String(u._id), u]));
    for (const e of items) {
      const u = byId.get(String(e.user_id));
      e.is_active = u ? u.is_active !== false : true;
      e.last_login_at = u?.last_login_at ?? null;
    }
  }

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
  const allowed = ['status', 'expiry_date', 'progress_percent', 'reminder_sent_days'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const enrollment = await CourseEnrollment.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!enrollment) throw ApiError.notFound('Enrollment not found.');
  return sendOk(res, enrollment, 'Enrollment updated');
});

const DAY_MS = 1000 * 60 * 60 * 24;
const REMINDER_DAYS = [30, 15, 7];

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * POST /api/v1/enrollments/expiry-reminders   (staff)
 * Marks expired access and creates in-app notifications for 30/15/7 day reminders.
 */
export const runExpiryReminders = asyncHandler(async (req, res) => {
  const today = startOfDay();
  const enrollments = await CourseEnrollment.find({ expiry_date: { $exists: true, $ne: null } });

  let remindersSent = 0;
  let expiredCount = 0;

  for (const enrollment of enrollments) {
    const expiry = startOfDay(enrollment.expiry_date);
    const daysRemaining = Math.round((expiry - today) / DAY_MS);

    if (daysRemaining < 0 && enrollment.status !== 'expired') {
      enrollment.status = 'expired';
      expiredCount += 1;
    }

    if (
      REMINDER_DAYS.includes(daysRemaining) &&
      !enrollment.reminder_sent_days.includes(daysRemaining) &&
      enrollment.status !== 'completed'
    ) {
      await safeCreateNotification({
        recipientId: enrollment.user_id,
        senderId: req.user._id,
        type: 'course_expiry_reminder',
        title: `Course access expires in ${daysRemaining} days`,
        message: `Your access to ${enrollment.course_title || 'this course'} expires on ${expiry.toLocaleDateString('en-AU')}. Please complete any remaining training before that date.`,
        priority: daysRemaining <= 7 ? 'high' : 'normal',
        category: 'course',
        actionUrl: '/student-dashboard',
        metadata: {
          enrollment_id: String(enrollment._id),
          course_id: String(enrollment.course_id),
          days_remaining: daysRemaining,
          expiry_date: expiry.toISOString(),
        },
        eventKey: `course-expiry:${enrollment._id}:${daysRemaining}`,
      });
      enrollment.reminder_sent_days.addToSet(daysRemaining);
      remindersSent += 1;
    }

    if (enrollment.isModified()) {
      await enrollment.save();
    }
  }

  return sendOk(
    res,
    { reminders_sent: remindersSent, expired_count: expiredCount },
    'Expiry reminders processed'
  );
});
/**
 * DELETE /api/v1/enrollments/:id   (staff)
 */
export const deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await CourseEnrollment.findByIdAndDelete(req.params.id);
  if (!enrollment) throw ApiError.notFound('Enrollment not found.');
  return sendOk(res, { id: req.params.id }, 'Enrollment deleted');
});
