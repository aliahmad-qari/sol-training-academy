import PDFDocument from 'pdfkit';
import { env } from '../config/env.js';

/**
 * Render a tax invoice / receipt to a PDF Buffer.
 *
 * @param {object} data
 * @param {string} data.invoiceNumber
 * @param {Date}   data.invoiceDate
 * @param {string} data.customerName
 * @param {string} data.customerEmail
 * @param {Array<{description:string, amount:number}>} data.items
 * @param {number} data.subtotal
 * @param {number} data.gst
 * @param {number} data.total
 * @param {string} data.currency
 * @param {string} [data.paymentMethod]
 * @param {string} [data.status]
 * @returns {Promise<Buffer>}
 */
export const buildInvoicePdf = (data) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const navy = '#0b2545';
      const ink = '#1f2937';
      const muted = '#6b7280';
      const cur = (data.currency || 'AUD').toUpperCase();
      const money = (n) => `${cur} $${Number(n || 0).toFixed(2)}`;

      // --- Header ---
      doc.fillColor(navy).font('Helvetica-Bold').fontSize(22).text(env.company.name, 50, 50);
      if (env.company.abn) doc.fillColor(muted).font('Helvetica').fontSize(10).text(`ABN ${env.company.abn}`, 50, 78);
      if (env.company.address) doc.fillColor(muted).fontSize(10).text(env.company.address, 50, 92);

      doc.fillColor(navy).font('Helvetica-Bold').fontSize(26).text('TAX INVOICE', 0, 50, { align: 'right' });
      doc
        .fillColor(ink)
        .font('Helvetica')
        .fontSize(10)
        .text(`Invoice #: ${data.invoiceNumber}`, 0, 84, { align: 'right' })
        .text(
          `Date: ${new Date(data.invoiceDate || Date.now()).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}`,
          { align: 'right' }
        )
        .text(`Status: ${(data.status || 'paid').toUpperCase()}`, { align: 'right' });

      // --- Bill To ---
      doc.moveTo(50, 130).lineTo(545, 130).strokeColor('#e5e7eb').lineWidth(1).stroke();
      doc.fillColor(muted).font('Helvetica-Bold').fontSize(11).text('BILL TO', 50, 145);
      doc.fillColor(ink).font('Helvetica').fontSize(12).text(data.customerName || '', 50, 162);
      if (data.customerEmail) doc.fillColor(muted).fontSize(10).text(data.customerEmail, 50, 180);

      // --- Items table ---
      const tableTop = 220;
      doc.fillColor(navy).font('Helvetica-Bold').fontSize(11);
      doc.text('DESCRIPTION', 50, tableTop);
      doc.text('AMOUNT', 0, tableTop, { align: 'right' });
      doc.moveTo(50, tableTop + 18).lineTo(545, tableTop + 18).strokeColor(navy).lineWidth(1).stroke();

      let y = tableTop + 30;
      doc.font('Helvetica').fontSize(11).fillColor(ink);
      for (const item of data.items || []) {
        doc.text(item.description, 50, y, { width: 380 });
        doc.text(money(item.amount), 0, y, { align: 'right' });
        y += 24;
      }

      // --- Totals ---
      y += 10;
      doc.moveTo(320, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(1).stroke();
      y += 12;
      const totalsRow = (label, value, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 13 : 11).fillColor(bold ? navy : ink);
        doc.text(label, 320, y, { width: 130, align: 'left' });
        doc.text(value, 0, y, { align: 'right' });
        y += bold ? 22 : 18;
      };
      totalsRow('Subtotal (ex GST)', money(data.subtotal));
      totalsRow(`GST (${Math.round((env.company.gstRate || 0.1) * 100)}%)`, money(data.gst));
      totalsRow('TOTAL PAID', money(data.total), true);

      if (data.paymentMethod) {
        doc.font('Helvetica').fontSize(10).fillColor(muted).text(`Payment Method: ${data.paymentMethod}`, 320, y, { align: 'right' });
      }

      // --- Footer ---
      doc
        .fillColor(muted)
        .font('Helvetica')
        .fontSize(9)
        .text('Thank you for your purchase. This document serves as your official tax invoice and receipt.', 50, 760, {
          align: 'center',
          width: 495,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

export default buildInvoicePdf;
