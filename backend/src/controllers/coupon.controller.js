import { Coupon } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * GET /api/v1/coupons   (staff)
 */
export const listCoupons = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['is_active', 'discount_type', 'course_id'],
    searchFields: ['code'],
    defaultSort: '-createdAt',
  });
  const [items, total] = await Promise.all([
    Coupon.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);
  return sendOk(res, items, 'Coupons', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/coupons/:id   (staff)
 */
export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id).lean();
  if (!coupon) throw ApiError.notFound('Coupon not found.');
  return sendOk(res, coupon, 'Coupon detail');
});

/**
 * POST /api/v1/coupons   (staff)
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  return sendCreated(res, coupon, 'Coupon created');
});

/**
 * PUT /api/v1/coupons/:id   (staff)
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw ApiError.notFound('Coupon not found.');
  return sendOk(res, coupon, 'Coupon updated');
});

/**
 * DELETE /api/v1/coupons/:id   (staff)
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found.');
  return sendOk(res, { id: req.params.id }, 'Coupon deleted');
});

/**
 * POST /api/v1/coupons/validate   (protected)
 * Body: { code, course_id? }
 * 200 → { valid, discount_type, discount_value }
 */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, course_id } = req.body;
  if (!code) throw ApiError.badRequest('Coupon code is required.');

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase() });
  if (!coupon || !coupon.isRedeemable()) {
    throw ApiError.badRequest('Coupon is invalid, expired, or fully redeemed.');
  }
  if (coupon.course_id && course_id && String(coupon.course_id) !== String(course_id)) {
    throw ApiError.badRequest('Coupon does not apply to this course.');
  }
  return sendOk(
    res,
    { valid: true, discount_type: coupon.discount_type, discount_value: coupon.discount_value },
    'Coupon is valid'
  );
});
