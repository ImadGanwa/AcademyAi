import express from 'express';
import { messageController } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get messages for a specific conversation
router.get('/:userId', messageController.getMessages);

// Send a new message
router.post('/send', messageController.sendMessage);

// Mark messages as read
router.put('/:userId/read', messageController.markAsRead);

export default router; 