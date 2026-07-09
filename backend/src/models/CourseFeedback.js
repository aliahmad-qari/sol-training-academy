import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A student's review/feedback for a course they are enrolled in. One feedback
 * per (user, enrollment). Field names mirror the frontend contract used by
 * CourseFeedbackForm.jsx / CourseReviews.jsx.
 */
const courseFeedbackSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    user_name: { type: String, trim: true },

    enrollment_id: { type: String, trim: true, index: true },
    course_id: { type: String, trim: true, index: true },
    course_title: { type: String, trim: true },
    course_level: { type: String, trim: true },

    overall_rating: { type: Number, min: 1, max: 5, required: [true, 'overall_rating is required'] },
    content_quality: { type: Number, min: 0, max: 5, default: 0 },
    delivery_rating: { type: Number, min: 0, max: 5, default: 0 },
    relevance_rating: { type: Number, min: 0, max: 5, default: 0 },

    met_standards: { type: Boolean, default: null },
    would_recommend: { type: Boolean, default: null },
    comments: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One review per student per enrollment (guards against duplicate submissions).
courseFeedbackSchema.index({ user_id: 1, enrollment_id: 1 }, { unique: true, sparse: true });
courseFeedbackSchema.index({ course_id: 1, createdAt: -1 });

courseFeedbackSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const CourseFeedback = mongoose.model('CourseFeedback', courseFeedbackSchema);
export default CourseFeedback;
