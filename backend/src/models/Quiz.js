import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Standalone Quiz. Supports the LMS Admin "Quizzes" module.
 * A quiz may optionally be attached to a course topic (topic_id).
 */
const quizQuestionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['mcq', 'true_false', 'multi_select', 'short_answer'],
      default: 'mcq',
    },
    question: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correct_index: { type: Number, default: 0 },
    correct_indices: { type: [Number], default: [] },
    model_answer: { type: String, trim: true },
    marks: { type: Number, default: 1, min: 0 },
    explanation: { type: String, trim: true },
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    topic_id: { type: Schema.Types.ObjectId, ref: 'CourseTopic', index: true },
    title: { type: String, required: [true, 'Quiz title is required'], trim: true },
    description: { type: String, trim: true },
    questions: { type: [quizQuestionSchema], default: [] },

    total_marks: { type: Number, default: 0, min: 0 },
    passing_marks: { type: Number, default: 0, min: 0 },
    time_limit_mins: { type: Number, default: 0, min: 0 },
    max_attempts: { type: Number, default: 0, min: 0 }, // 0 = unlimited
    is_published: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizSchema.pre('save', function computeTotal(next) {
  if (this.isModified('questions')) {
    this.total_marks = this.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }
  next();
});

quizSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
