import { Router } from 'express';
import {
  listCertificates,
  getCertificate,
  verifyCertificate,
  issue,
  revokeCertificate,
} from '../controllers/certificate.controller.js';
import { protect, authorize, authorizePage } from '../middleware/auth.js';

const router = Router();

// Public verification
router.get('/verify/:code', verifyCertificate);

// Authenticated
router.get('/', protect, authorizePage('certificates'), listCertificates);
router.post('/issue', protect, authorizePage('certificates'), issue);
router.get('/:id', protect, authorizePage('certificates'), getCertificate);
router.patch('/:id/revoke', protect, authorize('admin'), revokeCertificate);

export default router;
