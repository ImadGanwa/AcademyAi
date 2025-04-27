import express from 'express';
import { authMiddleware as auth } from '../middleware/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controllers/notificationController';

const router = express.Router();

// Get all notifications
router.get('/', auth, getNotifications);

// Mark a notification as read
router.post('/:notificationId/read', auth, markNotificationAsRead);

// Mark all notifications as read
router.post('/read-all', auth, markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', auth, deleteNotification);

export default router; 