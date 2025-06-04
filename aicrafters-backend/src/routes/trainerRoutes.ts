import express from 'express';
import { trainerController } from '../controllers/trainerController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/trainer/chat
 * @desc    Chat with the Trainer Coach
 * @access  Private (requires authentication)
 */
router.get('/chat', authMiddleware, trainerController.chat);

/**
 * @route   GET /api/trainer/users
 * @desc    Get users enrolled in trainer's courses
 * @access  Private (requires trainer authentication)
 */
router.get('/users', authMiddleware, trainerController.getUsers);

// Monitoring and management endpoints
router.get('/stats', authMiddleware, trainerController.getStats);
router.get('/health', trainerController.healthCheck); // No auth for health checks
router.post('/preload', authMiddleware, trainerController.preloadContent);
router.delete('/cache/:courseId', authMiddleware, trainerController.invalidateCache);

export default router; 