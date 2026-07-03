import { Router } from 'express';
import {
  createCheckout,
  verifyPayment,
  previewCoupon,
  listPayments,
  getPayment,
} from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/checkout', createCheckout);
router.post('/verify', verifyPayment);
router.post('/preview-coupon', previewCoupon);
router.get('/', listPayments);
router.get('/:id', getPayment);

export default router;
