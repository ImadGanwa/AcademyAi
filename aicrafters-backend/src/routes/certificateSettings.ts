import express from 'express';
import { certificateSettingsController } from '../controllers/certificateSettingsController';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get certificate settings
router.get('/', authMiddleware, (req, res) => certificateSettingsController.getSettings(req, res));

// Update certificate template
router.post('/template', authMiddleware, upload.single('template'), (req, res) => 
  certificateSettingsController.updateTemplate(req, res)
);

export default router; 