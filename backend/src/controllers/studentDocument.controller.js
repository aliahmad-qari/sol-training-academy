import { StudentDocument } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { sendEmail } from '../services/email/email.service.js';
import { safeCreateNotification, safeNotifyAdmins } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

const staffRoles = ['admin', 'team_member'];
const isStaffUser = (user) => staffRoles.includes(user?.role);

const normalizeDocument = (doc) => {
  if (!doc) return doc;
  const value = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc };
  value.id = String(value._id || value.id);
  value.created_date = value.createdAt;
  value.updated_date = value.updatedAt;
  return value;
};

const normalizeDocuments = (docs) => docs.map(normalizeDocument);

const notifyStudentByEmail = (doc, status, message) => {
  if (!doc.user_email) return;

  const statusLabel = status.replace(/_/g, ' ');
  void sendEmail({
    to: doc.user_email,
    subject: `Document ${status === 'verified' ? 'Verified' : 'Update'} - ${doc.document_title} | SOL Training Academy`,
    html: `
      <p>Dear ${(doc.user_name || 'Student').split(' ')[0]},</p>
      <p>Your document <strong>${doc.document_title}</strong> has been reviewed.</p>
      <p><strong>Status:</strong> ${statusLabel}</p>
      ${message ? `<p>${message.replace(/\n/g, '<br />')}</p>` : ''}
      <p>You can log in to your student portal to view the full status of your documents.</p>
      <p>Warm regards,<br />SOL Training Academy</p>
    `,
    text: `Dear ${(doc.user_name || 'Student').split(' ')[0]},

Your document "${doc.document_title}" has been reviewed.

Status: ${statusLabel}

${message || ''}

You can log in to your student portal to view the full status of your documents.

Warm regards,
SOL Training Academy`,
  }).catch((err) => logger.error(`[documents] Failed to email ${doc.user_email}: ${err.message}`));
};

export const createMyDocument = asyncHandler(async (req, res) => {
  const {
    document_type,
    document_title,
    file_url,
    file_name,
    file_type,
    file_public_id,
    notes,
  } = req.body;

  if (!document_type || !file_url || !file_name) {
    throw ApiError.badRequest('document_type, file_url and file_name are required.');
  }

  const doc = await StudentDocument.create({
    user_id: req.user._id,
    user_name: req.user.full_name,
    user_email: req.user.email,
    document_type,
    document_title: document_title || file_name,
    file_url,
    file_name,
    file_type,
    file_public_id,
    notes,
    status: 'pending',
  });

  void safeNotifyAdmins({
    senderId: req.user._id,
    type: 'student_document_uploaded',
    title: 'Student document uploaded',
    message: `${req.user.full_name} uploaded ${doc.document_title}.`,
    category: 'system',
    priority: 'normal',
    actionUrl: '/lms-admin',
    metadata: { tab: 'documents', document_id: doc._id, student_id: req.user._id },
    eventKey: `student_document_uploaded:${doc._id}`,
  });

  return sendCreated(res, normalizeDocument(doc), 'Document uploaded');
});

export const listMyDocuments = asyncHandler(async (req, res) => {
  const docs = await StudentDocument.find({ user_id: req.user._id }).sort('-createdAt').lean();
  return sendOk(res, normalizeDocuments(docs), 'My documents');
});

export const listDocuments = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['status', 'document_type', 'user_id'],
    searchFields: ['user_name', 'user_email', 'document_title', 'file_name'],
    defaultSort: '-createdAt',
  });

  const [items, total] = await Promise.all([
    StudentDocument.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    StudentDocument.countDocuments(filter),
  ]);

  return sendOk(res, normalizeDocuments(items), 'Student documents', paginationMeta(total, page, limit));
});

export const updateDocument = asyncHandler(async (req, res) => {
  const allowed = [
    'status',
    'admin_message',
    'reviewed_date',
    'ai_generated_message',
  ];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  update.admin_id = req.user._id;
  update.admin_name = req.user.full_name || req.user.email || 'Admin';
  if (update.status && !update.reviewed_date) update.reviewed_date = new Date();

  const doc = await StudentDocument.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw ApiError.notFound('Document not found.');

  if (update.status || update.admin_message) {
    notifyStudentByEmail(doc, doc.status, doc.admin_message);
    void safeCreateNotification({
      recipientId: doc.user_id,
      senderId: req.user._id,
      type: 'student_document_reviewed',
      title: 'Document review updated',
      message: `Your document "${doc.document_title}" is now ${doc.status.replace(/_/g, ' ')}.`,
      category: 'system',
      priority: ['rejected', 'resubmit_required'].includes(doc.status) ? 'high' : 'normal',
      actionUrl: '/student-dashboard',
      metadata: { tab: 'documents', document_id: doc._id, status: doc.status },
      eventKey: `student_document_reviewed:${doc._id}:${doc.status}`,
    });
  }

  return sendOk(res, normalizeDocument(doc), 'Document updated');
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await StudentDocument.findById(req.params.id);
  if (!doc) throw ApiError.notFound('Document not found.');

  const isStaff = isStaffUser(req.user);
  const isOwner = String(doc.user_id) === String(req.user._id);
  if (!isStaff && !isOwner) throw ApiError.forbidden('You cannot delete this document.');
  if (!isStaff && !['pending', 'rejected', 'resubmit_required'].includes(doc.status)) {
    throw ApiError.badRequest('Only pending or action-required documents can be deleted.');
  }

  await doc.deleteOne();
  return sendOk(res, { id: req.params.id }, 'Document deleted');
});
