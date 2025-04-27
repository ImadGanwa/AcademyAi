import express from 'express';
import { certificateController } from '../controllers/certificateController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Generate certificate for a course
router.get('/:courseId', authMiddleware, (req, res) => certificateController.generateCertificate(req, res));

// Get certificate image URL
router.get('/:courseId/image', authMiddleware, (req, res) => certificateController.getCertificateImage(req, res));

export default router; 