import { CourseEnrollment, CourseTopic } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { issueCertificate } from './certificate.service.js';
import { safeCreateNotification, safeNotifyAdmins } from './notification.service.js';
import { logger } from '../utils/logger.js';

const STAFF_ROLES = ['admin', 'team_member'];

const isTruthy = (value) => value === true || value === 'true';
const isFalsy = (value) => value === false || value === 'false';

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));
const nonNegativeInt = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
};

/**
 * Canonical enrollment progress updater.
 * All learning events that complete a topic should flow through here so
 * progress_percent, last_topic_id, certificates and notifications stay aligned.
 */
export const applyTopicProgress = async ({
  enrollmentId,
  userId,
  courseId,
  actor,
  topicId,
  completed,
  watchProgressPercent,
  lastPositionSeconds,
  durationSeconds,
  enforceOwnership = false,
}) => {
  if (!topicId) throw ApiError.badRequest('topic_id is required.');

  const enrollment = enrollmentId
    ? await CourseEnrollment.findById(enrollmentId)
    : await CourseEnrollment.findOne({ user_id: userId, course_id: courseId });

  if (!enrollment) throw ApiError.notFound('Enrollment not found.');

  if (enforceOwnership) {
    const isStaff = actor && STAFF_ROLES.includes(actor.role);
    if (!isStaff && String(enrollment.user_id) !== String(actor?._id)) {
      throw ApiError.forbidden('You cannot update this enrollment.');
    }
  }

  const topic = await CourseTopic.findById(topicId).lean();
  if (!topic || String(topic.course_id) !== String(enrollment.course_id)) {
    throw ApiError.badRequest('Topic does not belong to this course.');
  }

  const watchedPct = Number(watchProgressPercent);
  const hasWatchProgress = Number.isFinite(watchedPct);
  const autoCompletedVideo = topic.type === 'video' && hasWatchProgress && watchedPct >= 80;
  const shouldComplete = isTruthy(completed) || autoCompletedVideo;
  const shouldUncomplete = isFalsy(completed);

  if (
    hasWatchProgress ||
    lastPositionSeconds !== undefined ||
    durationSeconds !== undefined ||
    shouldComplete ||
    shouldUncomplete
  ) {
    const progress = Array.isArray(enrollment.topic_progress) ? [...enrollment.topic_progress] : [];
    const idx = progress.findIndex((item) => String(item.topic_id) === String(topicId));
    const current = idx >= 0
      ? (typeof progress[idx]?.toObject === 'function' ? progress[idx].toObject() : progress[idx])
      : { topic_id: topicId };

    const nextProgress = {
      ...current,
      topic_id: topicId,
      progress_percent: hasWatchProgress
        ? clampPercent(watchedPct)
        : current.progress_percent || 0,
      last_position_seconds: nonNegativeInt(lastPositionSeconds, current.last_position_seconds || 0),
      duration_seconds: nonNegativeInt(durationSeconds, current.duration_seconds || 0),
      completed: shouldUncomplete ? false : shouldComplete || current.completed || false,
      updated_at: new Date(),
    };

    if (idx >= 0) progress[idx] = nextProgress;
    else progress.push(nextProgress);
    enrollment.topic_progress = progress;
  }

  const completedTopicIds = new Set((enrollment.completed_topic_ids || []).map(String));
  if (shouldComplete) completedTopicIds.add(String(topicId));
  if (shouldUncomplete) completedTopicIds.delete(String(topicId));
  enrollment.completed_topic_ids = [...completedTopicIds];
  enrollment.last_topic_id = topicId;

  const totalTopics = await CourseTopic.countDocuments({ course_id: enrollment.course_id });
  const done = enrollment.completed_topic_ids.length;
  enrollment.progress_percent = totalTopics > 0 ? Math.min(100, Math.round((done / totalTopics) * 100)) : 0;

  if (totalTopics > 0 && done >= totalTopics && enrollment.status !== 'completed') {
    enrollment.status = 'completed';
    enrollment.completed_date = new Date();
  }

  await enrollment.save();

  let certificate = null;
  let certificateError = null;

  if (enrollment.status === 'completed' && !enrollment.certificate_issued) {
    try {
      certificate = await issueCertificate({
        userId: enrollment.user_id,
        courseId: enrollment.course_id,
        enrollmentId: enrollment._id,
      });

      void safeCreateNotification({
        recipientId: enrollment.user_id,
        type: 'certificate_issued',
        title: 'Certificate ready',
        message: `Your certificate for ${enrollment.course_title} is ready to download.`,
        category: 'course',
        priority: 'high',
        actionUrl: '/student-dashboard',
        metadata: {
          tab: 'certificates',
          course_id: enrollment.course_id,
          enrollment_id: enrollment._id,
          certificate_id: certificate?._id,
        },
        eventKey: `certificate_issued:${enrollment._id}`,
      });

      void safeNotifyAdmins({
        senderId: enrollment.user_id,
        type: 'course_completed',
        title: 'Student completed a course',
        message: `${enrollment.user_name} completed ${enrollment.course_title}.`,
        category: 'course',
        priority: 'normal',
        actionUrl: '/lms-admin',
        metadata: {
          tab: 'certificates',
          course_id: enrollment.course_id,
          enrollment_id: enrollment._id,
          certificate_id: certificate?._id,
        },
        eventKey: `course_completed:${enrollment._id}`,
      });
    } catch (err) {
      logger.error(`[enrollment] Certificate issuance failed for ${enrollment._id}: ${err.message}`);
      certificateError = 'Certificate could not be generated yet. Please try again later.';
    }
  }

  const fresh = await CourseEnrollment.findById(enrollment._id).lean();
  return { enrollment: fresh, topic, certificate, certificate_error: certificateError };
};

export default applyTopicProgress;
