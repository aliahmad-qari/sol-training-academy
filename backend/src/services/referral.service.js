import { Referral, User } from '../models/index.js';

const normalizeReferralCode = (value) => String(value || '').trim().toUpperCase();
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

export const resolveReferrerByCode = async (referralCode) => {
  const normalized = normalizeReferralCode(referralCode);
  const match = normalized.match(/^SOL-([A-F0-9]{8})$/);
  if (!match) return null;

  const suffix = match[1];
  const users = await User.find({}, '_id').lean();
  return users.find((user) => String(user._id).toUpperCase().endsWith(suffix)) || null;
};

export const upsertSignupReferral = async ({ referralCode, referredEmail, referredName }) => {
  const referrer = await resolveReferrerByCode(referralCode);
  const email = normalizeEmail(referredEmail);
  if (!referrer || !email) return null;

  const existing = await Referral.findOne({ referred_email: email });
  if (existing) {
    if (String(existing.referrer_id) !== String(referrer._id)) return existing;

    existing.referred_name = referredName || existing.referred_name;
    existing.referral_code = normalizeReferralCode(referralCode) || existing.referral_code;
    if (!existing.status || existing.status === 'pending') existing.status = 'pending';
    await existing.save({ validateBeforeSave: false });
    return existing;
  }

  return Referral.create({
    referrer_id: referrer._id,
    referral_code: normalizeReferralCode(referralCode),
    referred_name: referredName,
    referred_email: email,
    status: 'pending',
  });
};

export const markReferralRegistered = async ({ referredEmail, referredUserId }) => {
  const email = normalizeEmail(referredEmail);
  if (!email) return null;

  const referral = await Referral.findOneAndUpdate(
    {
      referred_email: email,
      status: { $ne: 'enrolled' },
    },
    {
      $set: {
        status: 'registered',
        ...(referredUserId ? { referred_user_id: referredUserId } : {}),
      },
    },
    { new: true }
  );

  return referral;
};

export const markReferralEnrolled = async ({ referredUserId, referredEmail }) => {
  const filter = {};
  if (referredUserId) filter.referred_user_id = referredUserId;
  if (!filter.referred_user_id && referredEmail) filter.referred_email = normalizeEmail(referredEmail);
  if (!filter.referred_user_id && !filter.referred_email) return null;

  const referral = await Referral.findOneAndUpdate(
    filter,
    { $set: { status: 'enrolled' } },
    { new: true }
  );

  return referral;
};