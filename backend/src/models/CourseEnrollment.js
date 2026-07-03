import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Links a student (User) to a Course and tracks their progress.
 * Field names mirror the frontend contract (progress_percent, user_email, etc.).
 */
const courseEnrollmentSchema = new Schema(
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
    course_level: { type: String, trim: true },
    course_title: { type: String, trim: true },

    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'expired'],
      default: 'active',
      index: true,
    },
    progress_percent: { type: Number, default: 0, min: 0, max: 100 },

    // Topic IDs the student has completed.
    completed_topic_ids: { type: [Schema.Types.ObjectId], default: [] },
    last_topic_id: { type: Schema.Types.ObjectId, ref: 'CourseTopic' },

    completed_date: { type: Date },
    certificate_issued: { type: Boolean, default: false },
    certificate_url: { type: String, trim: true },

    // Blank = unlimited access.
    expiry_date: { type: Date },
    reminder_sent_days: { type: [Number], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// A student can only be enrolled in a course once.
courseEnrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });
courseEnrollmentSchema.index({ status: 1, expiry_date: 1 });

courseEnrollmentSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
export default CourseEnrollment;
