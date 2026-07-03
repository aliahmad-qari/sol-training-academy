import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * An assignment/assessment definition created by an admin.
 * Students submit against it (AssignmentSubmission).
 */
const assignmentSchema = new Schema(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    module_id: { type: Schema.Types.ObjectId, ref: 'CourseModule', index: true },
    course_title: { type: String, trim: true },
    module_title: { type: String, trim: true },

    title: { type: String, required: [true, 'Assignment title is required'], trim: true },
    instructions: { type: String },

    brief_file_url: { type: String, trim: true },
    brief_file_name: { type: String, trim: true },

    // Deadline in days from student's first access. 0 = no deadline.
    duration_days: { type: Number, default: 7, min: 0 },
    max_marks: { type: Number, required: [true, 'max_marks is required'], default: 100, min: 0 },
    passing_marks: { type: Number, default: 50, min: 0 },

    allowed_file_types: {
      type: [String],
      default: ['pdf', 'docx', 'zip', 'jpg', 'png'],
    },

    is_published: { type: Boolean, default: false, index: true },
    sort_order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assignmentSchema.index({ course_id: 1, sort_order: 1 });

assignmentSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
