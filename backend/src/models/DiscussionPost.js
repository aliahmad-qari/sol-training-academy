import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A discussion post (or threaded reply) within a course. Any student enrolled in
 * the course can read and post; replies reference their parent via `parent_id`.
 * Likes are tracked as an array of user ids so a like can be toggled idempotently.
 * Field names mirror the frontend contract used by CourseDiscussion.jsx.
 */
const discussionPostSchema = new Schema(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    course_title: { type: String, trim: true },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    user_name: { type: String, trim: true },
    user_role: { type: String, trim: true },

    // Null/absent for a top-level post; set to a post _id for a reply.
    parent_id: { type: Schema.Types.ObjectId, ref: 'DiscussionPost', default: null, index: true },

    title: { type: String, trim: true },
    content: { type: String, required: [true, 'Post content is required'], trim: true },

    likes: { type: Number, default: 0, min: 0 },
    liked_by: { type: [Schema.Types.ObjectId], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

discussionPostSchema.index({ course_id: 1, createdAt: -1 });
discussionPostSchema.index({ parent_id: 1, createdAt: 1 });

discussionPostSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const DiscussionPost = mongoose.model('DiscussionPost', discussionPostSchema);
export default DiscussionPost;
