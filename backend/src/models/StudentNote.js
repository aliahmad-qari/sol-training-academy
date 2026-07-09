import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A personal note or bookmark captured by a student. Notes may be attached to a
 * specific course/topic (captured inside the Course Player) or be "general".
 * Field names mirror the frontend contract used by NotesAndBookmarks.jsx.
 */
const studentNoteSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    course_id: { type: String, trim: true, default: 'general' },
    course_title: { type: String, trim: true, default: 'General Notes' },

    // Optional topic context when a note is captured against a lesson.
    topic_id: { type: String, trim: true },
    topic_title: { type: String, trim: true },

    content: { type: String, required: [true, 'Note content is required'], trim: true },
    is_bookmarked: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentNoteSchema.index({ user_id: 1, createdAt: -1 });

studentNoteSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const StudentNote = mongoose.model('StudentNote', studentNoteSchema);
export default StudentNote;
