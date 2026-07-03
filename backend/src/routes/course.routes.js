import { Router } from 'express';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
} from '../controllers/course.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public (optionalAuth lets staff see unpublished courses)
router.get('/', optionalAuth, listCourses);
router.get('/:id', optionalAuth, getCourse);

// Staff-only writes
router.post('/', protect, authorize('admin', 'team_member'), createCourse);
router.put('/:id', protect, authorize('admin', 'team_member'), updateCourse);
router.patch('/:id/publish', protect, authorize('admin', 'team_member'), togglePublish);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

export default router;
