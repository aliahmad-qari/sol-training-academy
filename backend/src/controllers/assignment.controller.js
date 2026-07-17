import { Assignment, AssignmentSubmission, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/assignments?course_id=...   (protected)
 * Students see published only; staff see all.
 */
export const listAssignments = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id', 'module_id', 'is_published', 'source_topic_id'],
    searchFields: ['title'],
    defaultSort: 'sort_order',
  });
  if (!isStaff) filter.is_published = true;

  const [items, total] = await Promise.all([
    Assignment.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Assignment.countDocuments(filter),
  ]);
  return sendOk(res, items, 'Assignments', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/assignments/:id   (protected)
 */
export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).lean();
  if (!assignment) throw ApiError.notFound('Assignment not found.');
  return sendOk(res, assignment, 'Assignment detail');
});

/**
 * POST /api/v1/assignments   (staff)
 */
export const createAssignment = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course_id).lean();
  if (!course) throw ApiError.badRequest('Invalid course_id.');
  req.body.course_title = req.body.course_title || course.title;
  const assignment = await Assignment.create(req.body);
  return sendCreated(res, assignment, 'Assignment created');
});

/**
 * PUT /api/v1/assignments/:id   (staff)
 */
export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!assignment) throw ApiError.notFound('Assignment not found.');
  return sendOk(res, assignment, 'Assignment updated');
});

/**
 * DELETE /api/v1/assignments/:id   (staff)
 */
export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found.');
  return sendOk(res, { id: req.params.id }, 'Assignment deleted');
});
