import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A tax invoice / receipt. In the LMS scope, invoices are generated for
 * course payments (service_type = 'course'), but the schema keeps the
 * broader service enum for forward compatibility.
 */
const invoiceSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    invoice_number: {
      type: String,
      required: [true, 'invoice_number is required'],
      unique: true,
      index: true,
    },
    invoice_date: { type: Date, default: Date.now },
    due_date: { type: Date },

    // Linked course payment (LMS invoices)
    payment_id: { type: Schema.Types.ObjectId, ref: 'CoursePayment', index: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course' },

    business_name: { type: String, trim: true },
    customer_name: { type: String, trim: true },
    customer_email: { type: String, lowercase: true, trim: true },

    service_type: {
      type: String,
      enum: ['course', 'ndis_registration', 'website_development', 'software_automation', 'accountancy', 'marketing'],
      default: 'course',
    },
    package_name: { type: String, trim: true },
    description: { type: String },

    amount: { type: Number, required: true, min: 0 }, // ex-GST subtotal
    gst: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'AUD' },

    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
      index: true,
    },
    payment_method: { type: String, trim: true },

    // Cloudinary-hosted PDF
    pdf_url: { type: String, trim: true },
    pdf_public_id: { type: String, trim: true },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

invoiceSchema.index({ user_id: 1, createdAt: -1 });

invoiceSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
