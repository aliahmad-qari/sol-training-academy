import { Router } from 'express';
import {
  listCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Any authenticated user can validate a code at checkout.
router.post('/validate', validateCoupon);

// Management is staff-only.
router.get('/', authorize('admin', 'team_member'), listCoupons);
router.post('/', authorize('admin', 'team_member'), createCoupon);
router.get('/:id', authorize('admin', 'team_member'), getCoupon);
router.put('/:id', authorize('admin', 'team_member'), updateCoupon);
router.delete('/:id', authorize('admin', 'team_member'), deleteCoupon);

export default router;
