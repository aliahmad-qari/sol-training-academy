import crypto from 'crypto';
import { Invoice } from '../models/index.js';
import { env } from '../config/env.js';
import { buildInvoicePdf } from '../pdf/invoice.pdf.js';
import { uploadBuffer } from '../cloudinary/cloudinary.service.js';
import { logger } from '../utils/logger.js';

/**
 * Generate a unique invoice number: INV-YYYYMMDD-XXXX
 */
const generateInvoiceNumber = () => {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INV-${stamp}-${rand}`;
};

/**
 * Given a GST-inclusive total, split into ex-GST subtotal + GST component.
 */
export const splitGst = (grossTotal) => {
  const rate = env.company.gstRate || 0.1;
  const subtotal = grossTotal / (1 + rate);
  const gst = grossTotal - subtotal;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    gst: Number(gst.toFixed(2)),
    total: Number(grossTotal.toFixed(2)),
  };
};

/**
 * Create a paid invoice for a completed course payment, render its PDF,
 * upload to Cloudinary, and persist. Returns the Invoice doc.
 *
 * @param {object} params
 * @param {import('mongoose').Document} params.payment  CoursePayment doc
 * @param {import('mongoose').Document} params.user     User doc
 * @returns {Promise<Invoice>}
 */
export const createInvoiceForPayment = async ({ payment, user }) => {
  const grossTotal = payment.amount_paid ?? payment.course_price;
  const { subtotal, gst, total } = splitGst(grossTotal);
  const invoiceNumber = generateInvoiceNumber();

  const invoice = await Invoice.create({
    user_id: user._id,
    invoice_number: invoiceNumber,
    invoice_date: new Date(),
    payment_id: payment._id,
    course_id: payment.course_id,
    business_name: env.company.name,
    customer_name: user.full_name,
    customer_email: user.email,
    service_type: 'course',
    package_name: payment.course_title,
    description: `Enrolment: ${payment.course_title}`,
    amount: subtotal,
    gst,
    total,
    currency: payment.currency || 'AUD',
    status: 'paid',
    payment_method: payment.payment_method,
  });

  // Render + upload PDF (best-effort: a failure here shouldn't void the sale).
  try {
    const pdfBuffer = await buildInvoicePdf({
      invoiceNumber,
      invoiceDate: invoice.invoice_date,
      customerName: user.full_name,
      customerEmail: user.email,
      items: [{ description: payment.course_title, amount: subtotal }],
      subtotal,
      gst,
      total,
      currency: invoice.currency,
      paymentMethod: payment.payment_method,
      status: 'paid',
    });

    const uploaded = await uploadBuffer(pdfBuffer, {
      folder: 'invoices',
      resourceType: 'raw',
      publicId: invoiceNumber,
      filename: `${invoiceNumber}.pdf`,
    });

    invoice.pdf_url = uploaded.url;
    invoice.pdf_public_id = uploaded.publicId;
    await invoice.save();
  } catch (err) {
    logger.error(`[invoice] PDF generation/upload failed for ${invoiceNumber}: ${err.message}`);
  }

  return invoice;
};

export default createInvoiceForPayment;
