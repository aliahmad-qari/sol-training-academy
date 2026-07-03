import PDFDocument from 'pdfkit';
import { env } from '../config/env.js';

/**
 * Render a completion certificate to a PDF Buffer using PDFKit.
 * Landscape A4 with a decorative border. No external assets required.
 *
 * @param {object} data
 * @param {string} data.studentName
 * @param {string} data.courseTitle
 * @param {string} data.certificateNumber
 * @param {Date}   data.issuedDate
 * @param {string} [data.verificationCode]
 * @returns {Promise<Buffer>}
 */
export const buildCertificatePdf = (data) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW = doc.page.width;
      const pageH = doc.page.height;

      const navy = '#0b2545';
      const gold = '#c9a24b';
      const ink = '#1f2937';

      // Background
      doc.rect(0, 0, pageW, pageH).fill('#ffffff');

      // Outer + inner border
      doc.lineWidth(6).strokeColor(navy).rect(24, 24, pageW - 48, pageH - 48).stroke();
      doc.lineWidth(1.5).strokeColor(gold).rect(38, 38, pageW - 76, pageH - 76).stroke();

      // Header
      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(30)
        .text(env.company.name || 'SOL Training Academy', 0, 80, { align: 'center' });

      doc
        .fillColor(gold)
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('CERTIFICATE OF COMPLETION', 0, 125, { align: 'center', characterSpacing: 2 });

      // Body
      doc
        .fillColor(ink)
        .font('Helvetica')
        .fontSize(14)
        .text('This is to certify that', 0, 185, { align: 'center' });

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(34)
        .text(data.studentName || 'Student', 0, 210, { align: 'center' });

      doc
        .fillColor(ink)
        .font('Helvetica')
        .fontSize(14)
        .text('has successfully completed the course', 0, 265, { align: 'center' });

      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(data.courseTitle || 'Course', 60, 295, { align: 'center', width: pageW - 120 });

      // Footer details
      const issued = data.issuedDate instanceof Date ? data.issuedDate : new Date(data.issuedDate || Date.now());
      const issuedStr = issued.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

      const footY = pageH - 130;
      // Date (left)
      doc.lineWidth(1).strokeColor(navy).moveTo(120, footY).lineTo(300, footY).stroke();
      doc.fillColor(ink).font('Helvetica').fontSize(11).text(issuedStr, 120, footY + 6, { width: 180, align: 'center' });
      doc.fillColor('#6b7280').fontSize(9).text('Date Issued', 120, footY + 22, { width: 180, align: 'center' });

      // Signature (right)
      doc.lineWidth(1).strokeColor(navy).moveTo(pageW - 300, footY).lineTo(pageW - 120, footY).stroke();
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(11).text('SOL Training Academy', pageW - 300, footY + 6, { width: 180, align: 'center' });
      doc.fillColor('#6b7280').font('Helvetica').fontSize(9).text('Authorised Signature', pageW - 300, footY + 22, { width: 180, align: 'center' });

      // Certificate number + verification (centered bottom)
      doc
        .fillColor('#6b7280')
        .fontSize(9)
        .text(
          `Certificate No: ${data.certificateNumber}${data.verificationCode ? `   •   Verify: ${data.verificationCode}` : ''}`,
          0,
          pageH - 60,
          { align: 'center' }
        );

      if (env.company.abn) {
        doc.fillColor('#9ca3af').fontSize(8).text(`ABN ${env.company.abn}`, 0, pageH - 46, { align: 'center' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

export default buildCertificatePdf;
