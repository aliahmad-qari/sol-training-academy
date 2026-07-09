import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A referral made by a student ("referrer") of another person ("referred").
 * Status advances pending → registered → enrolled as the referred user signs up
 * and enrols. Field names mirror the frontend contract used by ReferralHub.jsx.
 */
const referralSchema = new Schema(
  {
    referrer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'referrer_id is required'],
      index: true,
    },
    referral_code: { type: String, trim: true, index: true },

    referred_name: { type: String, trim: true },
    referred_email: { type: String, lowercase: true, trim: true },
    referred_user_id: { type: Schema.Types.ObjectId, ref: 'User' },

    status: {
      type: String,
      enum: ['pending', 'registered', 'enrolled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

referralSchema.index({ referrer_id: 1, createdAt: -1 });

referralSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
