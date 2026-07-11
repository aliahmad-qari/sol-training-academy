import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A student's submission for a standalone Assignment or a course assessment topic.
 * File assets are stored on Cloudinary.
 */
const assignmentSubmissionSchema = new Schema(
  {
    assignment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      index: true,
    },
    topic_id: {
      type: Schema.Types.ObjectId,
      ref: 'CourseTopic',
      index: true,
    },
    assignment_title: { type: String, trim: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', index: true },
    course_title: { type: String, trim: true },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    user_name: { type: String, trim: true },
    user_email: { type: String, lowercase: true, trim: true },

    file_url: { type: String, required: [true, 'file_url is required'], trim: true },
    file_name: { type: String, trim: true },
    file_type: { type: String, trim: true },
    file_public_id: { type: String, trim: true },
    submission_notes: { type: String },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'graded', 'resubmit_requested'],
      default: 'submitted',
      index: true,
    },
    marks_awarded: { type: Number, min: 0 },
    max_marks: { type: Number, min: 0 },
    passing_marks: { type: Number, min: 0 },
    feedback: { type: String },
    graded_by: { type: Schema.Types.ObjectId, ref: 'User' },
    graded_date: { type: Date },
    passed: { type: Boolean },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assignmentSubmissionSchema.index({ assignment_id: 1, user_id: 1 });
assignmentSubmissionSchema.index({ topic_id: 1, user_id: 1 });
assignmentSubmissionSchema.index({ status: 1, createdAt: -1 });

assignmentSubmissionSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
export default AssignmentSubmission;
