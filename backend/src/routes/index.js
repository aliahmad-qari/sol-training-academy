import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import moduleRoutes from './module.routes.js';
import topicRoutes from './topic.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import quizRoutes from './quiz.routes.js';
import assignmentRoutes from './assignment.routes.js';
import submissionRoutes from './submission.routes.js';
import certificateRoutes from './certificate.routes.js';
import paymentRoutes from './payment.routes.js';
import couponRoutes from './coupon.routes.js';
import supportRoutes from './support.routes.js';
import uploadRoutes from './upload.routes.js';
import adminRoutes from './admin.routes.js';
import studentRoutes from './student.routes.js';
import analyticsRoutes from './analytics.routes.js';
import aiRoutes from './ai.routes.js';
import studentNoteRoutes from './studentNote.routes.js';
import studentGoalRoutes from './studentGoal.routes.js';
import discussionRoutes from './discussion.routes.js';
import studentRequestRoutes from './studentRequest.routes.js';
import referralRoutes from './referral.routes.js';
import courseFeedbackRoutes from './courseFeedback.routes.js';
import announcementRoutes from './announcement.routes.js';
import studentDocumentRoutes from './studentDocument.routes.js';
import notificationRoutes from './notification.routes.js';

/**
 * Central API v1 router. Every feature module is registered here.
 */
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/topics', topicRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/certificates', certificateRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/support-tickets', supportRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);

// Student-portal engagement features.
router.use('/notes', studentNoteRoutes);
router.use('/goals', studentGoalRoutes);
router.use('/discussion', discussionRoutes);
router.use('/requests', studentRequestRoutes);
router.use('/referrals', referralRoutes);
router.use('/feedback', courseFeedbackRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/student-documents', studentDocumentRoutes);

export default router;

