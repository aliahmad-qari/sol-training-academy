/**
 * Barrel export for all Mongoose models.
 * Import from here: `import { User, Course } from '../models/index.js'`
 */
export { default as User } from './User.js';
export { default as Course } from './Course.js';
export { default as CourseModule } from './CourseModule.js';
export { default as CourseTopic } from './CourseTopic.js';
export { default as CourseEnrollment } from './CourseEnrollment.js';
export { default as Quiz } from './Quiz.js';
export { default as QuizAttempt } from './QuizAttempt.js';
export { default as Assignment } from './Assignment.js';
export { default as AssignmentSubmission } from './AssignmentSubmission.js';
export { default as Certificate } from './Certificate.js';
export { default as CoursePayment } from './CoursePayment.js';
export { default as Invoice } from './Invoice.js';
export { default as Coupon } from './Coupon.js';
export { default as SupportTicket } from './SupportTicket.js';

// Student-portal engagement entities (notes, discussion, goals, requests, referrals, feedback).
export { default as StudentNote } from './StudentNote.js';
export { default as DiscussionPost } from './DiscussionPost.js';
export { default as StudentGoal } from './StudentGoal.js';
export { default as StudentRequest } from './StudentRequest.js';
export { default as Referral } from './Referral.js';
export { default as CourseFeedback } from './CourseFeedback.js';
