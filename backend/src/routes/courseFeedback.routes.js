import { Router } from 'express';
import {
  listFeedback,
  createFeedback,
  deleteFeedback,
} from '../controllers/courseFeedback.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listFeedback);
router.post('/', createFeedback);
router.delete('/:id', deleteFeedback);

export default router;
