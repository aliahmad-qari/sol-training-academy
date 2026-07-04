import { AssignmentSubmission, Assignment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { uploadBuffer, deleteAsset } from '../cloudinary/cloudinary.service.js';

/**
 * POST /api/v1/submissions   (protected; student)
 * multipart/form-data: file (required), assignment_id, submission_notes?
 * Uploads the file to Cloudinary and records the submission.
 * 201 → submission
 */
export const createSubmission = asyncHandler(async (req, res) => {
  const { assignment_id, submission_notes } = req.body;
  if (!assignment_id) throw ApiError.badRequest('assignment_id is required.');

  // Two supported flows:
  //  (a) multipart — a file arrives on req.file and we stream it to Cloudinary here.
  //  (b) two-step  — the client already uploaded via /uploads/me/assignment and
  //      passes the resulting file_url/file_name in the JSON body.
  const preUploadedUrl = req.body.file_url;
  if (!req.file && !preUploadedUrl) {
    throw ApiError.badRequest('A file is required: send multipart "file" or a JSON "file_url".');
  }

  const assignment = await Assignment.findById(assignment_id).lean();
  if (!assignment) throw ApiError.notFound('Assignment not found.');

  const originalName = req.file ? req.file.originalname : req.body.file_name || 'submission';
  const ext = (originalName.split('.').pop() || '').toLowerCase();
  if (assignment.allowed_file_types?.length && !assignment.allowed_file_types.includes(ext)) {
    throw ApiError.badRequest(
      `File type ".${ext}" not allowed. Allowed: ${assignment.allowed_file_types.join(', ')}`
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
    assignment_id,
    assignment_title: assignment.title,
    course_id: assignment.course_id,
    course_title: assignment.course_title,
    user_id: req.user._id,
    user_name: req.user.full_name,
    user_email: req.user.email,
    file_url: fileUrl,
    file_name: originalName,
    file_type: ext,
    file_public_id: filePublicId,
    submission_notes,
    status: 'submitted',
    max_marks: assignment.max_marks,
    passing_marks: assignment.passing_marks,
  });

  return sendCreated(res, submission, 'Assignment submitted');
});

/**
 * GET /api/v1/submissions   (protected)
 * Students → own; staff → all (filters/pagination).
 */
export const listSubmissions = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const baseFilter = isStaff ? {} : { user_id: req.user._id };

  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['assignment_id', 'course_id', 'status', 'user_id', 'passed'],
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
 * Computes pass/fail against the submission's passing_marks.
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

  return sendOk(res, submission, 'Submission graded');
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
