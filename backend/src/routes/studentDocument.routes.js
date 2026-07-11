import { Router } from 'express';
import {
  createMyDocument,
  deleteDocument,
  listDocuments,
  listMyDocuments,
  updateDocument,
} from '../controllers/studentDocument.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/mine', listMyDocuments);
router.post('/', createMyDocument);
router.get('/', authorize('admin', 'team_member'), listDocuments);
router.patch('/:id', authorize('admin', 'team_member'), updateDocument);
router.delete('/:id', deleteDocument);

export default router;
