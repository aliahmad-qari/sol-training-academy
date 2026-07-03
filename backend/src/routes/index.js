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

export default router;
