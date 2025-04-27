import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

interface NotificationData {
  recipient: string;
  type: string;
  title: string;
  message: string;
  action?: string;
  relatedId?: string;
}

export const createNotification = async (data: NotificationData): Promise<void> => {
  try {
    const notification = new Notification({
      recipient: new mongoose.Types.ObjectId(data.recipient),
      type: data.type,
      title: data.title,
      message: data.message,
      action: data.action,
      relatedId: data.relatedId ? new mongoose.Types.ObjectId(data.relatedId) : undefined,
      read: false,
      createdAt: new Date()
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}; 