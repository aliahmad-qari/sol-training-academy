import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A direct message between two students, scoped to a course context.
 * Either participant can read the thread; outsiders cannot.
 */
const directMessageSchema = new Schema(
  {
    // The two participants — stored sorted so a single index covers both directions.
    sender_id:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    sender_name:   { type: String, trim: true },
    receiver_name: { type: String, trim: true },

    // Course context (required — DMs are course-scoped so RBAC is simple:
    // both parties must be enrolled in this course).
    course_id:    { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    course_title: { type: String, trim: true },

    content: { type: String, required: true, trim: true, maxlength: 2000 },

    // Mark as read when recipient fetches the thread.
    read_at: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Fast thread lookup: given (courseId, userA, userB) → all messages sorted by time.
directMessageSchema.index({ course_id: 1, sender_id: 1, receiver_id: 1, createdAt: 1 });
// Unread count for a receiver in a course.
directMessageSchema.index({ receiver_id: 1, course_id: 1, read_at: 1 });

directMessageSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
export default DirectMessage;
