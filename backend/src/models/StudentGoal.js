import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A learning goal a student sets for one of their enrolled courses.
 * Field names mirror the frontend contract used by GoalSetting.jsx.
 */
const studentGoalSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    course_id: { type: String, trim: true, required: [true, 'course_id is required'] },
    course_title: { type: String, trim: true },
    enrollment_id: { type: String, trim: true },

    target_date: { type: Date, required: [true, 'target_date is required'] },
    weekly_hours: { type: Number, default: 5, min: 1, max: 40 },
    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ['active', 'achieved', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentGoalSchema.index({ user_id: 1, createdAt: -1 });

studentGoalSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const StudentGoal = mongoose.model('StudentGoal', studentGoalSchema);
export default StudentGoal;
