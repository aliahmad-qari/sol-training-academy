import { CourseModule, CourseTopic, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * GET /api/v1/modules?course_id=...   (public for published courses)
 * Lists modules for a course, ordered by sort_order.
 */
export const listModules = asyncHandler(async (req, res) => {
  const { course_id } = req.query;
  if (!course_id) throw ApiError.badRequest('course_id query param is required.');
  const modules = await CourseModule.find({ course_id }).sort('sort_order').lean();
  return sendOk(res, modules, 'Modules');
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
 */
export const createModule = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course_id);
  if (!course) throw ApiError.badRequest('Invalid course_id.');
  const mod = await CourseModule.create(req.body);
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

  await CourseTopic.deleteMany({ module_id: mod._id });
  await mod.deleteOne();

  const total = await CourseTopic.countDocuments({ course_id: mod.course_id });
  await Course.findByIdAndUpdate(mod.course_id, { total_topics: total });

  return sendOk(res, { id: req.params.id }, 'Module and its topics deleted');
});

/**
 * PATCH /api/v1/modules/reorder   (admin/team_member)
 * Body: { items: [{ id, sort_order }] }
 */
export const reorderModules = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) throw ApiError.badRequest('items array is required.');
  await Promise.all(
    items.map((it) => CourseModule.findByIdAndUpdate(it.id, { sort_order: it.sort_order }))
  );
  return sendOk(res, null, 'Modules reordered');
});
