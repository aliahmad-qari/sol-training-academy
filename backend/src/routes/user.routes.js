import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateMe,
  updateUser,
  deactivateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Self-service (declared before "/:id" so it isn't shadowed)
router.patch('/me', updateMe);

router.get('/', authorize('admin', 'team_member'), authorizePage('students'), listUsers);
router.post('/', authorize('admin', 'team_member'), authorizePage('students'), createUser);
router.get('/:id', getUser);
router.patch('/:id', authorize('admin'), updateUser);
router.patch('/:id/deactivate', authorize('admin'), deactivateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
