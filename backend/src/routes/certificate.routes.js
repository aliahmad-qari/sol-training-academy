import { Router } from 'express';
import {
  listCertificates,
  getCertificate,
  verifyCertificate,
  issue,
  revokeCertificate,
} from '../controllers/certificate.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

// Public verification
router.get('/verify/:code', verifyCertificate);

// Authenticated
router.get('/', protect, listCertificates);
router.post('/issue', protect, issue);
router.get('/:id', protect, getCertificate);
router.patch('/:id/revoke', protect, authorize('admin'), revokeCertificate);

export default router;
