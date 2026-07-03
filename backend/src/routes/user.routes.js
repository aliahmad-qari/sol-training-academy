import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateMe,
  updateUser,
  deactivateUser,
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Self-service (declared before "/:id" so it isn't shadowed)
router.patch('/me', updateMe);

router.get('/', authorize('admin', 'team_member'), listUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', getUser);
router.patch('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deactivateUser);

export default router;
