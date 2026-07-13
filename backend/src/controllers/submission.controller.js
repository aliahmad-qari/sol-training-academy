import { AssignmentSubmission, Assignment, CourseTopic, CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { uploadBuffer, deleteAsset } from '../cloudinary/cloudinary.service.js';
import { safeCreateNotification, safeNotifyAdmins } from '../services/notification.service.js';
import { applyTopicProgress } from '../services/enrollmentProgress.service.js';

const ensureActiveEnrollment = async ({ userId, courseId }) => {
  const enrollment = await CourseEnrollment.findOne({
    user_id: userId,
    course_id: courseId,
    status: { $ne: 'expired' },
    $or: [{ expiry_date: null }, { expiry_date: { $exists: false } }, { expiry_date: { $gt: new Date() } }],
  }).lean();

  if (!enrollment) {
    throw ApiError.forbidden('You are not enrolled in this course, or your access has expired.');
  }

  return enrollment;
};

const resolveSubmissionTarget = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId).lean();
  if (assignment) {
    return {
      kind: 'assignment',
      assignment_id: assignment._id,
      topic_id: undefined,
      title: assignment.title,
      course_id: assignment.course_id,
      course_title: assignment.course_title,
      max_marks: assignment.max_marks,
      passing_marks: assignment.passing_marks,
      allowed_file_types: assignment.allowed_file_types || [],
    };
  }

  const topic = await CourseTopic.findById(assignmentId).lean();
  if (topic && topic.type === 'assessment') {
    return {
      kind: 'assessment_topic',
      assignment_id: undefined,
      topic_id: topic._id,
      title: topic.title,
      course_id: topic.course_id,
      course_title: undefined,
      max_marks: topic.assessment_max_marks || 100,
      passing_marks: undefined,
      allowed_file_types: [],
    };
  }

  throw ApiError.notFound('Assignment not found.');
};

/**
 * POST /api/v1/submissions   (protected; student)
 * multipart/form-data: file (required), assignment_id, submission_notes?
 * Also accepts CourseTopic assessment IDs for course-player assessments.
 */
export const createSubmission = asyncHandler(async (req, res) => {
  const { assignment_id, submission_notes } = req.body;
  if (!assignment_id) throw ApiError.badRequest('assignment_id is required.');

  const preUploadedUrl = req.body.file_url;
  if (!req.file && !preUploadedUrl) {
    throw ApiError.badRequest('A file is required: send multipart "file" or a JSON "file_url".');
  }

  const target = await resolveSubmissionTarget(assignment_id);
  await ensureActiveEnrollment({ userId: req.user._id, courseId: target.course_id });

  const originalName = req.file ? req.file.originalname : req.body.file_name || 'submission';
  const ext = (originalName.split('.').pop() || '').toLowerCase();
  if (target.allowed_file_types.length && !target.allowed_file_types.includes(ext)) {
    throw ApiError.badRequest(
      `File type ".${ext}" not allowed. Allowed: ${target.allowed_file_types.join(', ')}`
    );
  }

  let fileUrl = preUploadedUrl;
  let filePublicId = req.body.file_public_id;
  if (req.file) {
    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: 'assignment-submissions',
      resourceType: 'auto',
      filename: req.file.originalname,
    });
    fileUrl = uploaded.url;
    filePublicId = uploaded.publicId;
  }

  const submission = await AssignmentSubmission.create({
    assignment_id: target.assignment_id,
    topic_id: target.topic_id,
    assignment_title: target.title,
    course_id: target.course_id,
    course_title: target.course_title || req.body.course_title || '',
    user_id: req.user._id,
    user_name: req.user.full_name,
    user_email: req.user.email,
    file_url: fileUrl,
    file_name: originalName,
    file_type: ext,
    file_public_id: filePublicId,
    submission_notes,
    status: 'submitted',
    max_marks: target.max_marks,
    passing_marks: target.passing_marks,
  });

  if (target.topic_id) {
    await applyTopicProgress({
      userId: req.user._id,
      courseId: target.course_id,
      actor: req.user,
      topicId: target.topic_id,
      completed: true,
    });
  }

  void safeNotifyAdmins({
    senderId: req.user._id,
    type: 'assignment_submitted',
    title: 'Assignment submitted',
    message: `${req.user.full_name} submitted ${target.title}.`,
    category: 'assessment',
    priority: 'high',
    actionUrl: '/lms-admin',
    metadata: {
      tab: 'gradebook',
      assignment_id: target.assignment_id,
      topic_id: target.topic_id,
      submission_id: submission._id,
      course_id: target.course_id,
      student_id: req.user._id,
      kind: target.kind,
    },
    eventKey: `assignment_submitted:${submission._id}`,
  });

  return sendCreated(res, submission, 'Assignment submitted');
});

/**
 * GET /api/v1/submissions   (protected)
 * Students -> own; staff -> all (filters/pagination).
 */
export const listSubmissions = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const baseFilter = isStaff ? {} : { user_id: req.user._id };

  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['assignment_id', 'topic_id', 'course_id', 'status', 'user_id', 'passed'],
    searchFields: ['user_name', 'user_email', 'assignment_title', 'course_title'],
    defaultSort: '-createdAt',
  });

  const finalFilter = { ...baseFilter, ...filter };
  const [items, total] = await Promise.all([
    AssignmentSubmission.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    AssignmentSubmission.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Submissions', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/submissions/:id   (protected; owner or staff)
 */
export const getSubmission = asyncHandler(async (req, res) => {
  const submission = await AssignmentSubmission.findById(req.params.id).lean();
  if (!submission) throw ApiError.notFound('Submission not found.');
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(submission.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot access this submission.');
  }
  return sendOk(res, submission, 'Submission detail');
});

/**
 * PATCH /api/v1/submissions/:id/grade   (staff)
 * Body: { marks_awarded, feedback?, status? }
 */
export const gradeSubmission = asyncHandler(async (req, res) => {
  const { marks_awarded, feedback, status } = req.body;
  if (marks_awarded === undefined) throw ApiError.badRequest('marks_awarded is required.');

  const submission = await AssignmentSubmission.findById(req.params.id);
  if (!submission) throw ApiError.notFound('Submission not found.');

  submission.marks_awarded = Number(marks_awarded);
  if (feedback !== undefined) submission.feedback = feedback;
  submission.passed =
    submission.passing_marks !== undefined
      ? submission.marks_awarded >= submission.passing_marks
      : undefined;
  submission.status = status || 'graded';
  submission.graded_by = req.user._id;
  submission.graded_date = new Date();
  await submission.save();

  if (submission.passed && submission.topic_id) {
    await applyTopicProgress({
      userId: submission.user_id,
      courseId: submission.course_id,
      actor: req.user,
      topicId: submission.topic_id,
      completed: true,
    });
  }

  void safeCreateNotification({
    recipientId: submission.user_id,
    senderId: req.user._id,
    type: 'assignment_graded',
    title: 'Assignment graded',
    message: `Your submission for ${submission.assignment_title} has been graded.`,
    category: 'assessment',
    priority: 'high',
    actionUrl: '/student-dashboard',
    metadata: {
      tab: 'assessments',
      assignment_id: submission.assignment_id,
      topic_id: submission.topic_id,
      submission_id: submission._id,
      course_id: submission.course_id,
    },
    eventKey: `assignment_graded:${submission._id}`,
  });

  return sendOk(res, submission, 'Submission graded');
});

/**
 * POST /api/v1/submissions/:id/reply   (protected; owner or staff)
 * Body: { message }
 * Allows student and teacher to exchange messages on a submission.
 */
export const replyToSubmission = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) throw ApiError.badRequest('message is required.');

  const submission = await AssignmentSubmission.findById(req.params.id);
  if (!submission) throw ApiError.notFound('Submission not found.');

  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const isOwner = String(submission.user_id) === String(req.user._id);
  if (!isStaff && !isOwner) {
    throw ApiError.forbidden('You cannot reply to this submission.');
  }

  submission.messages = submission.messages || [];
  submission.messages.push({
    sender_id: req.user._id,
    sender_name: req.user.full_name,
    sender_role: req.user.role,
    message: message.trim(),
    sent_at: new Date(),
  });
  await submission.save();

  // Notify the other party
  if (isStaff) {
    void safeCreateNotification({
      recipientId: submission.user_id,
      senderId: req.user._id,
      type: 'assignment_message',
      title: 'New message on your submission',
      message: `${req.user.full_name} sent a message about: ${submission.assignment_title}.`,
      category: 'assessment',
      priority: 'high',
      actionUrl: '/student-dashboard',
      metadata: {
        tab: 'assessments',
        submission_id: submission._id,
        assignment_id: submission.assignment_id,
        course_id: submission.course_id,
      },
      eventKey: `submission_reply:${submission._id}:${submission.messages.length}`,
    });
  } else {
    void safeNotifyAdmins({
      senderId: req.user._id,
      type: 'assignment_student_message',
      title: 'Student replied on submission',
      message: `${req.user.full_name} sent a message on: ${submission.assignment_title}.`,
      category: 'assessment',
      priority: 'normal',
      actionUrl: '/lms-admin',
      metadata: {
        tab: 'submissions',
        submission_id: submission._id,
        assignment_id: submission.assignment_id,
        student_id: req.user._id,
      },
      eventKey: `submission_student_reply:${submission._id}:${submission.messages.length}`,
    });
  }

  return sendOk(res, submission, 'Reply added');
});

/**
 * DELETE /api/v1/submissions/:id   (owner before grading, or staff)
 * Removes the Cloudinary asset too.
 */
export const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await AssignmentSubmission.findById(req.params.id);
  if (!submission) throw ApiError.notFound('Submission not found.');

  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const isOwner = String(submission.user_id) === String(req.user._id);
  if (!isStaff && !isOwner) throw ApiError.forbidden('You cannot delete this submission.');
  if (isOwner && !isStaff && submission.status === 'graded') {
    throw ApiError.badRequest('Graded submissions cannot be deleted.');
  }

  if (submission.file_public_id) {
    await deleteAsset(submission.file_public_id, 'raw');
  }
  await submission.deleteOne();
  return sendOk(res, { id: req.params.id }, 'Submission deleted');
});
