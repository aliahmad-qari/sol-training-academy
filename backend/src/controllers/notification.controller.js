import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { createNotificationRecord } from '../services/notification.service.js';

export const createNotification = asyncHandler(async (req, res) => {
  const {
    recipient_id,
    type,
    title,
    message,
    priority,
    category,
    action_url,
    metadata,
    event_key,
  } = req.body;

  if (!recipient_id || !type || !title || !message) {
    throw ApiError.badRequest('recipient_id, type, title and message are required.');
  }

  const notification = await createNotificationRecord({
    recipientId: recipient_id,
    senderId: req.user._id,
    type,
    title,
    message,
    priority,
    category,
    actionUrl: action_url,
    metadata,
    eventKey: event_key,
  });

  return sendCreated(res, notification, 'Notification created');
});

export const getUserNotifications = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['isRead', 'type', 'category', 'priority'],
    searchFields: ['title', 'message'],
    defaultSort: '-createdAt',
  });

  const finalFilter = {
    recipient_id: req.user._id,
    ...filter,
  };

  if (req.query.unreadOnly === 'true') finalFilter.isRead = false;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    Notification.countDocuments(finalFilter),
    Notification.countDocuments({ recipient_id: req.user._id, isRead: false }),
  ]);

  return sendOk(
    res,
    items,
    'Notifications',
    { ...paginationMeta(total, page, limit), unreadCount }
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient_id: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) throw ApiError.notFound('Notification not found.');
  return sendOk(res, notification, 'Notification marked as read');
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient_id: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return sendOk(res, { modifiedCount: result.modifiedCount }, 'Notifications marked as read');
});
