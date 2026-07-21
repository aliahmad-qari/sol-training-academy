import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Server-owned quiz attempt session. Timed quizzes are validated against this
 * record during submission so browser storage or clock changes cannot extend time.
 */
const quizSessionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    topic_id: { type: Schema.Types.ObjectId, ref: 'CourseTopic', index: true },
    quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', index: true },
    attempt_number: { type: Number, required: true, min: 1 },
    time_limit_mins: { type: Number, default: 0, min: 0 },
    started_at: { type: Date, required: true, default: Date.now },
    expires_at: { type: Date, index: true },
    submitted_at: { type: Date },
    attempt_id: { type: Schema.Types.ObjectId, ref: 'QuizAttempt' },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'expired'],
      default: 'in_progress',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizSessionSchema.index({ user_id: 1, topic_id: 1, status: 1 });
quizSessionSchema.index({ user_id: 1, quiz_id: 1, status: 1 });

quizSessionSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
export default QuizSession;
