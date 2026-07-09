import { Router } from 'express';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/studentGoal.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
