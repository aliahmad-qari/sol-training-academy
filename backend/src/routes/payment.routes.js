import { Router } from 'express';
import {
  createCheckout,
  verifyPayment,
  previewCoupon,
  listPayments,
  getPayment,
} from '../controllers/payment.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/checkout', createCheckout);
router.post('/verify', verifyPayment);
router.post('/preview-coupon', previewCoupon);
router.get('/', authorizePage('payments', 'revenue'), listPayments);
router.get('/:id', authorizePage('payments', 'revenue'), getPayment);

export default router;
