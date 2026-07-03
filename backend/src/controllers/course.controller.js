import { Course, CourseModule, CourseTopic, CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/courses   (public — published only; staff can see all via ?all=true)
 * Query: page, limit, sort, search, level, is_published
 */
export const listCourses = asyncHandler(async (req, res) => {
  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);

  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['level', 'is_published'],
    searchFields: ['title', 'description'],
    defaultSort: 'sort_order',
  });

  // Non-staff (or staff not explicitly requesting all) only see published.
  if (!isStaff || req.query.all !== 'true') {
    filter.is_published = true;
  }

  const [items, total] = await Promise.all([
    Course.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Course.countDocuments(filter),
  ]);

  return sendOk(res, items, 'Courses', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/courses/:id   (public)
 * Returns the course. Add ?include=curriculum to embed modules+topics.
 */
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  if (!course) throw ApiError.notFound('Course not found.');

  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);
  if (!course.is_published && !isStaff) throw ApiError.notFound('Course not found.');

  if (req.query.include === 'curriculum') {
    const [modules, topics] = await Promise.all([
      CourseModule.find({ course_id: course._id }).sort('sort_order').lean(),
      CourseTopic.find({ course_id: course._id }).sort('sort_order').lean(),
    ]);
    // Hide quiz answers from non-staff.
    const sanitizedTopics = topics.map((t) => {
      if (!isStaff && t.type === 'quiz' && Array.isArray(t.quiz_questions)) {
        return {
          ...t,
          quiz_questions: t.quiz_questions.map(({ correct_index, explanation, ...q }) => q),
        };
      }
      return t;
    });
    course.modules = modules.map((m) => ({
      ...m,
      topics: sanitizedTopics.filter((t) => String(t.module_id) === String(m._id)),
    }));
  }

  return sendOk(res, course, 'Course detail');
});

/**
 * POST /api/v1/courses   (admin/team_member)
 */
export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  return sendCreated(res, course, 'Course created');
});

/**
 * PUT /api/v1/courses/:id   (admin/team_member)
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) throw ApiError.notFound('Course not found.');
  return sendOk(res, course, 'Course updated');
});

/**
 * DELETE /api/v1/courses/:id   (admin)
 * Cascades: removes modules + topics. Blocks if enrollments exist.
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found.');

  const enrollmentCount = await CourseEnrollment.countDocuments({ course_id: course._id });
  if (enrollmentCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: ${enrollmentCount} enrollment(s) exist. Unpublish it instead.`
    );
  }

  await Promise.all([
    CourseModule.deleteMany({ course_id: course._id }),
    CourseTopic.deleteMany({ course_id: course._id }),
  ]);
  await course.deleteOne();

  return sendOk(res, { id: req.params.id }, 'Course and its curriculum deleted');
});

/**
 * PATCH /api/v1/courses/:id/publish   (admin/team_member)
 * Body: { is_published }
 */
export const togglePublish = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { is_published: Boolean(req.body.is_published) },
    { new: true }
  );
  if (!course) throw ApiError.notFound('Course not found.');
  return sendOk(res, course, `Course ${course.is_published ? 'published' : 'unpublished'}`);
});
