import { Router } from 'express';
import {
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '../controllers/module.controller.js';
import { protect, authorize, optionalAuth, authorizePage } from '../middleware/auth.js';
import { checkCourseAccess } from '../middleware/checkCourseAccess.js';

const router = Router();

// Enrollment-gated: only staff or students enrolled in the queried course may
// list its modules (see checkCourseAccess for the full access matrix).
router.get('/', optionalAuth, checkCourseAccess, listModules);
router.get('/:id', optionalAuth, getModule);

router.post('/', protect, authorize('admin', 'team_member'), authorizePage('modules', 'courses'), createModule);
router.patch('/reorder', protect, authorize('admin', 'team_member'), authorizePage('modules', 'courses'), reorderModules);
router.put('/:id', protect, authorize('admin', 'team_member'), authorizePage('modules', 'courses'), updateModule);
router.delete('/:id', protect, authorize('admin', 'team_member'), authorizePage('modules', 'courses'), deleteModule);

export default router;
