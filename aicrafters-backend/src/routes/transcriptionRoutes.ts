import express from 'express';
import { transcriptionController } from '../controllers/transcriptionController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Process all videos in a course
router.post('/courses/:courseId/process', authMiddleware, transcriptionController.processCourseVideos);

// Get transcription for a specific video
router.get('/courses/:courseId/videos/:videoUrl', authMiddleware, transcriptionController.getTranscription);

export default router; 