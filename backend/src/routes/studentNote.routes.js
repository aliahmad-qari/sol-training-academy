import { Router } from 'express';
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/studentNote.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
