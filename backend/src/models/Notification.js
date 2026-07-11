import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true,
    },
    category: {
      type: String,
      enum: ['account', 'course', 'assessment', 'payment', 'support', 'announcement', 'system'],
      default: 'system',
      index: true,
    },
    action_url: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    event_key: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationSchema.index({ recipient_id: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient_id: 1, createdAt: -1 });

notificationSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
