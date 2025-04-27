import express from 'express';
import { notificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all notifications for the current user
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark a notification as read
router.post('/:notificationId/read', authMiddleware, notificationController.markAsRead);

// Mark all notifications as read
router.post('/read-all', authMiddleware, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

export default router; 