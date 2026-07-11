import mongoose from 'mongoose';

const { Schema } = mongoose;

const studentDocumentSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user_id is required'],
      index: true,
    },
    user_name: { type: String, trim: true },
    user_email: { type: String, lowercase: true, trim: true },

    document_type: {
      type: String,
      enum: [
        'id_proof',
        'qualification',
        'resume',
        'police_check',
        'working_with_children',
        'ndis_worker_screening',
        'insurance',
        'vaccination',
        'other',
      ],
      required: [true, 'document_type is required'],
      index: true,
    },
    document_title: { type: String, required: true, trim: true },
    file_url: { type: String, required: true, trim: true },
    file_name: { type: String, required: true, trim: true },
    file_type: { type: String, trim: true },
    file_public_id: { type: String, trim: true },
    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected', 'resubmit_required'],
      default: 'pending',
      index: true,
    },
    admin_message: { type: String, trim: true },
    admin_id: { type: Schema.Types.ObjectId, ref: 'User' },
    admin_name: { type: String, trim: true },
    reviewed_date: { type: Date },
    ai_generated_message: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentDocumentSchema.index({ user_id: 1, createdAt: -1 });
studentDocumentSchema.index({ status: 1, createdAt: -1 });

studentDocumentSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const StudentDocument = mongoose.model('StudentDocument', studentDocumentSchema);
export default StudentDocument;
