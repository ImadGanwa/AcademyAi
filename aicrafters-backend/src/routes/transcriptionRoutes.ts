import express from 'express';
import { transcriptionController } from '../controllers/transcriptionController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Process all videos in a course for transcription
router.post('/courses/:courseId', authMiddleware, transcriptionController.processCourseVideos);

// Get transcription for a specific video
router.get('/courses/:courseId/videos/:videoUrl', authMiddleware, transcriptionController.getTranscription);

// Update transcription for a specific video
router.put('/courses/:courseId/videos/:videoUrl', authMiddleware, transcriptionController.updateTranscription);

export default router; 