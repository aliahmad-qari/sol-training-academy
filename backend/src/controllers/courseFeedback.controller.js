import { CourseFeedback } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

const isStaff = (req) => ['admin', 'team_member'].includes(req.user.role);

/**
 * GET /api/v1/feedback   (protected)
 * Students → own feedback; staff → all (e.g. to compute course ratings).
 */
export const listFeedback = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id', 'enrollment_id', 'user_id', 'overall_rating'],
    searchFields: ['comments', 'course_title'],
    defaultSort: '-createdAt',
  });
  const baseFilter = isStaff(req) ? {} : { user_id: req.user._id };
  const finalFilter = { ...baseFilter, ...filter };

  const [items, total] = await Promise.all([
    CourseFeedback.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    CourseFeedback.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Course feedback', paginationMeta(total, page, limit));
});

/**
 * POST /api/v1/feedback   (protected; student)
 * Body: { overall_rating, enrollment_id, course_id, ...ratings, comments? }
 * One review per (user, enrollment) — a duplicate returns 409 via the unique index.
 */
export const createFeedback = asyncHandler(async (req, res) => {
  const { overall_rating, enrollment_id, course_id } = req.body;
  if (!overall_rating) throw ApiError.badRequest('overall_rating is required.');
  if (!enrollment_id || !course_id) throw ApiError.badRequest('enrollment_id and course_id are required.');

  const feedback = await CourseFeedback.create({
    user_id: req.user._id,
    user_name: req.user.full_name || req.user.email,
    enrollment_id,
    course_id,
    course_title: req.body.course_title,
    course_level: req.body.course_level,
    overall_rating,
    content_quality: req.body.content_quality || 0,
    delivery_rating: req.body.delivery_rating || 0,
    relevance_rating: req.body.relevance_rating || 0,
    met_standards: req.body.met_standards ?? null,
    would_recommend: req.body.would_recommend ?? null,
    comments: req.body.comments,
  });
  return sendCreated(res, feedback, 'Feedback submitted');
});

/**
 * DELETE /api/v1/feedback/:id   (protected; owner or staff)
 */
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await CourseFeedback.findById(req.params.id);
  if (!feedback) throw ApiError.notFound('Feedback not found.');
  if (!isStaff(req) && String(feedback.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot delete this feedback.');
  }
  await feedback.deleteOne();
  return sendOk(res, { id: req.params.id }, 'Feedback deleted');
});
