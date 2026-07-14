import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const { Schema } = mongoose;

// OTP + reset-token lifetimes. Kept here so the model owns its own security policy.
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

// sha256 hex — we never persist the raw OTP / reset token (mirrors refresh_tokens).
const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

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
    // This is the single source of truth for module-level RBAC. Each string is
    // a page id from the frontend NAV_SECTIONS (e.g. 'students', 'courses').
    // The invite UI groups these into coarse buckets (see src/lib/permissions.js)
    // but always persists the expanded page-id array here.
    page_permissions: {
      type: [String],
      default: [],
    },

    // --- Team-member profile (only meaningful when role === 'team_member') ----
    // Optional descriptive fields shown in the Team management UI. They carry no
    // authorization weight — access is governed solely by role + page_permissions.
    job_title: { type: String, trim: true, maxlength: 120 },
    department: { type: String, trim: true, maxlength: 120 },
    job_role: { type: String, trim: true, maxlength: 120 },
    // full_name / _id of the admin who provisioned this team member (audit trail).
    invited_by: { type: String, trim: true },

    is_active: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active',
      index: true,
    },
    last_login_at: { type: Date },

    // --- Email verification (OTP) -----------------------------------------
    // NOTE: new accounts default to false. Pre-existing accounts (created
    // before this field existed) are backfilled to `true` by the
    // `migrate:verified` script so they are never locked out.
    is_verified: { type: Boolean, default: false },
    // sha256 hash of the 6-digit OTP + its expiry. Never store the raw code.
    otp_code: { type: String, select: false },
    otp_expires: { type: Date, select: false },

    // --- Forgot / reset password ------------------------------------------
    // sha256 hash of a random reset token emailed as a link, + its expiry.
    reset_password_token: { type: String, select: false },
    reset_password_expires: { type: Date, select: false },

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
        delete ret.otp_code;
        delete ret.otp_expires;
        delete ret.reset_password_token;
        delete ret.reset_password_expires;
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

// --- OTP + reset token generation -------------------------------------------
/**
 * Generate a fresh 6-digit email-verification OTP.
 * Stores only the sha256 hash + expiry on the document (call `.save()` after);
 * returns the PLAIN code so the caller can email it.
 */
userSchema.methods.generateOtp = function generateOtp() {
  // crypto.randomInt gives a uniform, non-biased 6-digit code (100000–999999).
  const code = String(crypto.randomInt(100000, 1000000));
  this.otp_code = sha256(code);
  this.otp_expires = new Date(Date.now() + OTP_TTL_MS);
  return code;
};

/**
 * Verify a candidate OTP against the stored hash + expiry.
 * Requires the doc to have been loaded with `+otp_code +otp_expires`.
 */
userSchema.methods.verifyOtp = function verifyOtpMethod(candidate) {
  if (!this.otp_code || !this.otp_expires) return false;
  if (this.otp_expires.getTime() < Date.now()) return false;
  return sha256(candidate) === this.otp_code;
};

/** Clear OTP fields after a successful verification (or invalidation). */
userSchema.methods.clearOtp = function clearOtp() {
  this.otp_code = undefined;
  this.otp_expires = undefined;
};

/**
 * Generate a password-reset token. Stores only the sha256 hash + expiry;
 * returns the PLAIN token to embed in the emailed reset link.
 */
userSchema.methods.generatePasswordResetToken = function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  this.reset_password_token = sha256(token);
  this.reset_password_expires = new Date(Date.now() + RESET_TTL_MS);
  return token;
};

/** Clear reset fields after a successful (or invalidated) reset. */
userSchema.methods.clearPasswordReset = function clearPasswordReset() {
  this.reset_password_token = undefined;
  this.reset_password_expires = undefined;
};

/** Static helper: hash a raw reset token for a DB lookup by hash. */
userSchema.statics.hashResetToken = (token) => sha256(token);

// Convenience: expose an `id` string virtual (frontend base44 used `.id`).
userSchema.virtual('id').get(function idVirtual() {
  return this._id.toHexString();
});

const User = mongoose.model('User', userSchema);
export default User;
