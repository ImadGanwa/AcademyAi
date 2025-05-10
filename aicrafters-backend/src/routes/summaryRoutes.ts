import express from 'express';
import { summaryController } from '../controllers/summaryController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Generate summaries for a course
router.post('/courses/:courseId/generate', authMiddleware, summaryController.processCourseForSummaries);

// Get summaries for a specific video
router.get('/courses/:courseId/videos/:videoUrl', authMiddleware, summaryController.getVideoSummary);

export default router; 