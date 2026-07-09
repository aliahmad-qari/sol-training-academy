import { Referral } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

const isStaff = (req) => ['admin', 'team_member'].includes(req.user.role);

/**
 * GET /api/v1/referrals   (protected)
 * Students → own referrals; staff → all.
 */
export const listReferrals = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['status', 'referrer_id', 'referral_code'],
    searchFields: ['referred_name', 'referred_email'],
    defaultSort: '-createdAt',
  });
  const baseFilter = isStaff(req) ? {} : { referrer_id: req.user._id };
  const finalFilter = { ...baseFilter, ...filter };

  const [items, total] = await Promise.all([
    Referral.find(finalFilter).sort(sort).skip(skip).limit(limit).lean(),
    Referral.countDocuments(finalFilter),
  ]);
  return sendOk(res, items, 'Referrals', paginationMeta(total, page, limit));
});

/**
 * POST /api/v1/referrals   (protected; student)
 * Body: { referred_name?, referred_email, referral_code? }
 * Lets a student manually log a person they referred.
 */
export const createReferral = asyncHandler(async (req, res) => {
  const { referred_email } = req.body;
  if (!referred_email) throw ApiError.badRequest('referred_email is required.');

  const referral = await Referral.create({
    referrer_id: req.user._id,
    referral_code: req.body.referral_code || `SOL-${String(req.user._id).slice(-8).toUpperCase()}`,
    referred_name: req.body.referred_name,
    referred_email,
    status: 'pending',
  });
  return sendCreated(res, referral, 'Referral created');
});

/**
 * DELETE /api/v1/referrals/:id   (protected; owner or staff)
 */
export const deleteReferral = asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.id);
  if (!referral) throw ApiError.notFound('Referral not found.');
  if (!isStaff(req) && String(referral.referrer_id) !== String(req.user._id)) {
    throw ApiError.forbidden('You cannot delete this referral.');
  }
  await referral.deleteOne();
  return sendOk(res, { id: req.params.id }, 'Referral deleted');
});
