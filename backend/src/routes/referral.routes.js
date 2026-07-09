import { Router } from 'express';
import {
  listReferrals,
  createReferral,
  deleteReferral,
} from '../controllers/referral.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listReferrals);
router.post('/', createReferral);
router.delete('/:id', deleteReferral);

export default router;
