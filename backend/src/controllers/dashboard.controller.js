import {
  User,
  Course,
  CourseEnrollment,
  CoursePayment,
  AssignmentSubmission,
  SupportTicket,
  Certificate,
  QuizAttempt,
} from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk } from '../utils/ApiResponse.js';

/**
 * GET /api/v1/admin/overview   (staff)
 * High-level KPIs for the LMS Admin dashboard.
 */
export const adminOverview = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    activeEnrollments,
    completedEnrollments,
    certificatesIssued,
    openTickets,
    pendingSubmissions,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Course.countDocuments({ is_published: true }),
    CourseEnrollment.countDocuments(),
    CourseEnrollment.countDocuments({ status: 'active' }),
    CourseEnrollment.countDocuments({ status: 'completed' }),
    Certificate.countDocuments({ status: 'issued' }),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    AssignmentSubmission.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
    CoursePayment.aggregate([
      { $match: { payment_status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount_paid' }, count: { $sum: 1 } } },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total || 0;
  const paidOrders = revenueAgg[0]?.count || 0;

  return sendOk(
    res,
    {
      students: totalStudents,
      courses: { total: totalCourses, published: publishedCourses },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
      },
      certificates_issued: certificatesIssued,
      open_tickets: openTickets,
      pending_submissions: pendingSubmissions,
      revenue: { total: Number(revenue.toFixed(2)), currency: 'AUD', paid_orders: paidOrders },
    },
    'Admin overview'
  );
});

/**
 * GET /api/v1/admin/recent   (staff)
 * Recent activity feed for the dashboard.
 */
export const adminRecent = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 8);
  const [enrollments, payments, submissions, tickets] = await Promise.all([
    CourseEnrollment.find().sort('-createdAt').limit(limit).select('user_name course_title status createdAt').lean(),
    CoursePayment.find({ payment_status: 'completed' }).sort('-createdAt').limit(limit).select('user_name course_title amount_paid createdAt').lean(),
    AssignmentSubmission.find().sort('-createdAt').limit(limit).select('user_name assignment_title status createdAt').lean(),
    SupportTicket.find().sort('-createdAt').limit(limit).select('user_name subject status createdAt').lean(),
  ]);
  return sendOk(res, { enrollments, payments, submissions, tickets }, 'Recent activity');
});

/**
 * GET /api/v1/student/overview   (protected; student)
 * Personalized stats for the Student Dashboard.
 */
export const studentOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [enrollments, certificates, quizAttempts, submissions] = await Promise.all([
    CourseEnrollment.find({ user_id: userId }).lean(),
    Certificate.countDocuments({ user_id: userId, status: 'issued' }),
    QuizAttempt.countDocuments({ user_id: userId }),
    AssignmentSubmission.countDocuments({ user_id: userId }),
  ]);

  const active = enrollments.filter((e) => e.status === 'active').length;
  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percent || 0), 0) / enrollments.length)
      : 0;

  return sendOk(
    res,
    {
      enrollments: {
        total: enrollments.length,
        active,
        completed,
        average_progress: avgProgress,
      },
      certificates,
      quiz_attempts: quizAttempts,
      submissions,
      courses: enrollments.map((e) => ({
        enrollment_id: e._id,
        course_id: e.course_id,
        course_title: e.course_title,
        status: e.status,
        progress_percent: e.progress_percent,
        certificate_issued: e.certificate_issued,
      })),
    },
    'Student overview'
  );
});
