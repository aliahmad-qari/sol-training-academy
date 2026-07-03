import { Certificate, CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { issueCertificate } from '../services/certificate.service.js';
import { buildQuery } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/certificates            (protected)
 * Students see only their own; admin/team_member see all (with filters).
 * Supports pagination/sort/search via query helper.
 */
export const listCertificates = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const baseFilter = isStaff ? {} : { user_id: req.user._id };

  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id', 'status', 'user_id'],
    searchFields: ['user_name', 'course_title', 'certificate_number'],
    defaultSort: '-issued_date',
  });

  const finalFilter = { ...baseFilter, ...filter };
  const [items, total] = await Promise.all([
    Certificate.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    Certificate.countDocuments(finalFilter),
  ]);

  return sendOk(res, items, 'Certificates', {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});

/**
 * GET /api/v1/certificates/:id        (protected; owner or staff)
 */
export const getCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id).lean();
  if (!cert) throw ApiError.notFound('Certificate not found.');

  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  if (!isStaff && String(cert.user_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot access this certificate.');
  }
  return sendOk(res, cert, 'Certificate');
});

/**
 * GET /api/v1/certificates/verify/:code   (public)
 * Public verification endpoint — returns limited, non-sensitive fields.
 */
export const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ verification_code: req.params.code }).lean();
  if (!cert || cert.status !== 'issued') {
    throw ApiError.notFound('No valid certificate found for this code.');
  }
  return sendOk(
    res,
    {
      valid: true,
      certificate_number: cert.certificate_number,
      user_name: cert.user_name,
      course_title: cert.course_title,
      issued_date: cert.issued_date,
    },
    'Certificate verified'
  );
});

/**
 * POST /api/v1/certificates/issue     (protected)
 * Body: { enrollment_id }   OR   { user_id, course_id } (staff only)
 *
 * A student may only issue their OWN certificate and only if their
 * enrollment is completed. Staff may issue for any enrollment.
 * 201 → certificate
 */
export const issue = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  let userId;
  let courseId;
  let enrollmentId = req.body.enrollment_id;

  if (enrollmentId) {
    const enrollment = await CourseEnrollment.findById(enrollmentId);
    if (!enrollment) throw ApiError.notFound('Enrollment not found.');

    if (!isStaff && String(enrollment.user_id) !== String(req.user._id)) {
      throw ApiError.forbidden('You cannot issue a certificate for this enrollment.');
    }
    if (!isStaff && enrollment.status !== 'completed') {
      throw ApiError.badRequest('Certificate is only available after course completion.');
    }
    userId = enrollment.user_id;
    courseId = enrollment.course_id;
  } else if (isStaff && req.body.user_id && req.body.course_id) {
    userId = req.body.user_id;
    courseId = req.body.course_id;
    const enrollment = await CourseEnrollment.findOne({ user_id: userId, course_id: courseId });
    enrollmentId = enrollment?._id;
  } else {
    throw ApiError.badRequest('Provide enrollment_id (or user_id + course_id for staff).');
  }

  const certificate = await issueCertificate({ userId, courseId, enrollmentId });
  return sendCreated(res, certificate, 'Certificate issued');
});

/**
 * PATCH /api/v1/certificates/:id/revoke   (protected; admin)
 */
export const revokeCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findByIdAndUpdate(
    req.params.id,
    { status: 'revoked' },
    { new: true }
  );
  if (!cert) throw ApiError.notFound('Certificate not found.');
  return sendOk(res, cert, 'Certificate revoked');
});
