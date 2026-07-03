import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Threaded message within a support ticket.
 */
const ticketMessageSchema = new Schema(
  {
    sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
    sender_name: { type: String, trim: true },
    sender_role: { type: String, enum: ['student', 'team_member', 'admin'], default: 'student' },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

/**
 * Support ticket raised by a student, handled by staff/admin.
 */
const supportTicketSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    user_name: { type: String, trim: true },
    user_email: { type: String, lowercase: true, trim: true },

    category: {
      type: String,
      enum: ['technical', 'course', 'trainer', 'certificate', 'billing', 'other'],
      default: 'other',
      index: true,
    },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    message: { type: String, required: [true, 'Message is required'] },

    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assigned_to: { type: Schema.Types.ObjectId, ref: 'User' },

    messages: { type: [ticketMessageSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ user_id: 1, createdAt: -1 });

supportTicketSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
