import { Router } from 'express';
import {
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '../controllers/module.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, listModules);
router.get('/:id', optionalAuth, getModule);

router.post('/', protect, authorize('admin', 'team_member'), createModule);
router.patch('/reorder', protect, authorize('admin', 'team_member'), reorderModules);
router.put('/:id', protect, authorize('admin', 'team_member'), updateModule);
router.delete('/:id', protect, authorize('admin', 'team_member'), deleteModule);

export default router;
