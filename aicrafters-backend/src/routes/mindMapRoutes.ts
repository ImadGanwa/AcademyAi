import express from 'express';
import { MindMapController } from '../controllers/mindMapController';
import { authMiddleware } from '../middleware/auth'; // Import auth middleware

const router = express.Router();

// --- Mind Map Routes ---

// GET /api/mindmaps/courses/:courseId/videos/:videoUrl
// Generates and returns a mind map in Markmap markdown format for a specific video
// Requires authentication
router.get(
    '/courses/:courseId/videos/:videoUrl',
    authMiddleware, // Apply authentication middleware
    MindMapController.generateMindMapForVideo
);

// Add other mind map related routes here if needed
// e.g., router.get('/courses/:courseId/sections/:sectionId', ...)

export default router; 