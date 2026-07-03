import crypto from 'crypto';
import { Certificate, CourseEnrollment, Course, User } from '../models/index.js';
import { buildCertificatePdf } from '../pdf/certificate.pdf.js';
import { uploadBuffer } from '../cloudinary/cloudinary.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Generate a human-readable certificate number: SOL-YYYY-XXXXXX
 */
const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SOL-${year}-${rand}`;
};

const generateVerificationCode = () => crypto.randomBytes(6).toString('hex').toUpperCase();

/**
 * Issue (or return existing) certificate for a user+course.
 * Idempotent: if a certificate already exists it is returned unchanged.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.courseId
 * @param {string} [params.enrollmentId]
 * @returns {Promise<Certificate>}
 */
export const issueCertificate = async ({ userId, courseId, enrollmentId }) => {
  // Idempotency: unique (user_id, course_id) index also protects against races.
  const existing = await Certificate.findOne({ user_id: userId, course_id: courseId });
  if (existing) return existing;

  const [user, course] = await Promise.all([
    User.findById(userId),
    Course.findById(courseId),
  ]);
  if (!user) throw ApiError.notFound('User not found.');
  if (!course) throw ApiError.notFound('Course not found.');

  const certificateNumber = generateCertificateNumber();
  const verificationCode = generateVerificationCode();
  const issuedDate = new Date();

  // 1. Build the PDF in memory.
  const pdfBuffer = await buildCertificatePdf({
    studentName: user.full_name,
    courseTitle: course.title,
    certificateNumber,
    issuedDate,
    verificationCode,
  });

  // 2. Upload to Cloudinary as a raw PDF asset.
  const uploaded = await uploadBuffer(pdfBuffer, {
    folder: 'certificates',
    resourceType: 'raw',
    publicId: certificateNumber,
    filename: `${certificateNumber}.pdf`,
  });

  // 3. Persist the record.
  const certificate = await Certificate.create({
    certificate_number: certificateNumber,
    user_id: user._id,
    user_name: user.full_name,
    user_email: user.email,
    course_id: course._id,
    course_title: course.title,
    course_level: course.level,
    enrollment_id: enrollmentId,
    issued_date: issuedDate,
    certificate_url: uploaded.url,
    certificate_public_id: uploaded.publicId,
    verification_code: verificationCode,
    status: 'issued',
  });

  // 4. Reflect issuance on the enrollment (best-effort).
  if (enrollmentId) {
    await CourseEnrollment.findByIdAndUpdate(enrollmentId, {
      certificate_issued: true,
      certificate_url: uploaded.url,
    });
  } else {
    await CourseEnrollment.findOneAndUpdate(
      { user_id: userId, course_id: courseId },
      { certificate_issued: true, certificate_url: uploaded.url }
    );
  }

  return certificate;
};

export default issueCertificate;
