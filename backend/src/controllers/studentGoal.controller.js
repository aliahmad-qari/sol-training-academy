import { StudentGoal } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/goals   (protected; student) — scoped to the authenticated user.
 */
export const listGoals = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id', 'status'],
    defaultSort: '-createdAt',
  });
  const finalFilter = { ...filter, user_id: req.user._id };

  const [items, total] = await Promise.all([
    StudentGoal.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    StudentGoal.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Goals', paginationMeta(total, page, limit));
});

/**
 * POST /api/v1/goals   (protected; student)
 * Body: { course_id, target_date, weekly_hours?, notes?, course_title?, enrollment_id? }
 */
export const createGoal = asyncHandler(async (req, res) => {
  const { course_id, target_date } = req.body;
  if (!course_id || !target_date) throw ApiError.badRequest('course_id and target_date are required.');

  const goal = await StudentGoal.create({
    user_id: req.user._id,
    course_id,
    course_title: req.body.course_title,
    enrollment_id: req.body.enrollment_id,
    target_date,
    weekly_hours: req.body.weekly_hours ?? 5,
    notes: req.body.notes,
  });
  return sendCreated(res, goal, 'Goal created');
});

const loadOwnedGoal = async (req) => {
  const goal = await StudentGoal.findById(req.params.id);
  if (!goal) throw ApiError.notFound('Goal not found.');
  if (String(goal.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot modify this goal.');
  }
  return goal;
};

/**
 * PUT /api/v1/goals/:id   (protected; owner)
 */
export const updateGoal = asyncHandler(async (req, res) => {
  const goal = await loadOwnedGoal(req);
  const allowed = ['target_date', 'weekly_hours', 'notes', 'status'];
  for (const k of allowed) if (req.body[k] !== undefined) goal[k] = req.body[k];
  await goal.save();
  return sendOk(res, goal, 'Goal updated');
});

/**
 * DELETE /api/v1/goals/:id   (protected; owner)
 */
export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await loadOwnedGoal(req);
  await goal.deleteOne();
  return sendOk(res, { id: req.params.id }, 'Goal deleted');
});
