import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { RequestWithUser } from '../types/express';

interface CreateNotificationParams {
  recipient: string;
  type: 'user' | 'course' | 'assignment' | 'review' | 'completion';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  relatedId?: string;
}

export const createNotification = async (params: CreateNotificationParams): Promise<any> => {
  try {
    const notification = new Notification({
      ...params,
      read: false,
      createdAt: new Date()
    });
    return await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Export individual functions for direct import
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { filter } = req.query;
    let query: any = { recipient: user.id };

    // Add filter for unread/read notifications
    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'read') {
      query.read = true;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: user.id,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: user.id
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    notification.read = true;
    await notification.save();

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      recipient: user.id,
      read: false
    });

    res.json({
      notification,
      unreadCount
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    await Notification.updateMany(
      { recipient: user.id, read: false },
      { read: true }
    );

    res.json({
      message: 'All notifications marked as read',
      unreadCount: 0
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as RequestWithUser).user;
    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: user.id
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      recipient: user.id,
      read: false
    });

    res.json({
      message: 'Notification deleted successfully',
      unreadCount
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Also export as a controller object for backward compatibility
export const notificationController = {
  getNotifications,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
  deleteNotification
}; 