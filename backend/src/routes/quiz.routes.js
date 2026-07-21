import { Router } from 'express';
import {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startAttempt,
  submitAttempt,
  listMyAttempts,
  listAllAttempts,
} from '../controllers/quiz.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

// Attempts (declared before "/:id" so they aren't shadowed)
router.post('/attempts/start', startAttempt);
router.post('/attempts', submitAttempt);
router.get('/attempts/mine', listMyAttempts);
router.get('/attempts', authorize('admin', 'team_member'), authorizePage('gradebook', 'analytics'), listAllAttempts);

// Quizzes
router.get('/', listQuizzes);
router.post('/', authorize('admin', 'team_member'), authorizePage('quizzes'), createQuiz);
router.get('/:id', getQuiz);
router.put('/:id', authorize('admin', 'team_member'), authorizePage('quizzes'), updateQuiz);
router.delete('/:id', authorize('admin', 'team_member'), authorizePage('quizzes'), deleteQuiz);

export default router;
