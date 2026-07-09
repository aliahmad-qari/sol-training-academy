import mongoose from 'mongoose';

const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    title:     { type: String, required: true, trim: true },
    body:      { type: String, required: true, trim: true },
    badge:     { type: String, trim: true, default: 'Notice' },
    published: { type: Boolean, default: false },
    pinned:    { type: Boolean, default: false },
    created_by:{ type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

announcementSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
