import { Router } from 'express';
import {
  createMyDocument,
  deleteDocument,
  listDocuments,
  listMyDocuments,
  updateDocument,
} from '../controllers/studentDocument.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/mine', listMyDocuments);
router.post('/', createMyDocument);
router.get('/', authorize('admin', 'team_member'), authorizePage('documents'), listDocuments);
router.patch('/:id', authorize('admin', 'team_member'), authorizePage('documents'), updateDocument);
router.delete('/:id', authorizePage('documents'), deleteDocument);

export default router;
