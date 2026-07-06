import mongoose from 'mongoose';
import { CourseModule, CourseTopic, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { deleteAsset } from '../cloudinary/cloudinary.service.js';

/**
 * Best-effort Cloudinary reclamation for every uploaded asset across a set of
 * topics. Guarded per-asset inside deleteAsset, so a failure never blocks the
 * cascade delete.
 */
const reclaimAssetsForTopics = async (topics = []) => {
  const jobs = [];
  for (const t of topics) {
    if (t.video_public_id) jobs.push(deleteAsset(t.video_public_id, 'video'));
    if (t.reading_file_public_id) jobs.push(deleteAsset(t.reading_file_public_id, 'raw'));
    if (t.assessment_file_public_id) jobs.push(deleteAsset(t.assessment_file_public_id, 'raw'));
  }
  if (jobs.length) await Promise.all(jobs);
};

/**
 * GET /api/v1/modules   (public for published courses)
 *
 * All query params are OPTIONAL — the endpoint never 400s on legacy filters.
 *   ?course_id=...        → scope to one course (optional)
 *   ?limit=500            → high limit to emulate "return all" (capped at 500)
 *   ?sort=sort_order      → sort field(s); defaults to sort_order ascending
 *
 * With no course_id the admin UI fetches every module and groups them
 * client-side, so we must return the full set rather than reject the request.
 */
export const listModules = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id'],
    defaultSort: 'sort_order',
  });

  const [modules, total] = await Promise.all([
    CourseModule.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    CourseModule.countDocuments(filter),
  ]);

  return sendOk(res, modules, 'Modules', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/modules/:id
 */
export const getModule = asyncHandler(async (req, res) => {
  const mod = await CourseModule.findById(req.params.id).lean();
  if (!mod) throw ApiError.notFound('Module not found.');
  return sendOk(res, mod, 'Module detail');
});

/**
 * POST /api/v1/modules   (admin/team_member)
 * Body: { course_id, title, description?, sort_order? }
 *
 * Flexible payload: only course_id + title are enforced. If sort_order is
 * omitted we append the module to the end of the course so ordering stays
 * database-driven without the client having to compute it.
 */
export const createModule = asyncHandler(async (req, res) => {
  const { course_id, title } = req.body;
  if (!course_id) throw ApiError.badRequest('course_id is required.');
  if (!title || !String(title).trim()) throw ApiError.badRequest('Module title is required.');

  const course = await Course.findById(course_id);
  if (!course) throw ApiError.badRequest('Invalid course_id.');

  // Default sort_order = current module count (append to end) when not supplied.
  let { sort_order } = req.body;
  if (sort_order === undefined || sort_order === null || sort_order === '') {
    sort_order = await CourseModule.countDocuments({ course_id });
  }

  const mod = await CourseModule.create({
    ...req.body,
    course_id,
    title: String(title).trim(),
    sort_order: Number(sort_order) || 0,
  });

  return sendCreated(res, mod, 'Module created');
});

/**
 * PUT /api/v1/modules/:id   (admin/team_member)
 */
export const updateModule = asyncHandler(async (req, res) => {
  const mod = await CourseModule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!mod) throw ApiError.notFound('Module not found.');
  return sendOk(res, mod, 'Module updated');
});

/**
 * DELETE /api/v1/modules/:id   (admin/team_member)
 * Cascades: deletes the module's topics and recomputes the course topic count.
 */
export const deleteModule = asyncHandler(async (req, res) => {
  const mod = await CourseModule.findById(req.params.id);
  if (!mod) throw ApiError.notFound('Module not found.');

  // Fetch topics first so their Cloudinary assets can be reclaimed after the
  // DB rows are gone (deleteMany bypasses the topic controller's cleanup).
  const modTopics = await CourseTopic.find({ module_id: mod._id })
    .select('video_public_id reading_file_public_id assessment_file_public_id')
    .lean();
  await CourseTopic.deleteMany({ module_id: mod._id });
  await mod.deleteOne();
  await reclaimAssetsForTopics(modTopics);

  const total = await CourseTopic.countDocuments({ course_id: mod.course_id });
  await Course.findByIdAndUpdate(mod.course_id, { total_topics: total });

  return sendOk(res, { id: req.params.id }, 'Module and its topics deleted');
});

/**
 * PATCH /api/v1/modules/reorder   (admin/team_member)
 * Body: { items: [{ id, sort_order }, ...] }
 *
 * Persists a new ordering in ONE round-trip via bulkWrite instead of N
 * findByIdAndUpdate calls. Validates every id up-front so a single bad entry
 * fails fast with a 400 rather than silently skipping. Returns the freshly
 * ordered modules (scoped to the affected course when it can be inferred) so
 * the client can reconcile against the database — the single source of truth.
 */
export const reorderModules = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('items must be a non-empty array of { id, sort_order }.');
  }

  const ops = items.map((it, i) => {
    if (!it || !mongoose.isValidObjectId(it.id)) {
      throw ApiError.badRequest(`items[${i}].id is not a valid module id.`);
    }
    const order = Number(it.sort_order);
    if (!Number.isFinite(order)) {
      throw ApiError.badRequest(`items[${i}].sort_order must be a number.`);
    }
    return {
      updateOne: {
        filter: { _id: it.id },
        update: { $set: { sort_order: order } },
      },
    };
  });

  const result = await CourseModule.bulkWrite(ops, { ordered: false });

  // Re-sync: return the affected course's modules in their new order so the
  // frontend state can converge on exactly what the DB holds.
  const ids = items.map((it) => it.id);
  const sample = await CourseModule.findById(ids[0]).select('course_id').lean();
  const modules = sample
    ? await CourseModule.find({ course_id: sample.course_id }).sort('sort_order').lean()
    : await CourseModule.find({ _id: { $in: ids } }).sort('sort_order').lean();

  return sendOk(
    res,
    { matched: result.matchedCount, modified: result.modifiedCount, modules },
    'Modules reordered'
  );
});
