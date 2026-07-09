import { Router } from 'express';
import {
  listPosts,
  listPostsByCourse,
  createPost,
  toggleLike,
  deletePost,
} from '../controllers/discussion.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listPosts);
router.post('/', createPost);
router.patch('/:id/like', toggleLike);
router.delete('/:id', deletePost);
// Keep the param route last so it does not shadow the literal routes above.
router.get('/:courseId', listPostsByCourse);

export default router;
