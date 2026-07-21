import { Router } from 'express';
import {
  listReferrals,
  createReferral,
  deleteReferral,
} from '../controllers/referral.controller.js';
import { protect, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', authorizePage('referrals'), listReferrals);
router.post('/', createReferral);
router.delete('/:id', authorizePage('referrals'), deleteReferral);

export default router;
