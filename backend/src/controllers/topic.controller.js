import mongoose from 'mongoose';
import { CourseTopic, CourseModule, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { deleteAsset } from '../cloudinary/cloudinary.service.js';

/**
 * Best-effort reclamation of a topic's Cloudinary assets. Each destroy is
 * guarded inside deleteAsset (failures are swallowed) so cleanup never blocks
 * the record deletion. The video is uploaded with resource_type 'video';
 * reading/assessment files use 'auto', which Cloudinary most often stores as
 * 'raw' for documents.
 */
const reclaimTopicAssets = async (topic) => {
  if (!topic) return;
  await Promise.all([
    deleteAsset(topic.video_public_id, 'video'),
    deleteAsset(topic.reading_file_public_id, 'raw'),
    deleteAsset(topic.assessment_file_public_id, 'raw'),
  ]);
};

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
    quiz_questions: topic.quiz_questions.map(({ correct_index, correct_indices, model_answer, explanation, ...q }) => q),
  };
};

/**
 * GET /api/v1/topics   (public for published courses)
 *
 * All query params are OPTIONAL â€” legacy filters never trigger a 400.
 *   ?module_id=...        â†’ scope to one module (optional)
 *   ?course_id=...        â†’ scope to one course (optional)
 *   ?type=video|quiz|...  â†’ filter by topic type (optional)
 *   ?limit=500            â†’ high limit to emulate "return all" (capped at 500)
 *   ?sort=sort_order      â†’ sort field(s); defaults to sort_order ascending
 *
 * With no scope the admin UI fetches every topic and groups them client-side,
 * so an empty filter must return the full set rather than reject the request.
 */
export const listTopics = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['module_id', 'course_id', 'type'],
    defaultSort: 'sort_order',
  });

  const [topics, total] = await Promise.all([
    CourseTopic.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    CourseTopic.countDocuments(filter),
  ]);

  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);
  return sendOk(
    res,
    topics.map((t) => sanitizeTopicForStudent(t, isStaff)),
    'Topics',
    paginationMeta(total, page, limit)
  );
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
 *
 * Flexible payload. The parent module is the source of truth for course_id, so
 * we always derive it from the module (ignoring any client-supplied value).
 * Whatever type-specific fields the admin sends â€” video_url, content,
 * reading_file_url, quiz_questions, assessment_* â€” map straight into the
 * document; Mongoose only persists fields defined on the schema, so extraneous
 * keys are dropped safely rather than causing a validation error.
 */
export const createTopic = asyncHandler(async (req, res) => {
  const { module_id, title } = req.body;
  if (!module_id) throw ApiError.badRequest('module_id is required.');
  if (!title || !String(title).trim()) throw ApiError.badRequest('Topic title is required.');

  const mod = await CourseModule.findById(module_id);
  if (!mod) throw ApiError.badRequest('Invalid module_id.');

  // Default sort_order = current topic count in the module (append to end).
  let { sort_order } = req.body;
  if (sort_order === undefined || sort_order === null || sort_order === '') {
    sort_order = await CourseTopic.countDocuments({ module_id });
  }

  const topic = await CourseTopic.create({
    ...req.body,
    module_id,
    // Keep course_id consistent with the module â€” the module owns the mapping.
    course_id: mod.course_id,
    title: String(title).trim(),
    sort_order: Number(sort_order) || 0,
  });

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
  // Reclaim Cloudinary storage for any uploaded assets (non-blocking failures).
  await reclaimTopicAssets(topic);
  return sendOk(res, { id: req.params.id }, 'Topic deleted');
});

/**
 * PATCH /api/v1/topics/reorder   (admin/team_member)
 * Body: { items: [{ id, sort_order, module_id? }, ...] }
 *
 * Persists a new ordering in ONE round-trip via bulkWrite. A topic may also be
 * moved to a different module during a drag â€” if module_id is supplied and
 * valid, it is updated in the same operation and course_id is kept consistent.
 * Returns the affected module's freshly ordered topics so the client can
 * reconcile against the database.
 */
export const reorderTopics = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('items must be a non-empty array of { id, sort_order }.');
  }

  const ops = items.map((it, i) => {
    if (!it || !mongoose.isValidObjectId(it.id)) {
      throw ApiError.badRequest(`items[${i}].id is not a valid topic id.`);
    }
    const order = Number(it.sort_order);
    if (!Number.isFinite(order)) {
      throw ApiError.badRequest(`items[${i}].sort_order must be a number.`);
    }
    const set = { sort_order: order };
    // Allow cross-module moves: only set module_id when a valid one is passed.
    if (it.module_id !== undefined) {
      if (!mongoose.isValidObjectId(it.module_id)) {
        throw ApiError.badRequest(`items[${i}].module_id is not a valid module id.`);
      }
      set.module_id = it.module_id;
    }
    return { updateOne: { filter: { _id: it.id }, update: { $set: set } } };
  });

  const result = await CourseTopic.bulkWrite(ops, { ordered: false });

  // If topics were moved across modules, realign each topic's course_id with
  // its (possibly new) parent module so the tree stays consistent.
  const movedModuleIds = [...new Set(items.filter((it) => it.module_id).map((it) => it.module_id))];
  if (movedModuleIds.length > 0) {
    const mods = await CourseModule.find({ _id: { $in: movedModuleIds } })
      .select('_id course_id')
      .lean();
    await Promise.all(
      mods.map((m) =>
        CourseTopic.updateMany({ module_id: m._id }, { $set: { course_id: m.course_id } })
      )
    );
    // Topic counts per course may have shifted â€” re-sync every touched course.
    const courseIds = [...new Set(mods.map((m) => String(m.course_id)))];
    await Promise.all(courseIds.map((cid) => syncTopicCount(cid)));
  }

  // Return the affected module's topics in their new order for reconciliation.
  const ids = items.map((it) => it.id);
  const sample = await CourseTopic.findById(ids[0]).select('module_id').lean();
  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);
  const topics = sample
    ? await CourseTopic.find({ module_id: sample.module_id }).sort('sort_order').lean()
    : await CourseTopic.find({ _id: { $in: ids } }).sort('sort_order').lean();

  return sendOk(
    res,
    {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      topics: topics.map((t) => sanitizeTopicForStudent(t, isStaff)),
    },
    'Topics reordered'
  );
});

