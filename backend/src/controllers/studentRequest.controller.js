import { StudentRequest } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

const isStaff = (req) => ['admin', 'team_member'].includes(req.user.role);

/**
 * GET /api/v1/requests   (protected)
 * Students → own requests; staff → all (with filters).
 */
export const listRequests = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['type', 'status', 'priority', 'student_id'],
    searchFields: ['subject', 'description', 'student_name', 'student_email'],
    defaultSort: '-createdAt',
  });
  const baseFilter = isStaff(req) ? {} : { student_id: req.user._id };
  const finalFilter = { ...baseFilter, ...filter };

  const [items, total] = await Promise.all([
    StudentRequest.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    StudentRequest.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Requests', paginationMeta(total, page, limit));
});

/**
 * POST /api/v1/requests   (protected; student)
 * Body: { type, subject, description, priority?, attachment_url?, attachment_name? }
 */
export const createRequest = asyncHandler(async (req, res) => {
  const { type, subject, description } = req.body;
  if (!subject || !description) throw ApiError.badRequest('subject and description are required.');

  const request = await StudentRequest.create({
    student_id: req.user._id,
    student_name: req.user.full_name || req.user.email,
    student_email: req.user.email,
    type: type || 'other',
    subject,
    description,
    priority: req.body.priority || 'medium',
    attachment_url: req.body.attachment_url,
    attachment_name: req.body.attachment_name,
    status: 'pending',
  });
  return sendCreated(res, request, 'Request created');
});

/**
 * PATCH /api/v1/requests/:id   (staff) — respond / update status.
 * Body: { status?, admin_response? }
 */
export const updateRequest = asyncHandler(async (req, res) => {
  const update = {};
  if (req.body.status !== undefined) update.status = req.body.status;
  if (req.body.admin_response !== undefined) {
    update.admin_response = req.body.admin_response;
    update.admin_name = req.user.full_name || req.user.email;
  }

  const request = await StudentRequest.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!request) throw ApiError.notFound('Request not found.');
  return sendOk(res, request, 'Request updated');
});

/**
 * DELETE /api/v1/requests/:id   (protected; owner or staff)
 */
export const deleteRequest = asyncHandler(async (req, res) => {
  const request = await StudentRequest.findById(req.params.id);
  if (!request) throw ApiError.notFound('Request not found.');
  if (!isStaff(req) && String(request.student_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot delete this request.');
  }
  await request.deleteOne();
  return sendOk(res, { id: req.params.id }, 'Request deleted');
});
