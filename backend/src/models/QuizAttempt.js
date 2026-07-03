import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Records a student's attempt at a quiz (topic-based or standalone).
 * `answers` maps question index → selected option index.
 */
const quizAttemptSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    topic_id: { type: Schema.Types.ObjectId, ref: 'CourseTopic', index: true },
    quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', index: true },

    // Flexible key/value answer map: { "0": 2, "1": 0, ... }
    answers: { type: Schema.Types.Mixed, default: {} },

    score: { type: Number, default: 0, min: 0 },
    total_questions: { type: Number, default: 0, min: 0 },
    total_marks: { type: Number, default: 0, min: 0 },
    passed: { type: Boolean, default: false },
    attempt_number: { type: Number, default: 1, min: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizAttemptSchema.index({ user_id: 1, topic_id: 1, attempt_number: -1 });

quizAttemptSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
