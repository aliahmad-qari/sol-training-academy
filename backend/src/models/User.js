import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

/**
 * User account. Backs both the Student Dashboard and LMS Admin.
 * Roles: student (default), team_member (staff w/ limited admin), admin (full).
 */
const userSchema = new Schema(
  {
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ['student', 'team_member', 'admin'],
      default: 'student',
      index: true,
    },
    phone: { type: String, trim: true },
    avatar_url: { type: String, trim: true },

    // For team_member accounts: which admin pages they may access.
    page_permissions: {
      type: [String],
      default: [],
    },

    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date },

    // Hashed refresh tokens for multi-device sessions / revocation.
    refresh_tokens: {
      type: [
        new Schema(
          {
            token_hash: { type: String, required: true },
            created_at: { type: Date, default: Date.now },
            expires_at: { type: Date, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refresh_tokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// --- Password hashing -------------------------------------------------------
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Convenience: expose an `id` string virtual (frontend base44 used `.id`).
userSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const User = mongoose.model('User', userSchema);
export default User;
