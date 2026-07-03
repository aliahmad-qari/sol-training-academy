import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A completion certificate. PDF is generated (PDFKit), uploaded to Cloudinary,
 * and this record links it to the student + course + enrollment.
 */
const certificateSchema = new Schema(
  {
    certificate_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    user_name: { type: String, trim: true },
    user_email: { type: String, lowercase: true, trim: true },

    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    course_title: { type: String, trim: true },
    course_level: { type: String, trim: true },

    enrollment_id: { type: Schema.Types.ObjectId, ref: 'CourseEnrollment', index: true },

    issued_date: { type: Date, default: Date.now },
    // Cloudinary
    certificate_url: { type: String, trim: true },
    certificate_public_id: { type: String, trim: true },

    // For public verification pages.
    verification_code: { type: String, index: true },

    status: {
      type: String,
      enum: ['issued', 'revoked'],
      default: 'issued',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

certificateSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

certificateSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
