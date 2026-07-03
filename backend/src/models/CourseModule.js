import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A module (section) within a course. Contains topics.
 */
const courseModuleSchema = new Schema(
  {
    course_id: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'course_id is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true },
    sort_order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseModuleSchema.index({ course_id: 1, sort_order: 1 });

courseModuleSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const CourseModule = mongoose.model('CourseModule', courseModuleSchema);
export default CourseModule;
