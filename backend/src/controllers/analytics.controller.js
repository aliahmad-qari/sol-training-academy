import { CoursePayment, CourseEnrollment, Course } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/ApiResponse.js';

/**
 * GET /api/v1/analytics/revenue   (staff)
 * Query: months=6 (default) → monthly revenue for the last N months.
 */
export const revenueByMonth = asyncHandler(async (req, res) => {
  const months = Math.min(24, Math.max(1, parseInt(req.query.months, 10) || 6));
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await CoursePayment.aggregate([
    { $match: { payment_status: 'completed', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$amount_paid' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const data = rows.map((r) => ({
    year: r._id.year,
    month: r._id.month,
    label: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
    revenue: Number((r.revenue || 0).toFixed(2)),
    orders: r.orders,
  }));

  return sendOk(res, data, 'Revenue by month');
});

/**
 * GET /api/v1/analytics/enrollments   (staff)
 * Enrollment counts grouped by course, with completion rate.
 */
export const enrollmentsByCourse = asyncHandler(async (req, res) => {
  const rows = await CourseEnrollment.aggregate([
    {
      $group: {
        _id: '$course_id',
        course_title: { $first: '$course_title' },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        avg_progress: { $avg: '$progress_percent' },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const data = rows.map((r) => ({
    course_id: r._id,
    course_title: r.course_title,
    total: r.total,
    active: r.active,
    completed: r.completed,
    completion_rate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
    avg_progress: Math.round(r.avg_progress || 0),
  }));

  return sendOk(res, data, 'Enrollments by course');
});

/**
 * GET /api/v1/analytics/top-courses   (staff)
 * Best-selling courses by completed revenue.
 */
export const topCourses = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 5);
  const rows = await CoursePayment.aggregate([
    { $match: { payment_status: 'completed' } },
    {
      $group: {
        _id: '$course_id',
        course_title: { $first: '$course_title' },
        revenue: { $sum: '$amount_paid' },
        sales: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);

  const data = rows.map((r) => ({
    course_id: r._id,
    course_title: r.course_title,
    revenue: Number((r.revenue || 0).toFixed(2)),
    sales: r.sales,
  }));

  return sendOk(res, data, 'Top courses');
});

/**
 * GET /api/v1/analytics/summary   (staff)
 * Convenience: catalogue counts by level + published state.
 */
export const catalogueSummary = asyncHandler(async (req, res) => {
  const rows = await Course.aggregate([
    {
      $group: {
        _id: '$level',
        total: { $sum: 1 },
        published: { $sum: { $cond: ['$is_published', 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return sendOk(res, rows, 'Catalogue summary');
});
