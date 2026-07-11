import Announcement from '../models/Announcement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { safeNotifyStudents } from '../services/notification.service.js';

const announcementMessage = (body) => String(body || '').slice(0, 220);

const notifyPublishedAnnouncement = (announcement, senderId) => {
  void safeNotifyStudents({
    senderId,
    type: 'announcement_published',
    title: announcement.title,
    message: announcementMessage(announcement.body),
    category: 'announcement',
    priority: announcement.pinned ? 'high' : 'normal',
    actionUrl: '/student-dashboard',
    metadata: {
      tab: 'announcements',
      announcement_id: announcement._id,
      badge: announcement.badge,
    },
    eventKey: `announcement_published:${announcement._id}`,
  });
};

/** GET /api/v1/announcements — public: only published, newest first */
export const listAnnouncements = asyncHandler(async (req, res) => {
  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);
  const filter = isStaff ? {} : { published: true };
  const items = await Announcement.find(filter).sort('-createdAt').limit(100).lean();
  return sendOk(res, items, 'Announcements');
});

/** POST /api/v1/announcements — admin only */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, badge, published, pinned } = req.body;
  if (!title || !body) throw ApiError.badRequest('title and body are required.');

  const ann = await Announcement.create({
    title,
    body,
    badge: badge || 'Notice',
    published: !!published,
    pinned: !!pinned,
    created_by: req.user._id,
  });

  if (ann.published) notifyPublishedAnnouncement(ann, req.user._id);

  return sendCreated(res, ann, 'Announcement created');
});

/** PATCH /api/v1/announcements/:id — admin only */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const existing = await Announcement.findById(req.params.id).lean();
  if (!existing) throw ApiError.notFound('Announcement not found.');

  const allowed = ['title', 'body', 'badge', 'published', 'pinned'];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const ann = await Announcement.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!ann) throw ApiError.notFound('Announcement not found.');

  if (!existing.published && ann.published) {
    notifyPublishedAnnouncement(ann, req.user._id);
  }

  return sendOk(res, ann, 'Announcement updated');
});

/** DELETE /api/v1/announcements/:id — admin only */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const ann = await Announcement.findByIdAndDelete(req.params.id);
  if (!ann) throw ApiError.notFound('Announcement not found.');
  return sendOk(res, { id: req.params.id }, 'Announcement deleted');
});
