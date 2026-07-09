import { StudentNote } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/notes   (protected; student)
 * Always scoped to the authenticated user — a student only ever sees own notes.
 */
export const listNotes = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id', 'is_bookmarked'],
    searchFields: ['content', 'topic_title', 'course_title'],
    defaultSort: '-createdAt',
  });
  const finalFilter = { ...filter, user_id: req.user._id };

  const [items, total] = await Promise.all([
    StudentNote.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    StudentNote.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Notes', paginationMeta(total, page, limit));
});

/**
 * POST /api/v1/notes   (protected; student)
 * Body: { content, course_id?, course_title?, topic_id?, topic_title?, is_bookmarked? }
 */
export const createNote = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) throw ApiError.badRequest('Note content is required.');

  const note = await StudentNote.create({
    user_id: req.user._id,
    course_id: req.body.course_id || 'general',
    course_title: req.body.course_title || 'General Notes',
    topic_id: req.body.topic_id,
    topic_title: req.body.topic_title,
    content: content.trim(),
    is_bookmarked: !!req.body.is_bookmarked,
  });
  return sendCreated(res, note, 'Note created');
});

const loadOwnedNote = async (req) => {
  const note = await StudentNote.findById(req.params.id);
  if (!note) throw ApiError.notFound('Note not found.');
  if (String(note.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot modify this note.');
  }
  return note;
};

/**
 * PUT /api/v1/notes/:id   (protected; owner)
 * Body: { content?, is_bookmarked?, topic_title? }
 */
export const updateNote = asyncHandler(async (req, res) => {
  const note = await loadOwnedNote(req);
  const allowed = ['content', 'is_bookmarked', 'topic_title', 'course_title'];
  for (const k of allowed) if (req.body[k] !== undefined) note[k] = req.body[k];
  await note.save();
  return sendOk(res, note, 'Note updated');
});

/**
 * DELETE /api/v1/notes/:id   (protected; owner)
 */
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await loadOwnedNote(req);
  await note.deleteOne();
  return sendOk(res, { id: req.params.id }, 'Note deleted');
});
