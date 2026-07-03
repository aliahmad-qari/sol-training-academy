import { SupportTicket } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/support-tickets   (protected)
 * Students → own tickets; staff → all.
 */
export const listTickets = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const baseFilter = isStaff ? {} : { user_id: req.user._id };

  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['status', 'category', 'priority', 'user_id', 'assigned_to'],
    searchFields: ['subject', 'user_name', 'user_email'],
    defaultSort: '-createdAt',
  });

  const finalFilter = { ...baseFilter, ...filter };
  const [items, total] = await Promise.all([
    SupportTicket.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    SupportTicket.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Support tickets', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/support-tickets/:id   (protected; owner or staff)
 */
export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id).lean();
  if (!ticket) throw ApiError.notFound('Ticket not found.');
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(ticket.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot access this ticket.');
  }
  return sendOk(res, ticket, 'Ticket detail');
});

/**
 * POST /api/v1/support-tickets   (protected; student)
 * Body: { category, subject, message }
 */
export const createTicket = asyncHandler(async (req, res) => {
  const { category, subject, message } = req.body;
  if (!subject || !message) throw ApiError.badRequest('subject and message are required.');

  const ticket = await SupportTicket.create({
    user_id: req.user._id,
    user_name: req.user.full_name,
    user_email: req.user.email,
    category,
    subject,
    message,
    status: 'open',
    messages: [
      {
        sender_id: req.user._id,
        sender_name: req.user.full_name,
        sender_role: req.user.role,
        message,
      },
    ],
  });
  return sendCreated(res, ticket, 'Ticket created');
});

/**
 * POST /api/v1/support-tickets/:id/reply   (protected; owner or staff)
 * Body: { message }
 */
export const replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw ApiError.badRequest('message is required.');

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('Ticket not found.');

  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(ticket.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot reply to this ticket.');
  }

  ticket.messages.push({
    sender_id: req.user._id,
    sender_name: req.user.full_name,
    sender_role: req.user.role,
    message,
  });
  // A staff reply moves an open ticket to in_progress.
  if (isStaff && ticket.status === 'open') ticket.status = 'in_progress';
  await ticket.save();

  return sendOk(res, ticket, 'Reply added');
});

/**
 * PATCH /api/v1/support-tickets/:id   (staff)
 * Body: { status?, priority?, assigned_to? }
 */
export const updateTicket = asyncHandler(async (req, res) => {
  const allowed = ['status', 'priority', 'assigned_to'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!ticket) throw ApiError.notFound('Ticket not found.');
  return sendOk(res, ticket, 'Ticket updated');
});
