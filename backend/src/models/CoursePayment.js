import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A course purchase record. Created when checkout starts, updated by the
 * Stripe webhook / verification. On completion an enrollment is auto-created.
 */
const coursePaymentSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    user_email: { type: String, lowercase: true, trim: true },
    user_name: { type: String, trim: true },

    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    course_title: { type: String, trim: true },
    course_price: { type: Number, required: [true, 'course_price is required'], min: 0 },

    payment_method: {
      type: String,
      enum: ['stripe', 'paypal', 'eway', 'bank_transfer', 'apple_pay', 'google_pay'],
      required: [true, 'payment_method is required'],
    },
    transaction_id: { type: String, trim: true, index: true },

    // Stripe references
    stripe_session_id: { type: String, trim: true, index: true },
    stripe_payment_intent: { type: String, trim: true },

    payment_status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    enrollment_created: { type: Boolean, default: false },
    enrollment_id: { type: Schema.Types.ObjectId, ref: 'CourseEnrollment' },
    invoice_id: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    receipt_sent: { type: Boolean, default: false },

    // Coupon applied at checkout
    coupon_code: { type: String, trim: true, uppercase: true },
    discount_amount: { type: Number, default: 0, min: 0 },

    amount_paid: { type: Number, min: 0 },
    currency: { type: String, default: 'AUD' },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

coursePaymentSchema.index({ user_id: 1, createdAt: -1 });
coursePaymentSchema.index({ payment_status: 1, createdAt: -1 });

coursePaymentSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const CoursePayment = mongoose.model('CoursePayment', coursePaymentSchema);
export default CoursePayment;
