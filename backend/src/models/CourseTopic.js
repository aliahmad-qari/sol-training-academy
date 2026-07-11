import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Embedded quiz question. Quiz topics support single choice, true/false,
 * multi-select, and short-answer prompts. Answer keys are stripped from
 * student-facing responses by the topic controller.
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

/**
 * A topic within a module. `type` drives which fields are relevant:
 *  - video      -> video_url, video_duration_mins, content
 *  - reading    -> reading_file_url, content, reading_duration_mins
 *  - quiz       -> quiz_questions, passing_marks, total_marks, time_limit_mins
 *  - assessment -> assessment_instructions, assessment_* fields
 */
const courseTopicSchema = new Schema(
  {
    module_id: {
      type: Schema.Types.ObjectId,
      ref: 'CourseModule',
      required: [true, 'module_id is required'],
      index: true,
    },
    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    title: { type: String, required: [true, 'Topic title is required'], trim: true },
    type: {
      type: String,
      enum: ['video', 'quiz', 'reading', 'assessment'],
      default: 'video',
      index: true,
    },
    sort_order: { type: Number, default: 0 },
    is_free_preview: { type: Boolean, default: false },

    // Video
    video_url: { type: String, trim: true },
    video_public_id: { type: String, trim: true },
    video_duration_mins: { type: Number, min: 0 },

    // Shared rich content (video description or reading body)
    content: { type: String },

    // Reading
    reading_file_url: { type: String, trim: true },
    reading_file_public_id: { type: String, trim: true },
    reading_file_name: { type: String, trim: true },
    reading_duration_mins: { type: Number, min: 0 },

    // Quiz
    quiz_questions: { type: [quizQuestionSchema], default: [] },
    time_limit_mins: { type: Number, default: 0, min: 0 },
    passing_marks: { type: Number, min: 0 },
    total_marks: { type: Number, min: 0 },

    // Scheduling window (optional)
    available_from: { type: Date },
    available_until: { type: Date },

    // Assessment
    assessment_instructions: { type: String },
    assessment_due_days: { type: Number, min: 0 },
    assessment_max_marks: { type: Number, min: 0 },
    assessment_file_url: { type: String, trim: true },
    assessment_file_public_id: { type: String, trim: true },
    assessment_file_name: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseTopicSchema.index({ course_id: 1, module_id: 1, sort_order: 1 });

courseTopicSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const CourseTopic = mongoose.model('CourseTopic', courseTopicSchema);
export default CourseTopic;
