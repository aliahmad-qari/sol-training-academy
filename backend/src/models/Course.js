import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A training course. Levels map to the frontend's Foundation/Professional/Advanced.
 */
const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 200,
    },
    level: {
      type: String,
      enum: ['level1', 'level2', 'level3'],
      required: [true, 'Course level is required'],
      index: true,
    },
    badge: { type: String, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, default: 0, min: 0 },
    duration: { type: String, trim: true },
    is_published: { type: Boolean, default: false, index: true },
    thumbnail_url: { type: String, trim: true },
    outcomes: { type: [String], default: [] },
    total_topics: { type: Number, default: 0, min: 0 },
    sort_order: { type: Number, default: 0 },
    // Days of access from enrollment. 0 = unlimited.
    access_duration_days: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ is_published: 1, sort_order: 1 });

courseSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
