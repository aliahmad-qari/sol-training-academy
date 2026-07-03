import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Discount coupon applied at course checkout.
 * `course_id` empty = applies to all courses.
 */
const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discount_type: {
      type: String,
      enum: ['percent', 'fixed'],
      default: 'percent',
    },
    discount_value: {
      type: Number,
      required: [true, 'discount_value is required'],
      min: 0,
    },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', default: null },

    max_uses: { type: Number, default: 100, min: 0 },
    used_count: { type: Number, default: 0, min: 0 },
    expires_at: { type: Date },
    is_active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Whether the coupon can currently be redeemed.
 */
couponSchema.methods.isRedeemable = function isRedeemable() {
  if (!this.is_active) return false;
  if (this.expires_at && this.expires_at.getTime() < Date.now()) return false;
  if (this.max_uses > 0 && this.used_count >= this.max_uses) return false;
  return true;
};

/**
 * Compute the discounted price for a given base price (never below 0).
 */
couponSchema.methods.applyTo = function applyTo(price) {
  let discount = 0;
  if (this.discount_type === 'percent') {
    discount = (price * this.discount_value) / 100;
  } else {
    discount = this.discount_value;
  }
  const discounted = Math.max(0, price - discount);
  return {
    discount: Math.min(price, Number(discount.toFixed(2))),
    finalPrice: Number(discounted.toFixed(2)),
  };
};

couponSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
