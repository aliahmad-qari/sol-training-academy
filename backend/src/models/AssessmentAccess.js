import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Server-owned first-access/deadline record for assignments and assessment topics.
 * Prevents students from resetting deadlines by clearing localStorage or changing clocks.
 */
const assessmentAccessSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    target_key: { type: String, required: true, index: true },
    target_type: {
      type: String,
      enum: ['assignment', 'assignment_topic', 'assessment_topic'],
      required: true,
    },
    target_id: { type: Schema.Types.ObjectId, required: true, index: true },
    assignment_id: { type: Schema.Types.ObjectId, ref: 'Assignment', index: true },
    topic_id: { type: Schema.Types.ObjectId, ref: 'CourseTopic', index: true },
    duration_days: { type: Number, default: 0, min: 0 },
    started_at: { type: Date, required: true, default: Date.now },
    expires_at: { type: Date, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assessmentAccessSchema.index({ user_id: 1, target_key: 1 }, { unique: true });

assessmentAccessSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const AssessmentAccess = mongoose.model('AssessmentAccess', assessmentAccessSchema);
export default AssessmentAccess;
