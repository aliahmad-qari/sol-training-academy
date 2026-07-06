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
import { checkCourseAccess } from '../middleware/checkCourseAccess.js';

const router = Router();

// Enrollment-gated: only staff or students enrolled in the queried course may
// list its modules (see checkCourseAccess for the full access matrix).
router.get('/', optionalAuth, checkCourseAccess, listModules);
router.get('/:id', optionalAuth, getModule);

router.post('/', protect, authorize('admin', 'team_member'), createModule);
router.patch('/reorder', protect, authorize('admin', 'team_member'), reorderModules);
router.put('/:id', protect, authorize('admin', 'team_member'), updateModule);
router.delete('/:id', protect, authorize('admin', 'team_member'), deleteModule);

export default router;
