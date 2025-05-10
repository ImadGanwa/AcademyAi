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

export default router; 