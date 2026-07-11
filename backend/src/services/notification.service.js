import { Notification, User } from '../models/index.js';
import { logger } from '../utils/logger.js';

const staffRoles = ['admin', 'team_member'];

const compactIds = (ids = []) => [...new Set(ids.filter(Boolean).map(String))];

export const createNotificationRecord = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  priority = 'normal',
  category = 'system',
  actionUrl = '',
  metadata = {},
  eventKey,
}) => {
  if (!recipientId || !type || !title || !message) return null;

  const payload = {
    recipient_id: recipientId,
    sender_id: senderId,
    type,
    title,
    message,
    priority,
    category,
    action_url: actionUrl,
    metadata,
  };
  if (eventKey) payload.event_key = eventKey;

  try {
    return await Notification.create(payload);
  } catch (err) {
    if (err.code === 11000 && eventKey) {
      return Notification.findOne({ event_key: eventKey });
    }
    throw err;
  }
};

export const notifyMany = async (recipientIds, notification) => {
  const ids = compactIds(recipientIds);
  if (!ids.length) return [];

  const results = [];
  for (const recipientId of ids) {
    const suffix = notification.eventKey ? `:${recipientId}` : undefined;
    // eslint-disable-next-line no-await-in-loop
    const created = await createNotificationRecord({
      ...notification,
      recipientId,
      eventKey: notification.eventKey ? `${notification.eventKey}${suffix}` : undefined,
    });
    results.push(created);
  }
  return results;
};

export const notifyAdmins = async (notification) => {
  const admins = await User.find({
    role: { $in: staffRoles },
    is_active: true,
  }).select('_id').lean();

  return notifyMany(admins.map((admin) => admin._id), notification);
};

export const notifyStudents = async (notification) => {
  const students = await User.find({
    role: 'student',
    is_active: true,
    is_verified: true,
  }).select('_id').lean();

  return notifyMany(students.map((student) => student._id), notification);
};

export const safeCreateNotification = async (notification) => {
  try {
    return await createNotificationRecord(notification);
  } catch (err) {
    logger.error(`[notification] create failed: ${err.message}`);
    return null;
  }
};

export const safeNotifyAdmins = async (notification) => {
  try {
    return await notifyAdmins(notification);
  } catch (err) {
    logger.error(`[notification] admin notify failed: ${err.message}`);
    return [];
  }
};

export const safeNotifyStudents = async (notification) => {
  try {
    return await notifyStudents(notification);
  } catch (err) {
    logger.error(`[notification] student notify failed: ${err.message}`);
    return [];
  }
};
