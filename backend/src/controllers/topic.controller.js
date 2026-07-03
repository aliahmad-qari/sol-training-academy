import { CourseTopic, CourseModule, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Recompute and persist a course's total_topics count.
 */
const syncTopicCount = async (courseId) => {
  const total = await CourseTopic.countDocuments({ course_id: courseId });
  await Course.findByIdAndUpdate(courseId, { total_topics: total });
  return total;
};

/**
 * Strip quiz answer keys for non-staff viewers.
 */
const sanitizeTopicForStudent = (topic, isStaff) => {
  if (isStaff || topic.type !== 'quiz' || !Array.isArray(topic.quiz_questions)) return topic;
  return {
    ...topic,
    quiz_questions: topic.quiz_questions.map(({ correct_index, explanation, ...q }) => q),
  };
};

/**
 * GET /api/v1/topics?module_id=... | ?course_id=...
 */
export const listTopics = asyncHandler(async (req, res) => {
  const { module_id, course_id } = req.query;
  if (!module_id && !course_id) {
    throw ApiError.badRequest('module_id or course_id query param is required.');
  }
  const query = module_id ? { module_id } : { course_id };
  const topics = await CourseTopic.find(query).sort('sort_order').lean();

  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);
  return sendOk(res, topics.map((t) => sanitizeTopicForStudent(t, isStaff)), 'Topics');
});

/**
 * GET /api/v1/topics/:id
 */
export const getTopic = asyncHandler(async (req, res) => {
  const topic = await CourseTopic.findById(req.params.id).lean();
  if (!topic) throw ApiError.notFound('Topic not found.');
  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);
  return sendOk(res, sanitizeTopicForStudent(topic, isStaff), 'Topic detail');
});

/**
 * POST /api/v1/topics   (admin/team_member)
 */
export const createTopic = asyncHandler(async (req, res) => {
  const mod = await CourseModule.findById(req.body.module_id);
  if (!mod) throw ApiError.badRequest('Invalid module_id.');
  // Keep course_id consistent with the module.
  req.body.course_id = mod.course_id;

  const topic = await CourseTopic.create(req.body);
  await syncTopicCount(mod.course_id);
  return sendCreated(res, topic, 'Topic created');
});

/**
 * PUT /api/v1/topics/:id   (admin/team_member)
 */
export const updateTopic = asyncHandler(async (req, res) => {
  const topic = await CourseTopic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!topic) throw ApiError.notFound('Topic not found.');
  return sendOk(res, topic, 'Topic updated');
});

/**
 * DELETE /api/v1/topics/:id   (admin/team_member)
 */
export const deleteTopic = asyncHandler(async (req, res) => {
  const topic = await CourseTopic.findById(req.params.id);
  if (!topic) throw ApiError.notFound('Topic not found.');
  const courseId = topic.course_id;
  await topic.deleteOne();
  await syncTopicCount(courseId);
  return sendOk(res, { id: req.params.id }, 'Topic deleted');
});

/**
 * PATCH /api/v1/topics/reorder   (admin/team_member)
 * Body: { items: [{ id, sort_order }] }
 */
export const reorderTopics = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) throw ApiError.badRequest('items array is required.');
  await Promise.all(
    items.map((it) => CourseTopic.findByIdAndUpdate(it.id, { sort_order: it.sort_order }))
  );
  return sendOk(res, null, 'Topics reordered');
});
