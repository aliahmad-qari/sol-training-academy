import { SupportTicket } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { safeCreateNotification, safeNotifyAdmins } from '../services/notification.service.js';

const staffRoles = ['admin', 'team_member'];
const isStaffUser = (user) => staffRoles.includes(user?.role);

/**
 * GET /api/v1/support-tickets   (protected)
 * Students → own tickets; staff → all.
 */
export const listTickets = asyncHandler(async (req, res) => {
  const isStaff = isStaffUser(req.user);
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

  const isStaff = isStaffUser(req.user);
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

  void safeNotifyAdmins({
    senderId: req.user._id,
    type: 'support_ticket_created',
    title: 'New support ticket',
    message: `${req.user.full_name} opened a support ticket: ${subject}.`,
    category: 'support',
    priority: 'high',
    actionUrl: '/lms-admin',
    metadata: { tab: 'support', ticket_id: ticket._id, student_id: req.user._id, category },
    eventKey: `support_ticket_created:${ticket._id}`,
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

  const isStaff = isStaffUser(req.user);
  if (!isStaff && String(ticket.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot reply to this ticket.');
  }

  ticket.messages.push({
    sender_id: req.user._id,
    sender_name: req.user.full_name,
    sender_role: req.user.role,
    message,
  });

  if (isStaff && ticket.status === 'open') ticket.status = 'in_progress';
  await ticket.save();

  if (isStaff) {
    void safeCreateNotification({
      recipientId: ticket.user_id,
      senderId: req.user._id,
      type: 'support_ticket_reply',
      title: 'Support replied',
      message: `A team member replied to your ticket: ${ticket.subject}.`,
      category: 'support',
      priority: 'high',
      actionUrl: '/student-dashboard',
      metadata: { tab: 'support', ticket_id: ticket._id },
      eventKey: `support_ticket_reply:${ticket._id}:${ticket.messages.length}`,
    });
  } else {
    void safeNotifyAdmins({
      senderId: req.user._id,
      type: 'support_ticket_student_reply',
      title: 'Student replied to support',
      message: `${req.user.full_name} replied to ${ticket.subject}.`,
      category: 'support',
      priority: 'normal',
      actionUrl: '/lms-admin',
      metadata: { tab: 'support', ticket_id: ticket._id, student_id: req.user._id },
      eventKey: `support_ticket_student_reply:${ticket._id}:${ticket.messages.length}`,
    });
  }

  return sendOk(res, ticket, 'Reply added');
});

/**
 * PATCH /api/v1/support-tickets/:id   (staff)
 * Body: { status?, priority?, assigned_to? }
 */
export const updateTicket = asyncHandler(async (req, res) => {
  const allowed = ['status', 'priority', 'assigned_to'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!ticket) throw ApiError.notFound('Ticket not found.');

  void safeCreateNotification({
    recipientId: ticket.user_id,
    senderId: req.user._id,
    type: 'support_ticket_updated',
    title: 'Support ticket updated',
    message: `Your ticket "${ticket.subject}" is now ${ticket.status}.`,
    category: 'support',
    priority: ticket.status === 'resolved' ? 'normal' : 'high',
    actionUrl: '/student-dashboard',
    metadata: { tab: 'support', ticket_id: ticket._id, status: ticket.status },
    eventKey: `support_ticket_updated:${ticket._id}:${ticket.status}`,
  });

  return sendOk(res, ticket, 'Ticket updated');
});
