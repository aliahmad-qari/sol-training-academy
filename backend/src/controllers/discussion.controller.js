import { DiscussionPost, CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

const isStaff = (req) => ['admin', 'team_member'].includes(req.user.role);

/** Course ids the current user is enrolled in (as strings). */
const enrolledCourseIds = async (userId) => {
  const enrs = await CourseEnrollment.find({ user_id: userId }).select('course_id').lean();
  return enrs.map((e) => String(e.course_id));
};

/**
 * GET /api/v1/discussion   (protected)
 * Collaborative board: a student sees every post in any course they are enrolled
 * in — including posts authored by OTHER enrolled students. Staff see all posts.
 * Optional ?course_id= narrows to one course (must be one the student is in).
 */
export const listPosts = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id', 'parent_id'],
    searchFields: ['title', 'content', 'user_name'],
    defaultSort: '-createdAt',
  });

  let visibility = {};
  if (!isStaff(req)) {
    const courseIds = await enrolledCourseIds(req.user._id);
    // Not enrolled anywhere → nothing to show (avoids leaking other courses).
    if (courseIds.length === 0) {
      return sendOk(res, [], 'Discussion posts', paginationMeta(0, page, limit));
    }
    visibility = { course_id: { $in: courseIds } };
  }

  const finalFilter = { ...visibility, ...filter };
  const [items, total] = await Promise.all([
    DiscussionPost.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    DiscussionPost.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Discussion posts', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/discussion/:courseId   (protected)
 * Convenience route: all posts + replies for a single course the student is in.
 * Returns the whole thread set so the client can nest replies locally.
 */
export const listPostsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!isStaff(req)) {
    const courseIds = await enrolledCourseIds(req.user._id);
    if (!courseIds.includes(String(courseId))) {
      throw ApiError.forbidden('You are not enrolled in this course.');
    }
  }

  const items = await DiscussionPost.find({ course_id: courseId })
    .sort('-createdAt')
    .limit(500)
    .lean();
  return sendOk(res, items, 'Course discussion');
});

/**
 * POST /api/v1/discussion   (protected; enrolled student or staff)
 * Body: { course_id, content, title?, parent_id? }
 * The author identity is stamped server-side from req.user (never trusted from body).
 */
export const createPost = asyncHandler(async (req, res) => {
  const { course_id, content, title, parent_id } = req.body;
  if (!course_id) throw ApiError.badRequest('course_id is required.');
  if (!content || !content.trim()) throw ApiError.badRequest('content is required.');

  if (!isStaff(req)) {
    const courseIds = await enrolledCourseIds(req.user._id);
    if (!courseIds.includes(String(course_id))) {
      throw ApiError.forbidden('You can only post in courses you are enrolled in.');
    }
  }

  // Derive course_title from the parent (reply) or the caller's enrollment.
  let course_title = req.body.course_title;
  if (!course_title) {
    const enr = await CourseEnrollment.findOne({ course_id }).select('course_title').lean();
    course_title = enr?.course_title || '';
  }

  const post = await DiscussionPost.create({
    course_id,
    course_title,
    user_id: req.user._id,
    user_name: req.user.full_name || req.user.email,
    user_role: req.user.role,
    parent_id: parent_id || null,
    title,
    content: content.trim(),
    likes: 0,
    liked_by: [],
  });
  return sendCreated(res, post, 'Post created');
});

/**
 * PATCH /api/v1/discussion/:id/like   (protected)
 * Toggles the caller's like on a post. Returns the updated post.
 * Concurrency-safe: uses $addToSet / $pull rather than read-modify-write.
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found.');

  const already = (post.liked_by || []).some((id) => String(id) === String(req.user._id));
  if (already) post.liked_by.pull(req.user._id);
  else post.liked_by.addToSet(req.user._id);
  post.likes = post.liked_by.length;
  await post.save();

  return sendOk(res, post, 'Like toggled');
});

/**
 * DELETE /api/v1/discussion/:id   (protected; author or staff)
 * Deleting a top-level post also removes its replies.
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found.');
  if (!isStaff(req) && String(post.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot delete this post.');
  }
  await DiscussionPost.deleteMany({ $or: [{ _id: post._id }, { parent_id: post._id }] });
  return sendOk(res, { id: req.params.id }, 'Post deleted');
});
