import Announcement from '../models/Announcement.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/** GET /api/v1/announcements  — public: only published, newest first */
export const listAnnouncements = asyncHandler(async (req, res) => {
  const isStaff = req.user && ['admin', 'team_member'].includes(req.user.role);
  const filter = isStaff ? {} : { published: true };
  const items = await Announcement.find(filter).sort('-createdAt').limit(100).lean();
  return sendOk(res, items, 'Announcements');
});

/** POST /api/v1/announcements  — admin only */
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, badge, published, pinned } = req.body;
  if (!title || !body) throw ApiError.badRequest('title and body are required.');
  const ann = await Announcement.create({
    title, body,
    badge: badge || 'Notice',
    published: !!published,
    pinned: !!pinned,
    created_by: req.user._id,
  });
  return sendCreated(res, ann, 'Announcement created');
});

/** PATCH /api/v1/announcements/:id  — admin only */
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const allowed = ['title', 'body', 'badge', 'published', 'pinned'];
  const update = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];
  const ann = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!ann) throw ApiError.notFound('Announcement not found.');
  return sendOk(res, ann, 'Announcement updated');
});

/** DELETE /api/v1/announcements/:id  — admin only */
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const ann = await Announcement.findByIdAndDelete(req.params.id);
  if (!ann) throw ApiError.notFound('Announcement not found.');
  return sendOk(res, { id: req.params.id }, 'Announcement deleted');
});
