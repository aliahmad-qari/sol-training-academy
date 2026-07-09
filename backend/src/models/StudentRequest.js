import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A request raised by a student (new course, video, resource, feature, etc.),
 * reviewed and responded to by an admin.
 * Field names mirror the frontend contract used by StudentRequests.jsx.
 */
const studentRequestSchema = new Schema(
  {
    student_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'student_id is required'],
      index: true,
    },
    student_name: { type: String, trim: true },
    student_email: { type: String, lowercase: true, trim: true },

    type: {
      type: String,
      enum: ['new_course', 'new_video', 'course_update', 'resource_request', 'feature_request', 'other'],
      default: 'other',
      index: true,
    },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },

    attachment_url: { type: String, trim: true },
    attachment_name: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    admin_response: { type: String },
    admin_name: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentRequestSchema.index({ student_id: 1, createdAt: -1 });

studentRequestSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const StudentRequest = mongoose.model('StudentRequest', studentRequestSchema);
export default StudentRequest;
