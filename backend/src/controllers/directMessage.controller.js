import DirectMessage from '../models/DirectMessage.js';
import { CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/** Returns the set of course_ids the user is enrolled in (as strings). */
const enrolledCourseIds = async (userId) => {
  const enrs = await CourseEnrollment.find({ user_id: userId, status: { $in: ['active', 'completed'] } })
    .select('course_id')
    .lean();
  return new Set(enrs.map((e) => String(e.course_id)));
};

/**
 * Assert that both parties are enrolled in the same course.
 * Staff bypass this check.
 */
const assertSharedEnrollment = async (req, otherUserId, courseId) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (isStaff) return;

  const [myCourses, theirEnr] = await Promise.all([
    enrolledCourseIds(req.user._id),
    CourseEnrollment.findOne({
      user_id: otherUserId,
      course_id: courseId,
      status: { $in: ['active', 'completed'] },
    }).lean(),
  ]);

  if (!myCourses.has(String(courseId))) {
    throw ApiError.forbidden('You are not enrolled in this course.');
  }
  if (!theirEnr) {
    throw ApiError.forbidden('The other student is not enrolled in this course.');
  }
};

/**
 * GET /api/v1/direct-messages
 * ?course_id=  (required)
 * ?other_user_id= (required)
 * Returns the full thread between the caller and `other_user_id` for `course_id`.
 * Also marks all unread messages sent TO the caller as read.
 */
export const getThread = asyncHandler(async (req, res) => {
  const { course_id, other_user_id } = req.query;
  if (!course_id)      throw ApiError.badRequest('course_id is required.');
  if (!other_user_id)  throw ApiError.badRequest('other_user_id is required.');

  await assertSharedEnrollment(req, other_user_id, course_id);

  const meId    = req.user._id;
  const otherId = other_user_id;

  // Fetch all messages in either direction between the two users for this course.
  const messages = await DirectMessage.find({
    course_id,
    $or: [
      { sender_id: meId,    receiver_id: otherId },
      { sender_id: otherId, receiver_id: meId    },
    ],
  })
    .sort('createdAt')
    .limit(200)
    .lean();

  // Mark unread messages addressed TO the caller as read (bulk, non-blocking).
  DirectMessage.updateMany(
    { course_id, sender_id: otherId, receiver_id: meId, read_at: null },
    { $set: { read_at: new Date() } }
  ).catch(() => {});

  return sendOk(res, messages, 'Thread');
});

/**
 * POST /api/v1/direct-messages
 * Body: { receiver_id, course_id, content }
 * Sends a message from the caller to receiver_id.
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiver_id, course_id, content } = req.body;
  if (!receiver_id)       throw ApiError.badRequest('receiver_id is required.');
  if (!course_id)         throw ApiError.badRequest('course_id is required.');
  if (!content?.trim())   throw ApiError.badRequest('content is required.');
  if (String(receiver_id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot message yourself.');
  }

  await assertSharedEnrollment(req, receiver_id, course_id);

  // Resolve course_title and receiver name for denormalized display.
  const [senderEnr, receiverEnr] = await Promise.all([
    CourseEnrollment.findOne({ user_id: req.user._id, course_id }).select('course_title').lean(),
    CourseEnrollment.findOne({ user_id: receiver_id,  course_id }).select('course_title user_name').lean(),
  ]);

  const msg = await DirectMessage.create({
    sender_id:     req.user._id,
    receiver_id,
    sender_name:   req.user.full_name || req.user.email,
    receiver_name: receiverEnr?.user_name || '',
    course_id,
    course_title:  senderEnr?.course_title || receiverEnr?.course_title || '',
    content:       content.trim(),
  });

  return sendCreated(res, msg, 'Message sent');
});

/**
 * GET /api/v1/direct-messages/admin   (staff only)
 * Returns all DM records for admin oversight — metadata only, used for
 * engagement stats in AdminDiscussionModeration. Limited to 1000 most recent.
 */
export const adminListAll = asyncHandler(async (req, res) => {
  const { course_id, limit = 1000 } = req.query;
  const filter = course_id ? { course_id } : {};
  const messages = await DirectMessage.find(filter)
    .select('sender_id receiver_id course_id sender_name receiver_name createdAt read_at')
    .sort('-createdAt')
    .limit(Number(limit))
    .lean();
  return sendOk(res, messages, 'All DMs');
});

/**
 * GET /api/v1/direct-messages/unread-counts
 * ?course_id= (optional — returns counts per course if omitted)
 * Returns { total, byCourse: { [courseId]: count } }
 * so the sidebar badge can show how many unread DMs the caller has.
 */
export const unreadCounts = asyncHandler(async (req, res) => {
  const { course_id } = req.query;
  const filter = { receiver_id: req.user._id, read_at: null };
  if (course_id) filter.course_id = course_id;

  const agg = await DirectMessage.aggregate([
    { $match: filter },
    { $group: { _id: '$course_id', count: { $sum: 1 } } },
  ]);

  const byCourse = {};
  let total = 0;
  for (const row of agg) {
    byCourse[String(row._id)] = row.count;
    total += row.count;
  }

  return sendOk(res, { total, byCourse }, 'Unread counts');
});
