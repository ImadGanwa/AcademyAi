import { User } from '../models/User';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

interface AdminNotification {
  title: string;
  message: string;
  type: string;
  data?: any;
}

export const notificationService = {
  /**
   * Send a notification to all admin users
   */
  notifyAdmins: async (notification: AdminNotification): Promise<void> => {
    try {
      // Find all admin users
      const admins = await User.find({ role: 'admin', status: 'active' });
      
      if (!admins || admins.length === 0) {
        console.warn('No active admin users found to notify');
        return;
      }
      
      // Create notification entries for each admin
      const notifications = admins.map(admin => ({
        userId: admin._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data || {},
        isRead: false
      }));
      
      // Insert all notifications
      await Notification.insertMany(notifications);
      
      // TODO: In a real-world scenario, you might also want to:
      // 1. Send emails to admins
      // 2. Send push notifications
      // 3. Trigger real-time notifications via WebSockets
      
      console.log(`Sent notification to ${admins.length} admin(s): ${notification.title}`);
    } catch (error) {
      console.error('Error sending admin notifications:', error);
      throw error;
    }
  },
  
  /**
   * Get unread notifications for a user
   */
  getUnreadNotifications: async (userId: mongoose.Types.ObjectId): Promise<any[]> => {
    try {
      return await Notification.find({
        userId,
        isRead: false
      })
      .sort({ createdAt: -1 })
      .exec();
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  },
  
  /**
   * Mark notifications as read
   */
  markAsRead: async (
    userId: mongoose.Types.ObjectId,
    notificationIds: mongoose.Types.ObjectId[]
  ): Promise<void> => {
    try {
      await Notification.updateMany(
        {
          userId,
          _id: { $in: notificationIds }
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },

  /**
   * Send notification about new booking to mentor
   */
  notifyMentorAboutNewBooking: async (
    mentorId: string,
    menteeId: string,
    menteeName: string,
    bookingId: string,
    scheduledAt: Date
  ): Promise<boolean> => {
    try {
      // Create notification
      const notification = {
        userId: mentorId,
        title: 'New Booking',
        message: `${menteeName} has booked a mentoring session with you on ${scheduledAt.toLocaleString()}`,
        type: 'booking_new',
        data: {
          bookingId,
          menteeId,
          scheduledAt
        },
        read: false,
        createdAt: new Date()
      };

      // Save notification to database
      // This implementation will depend on your notification system
      // await Notification.create(notification);

      // Send email notification if enabled
      // This implementation will depend on your email service
      // await sendEmail(mentorEmail, 'New Booking', emailTemplate);

      return true;
    } catch (error) {
      console.error('Error sending notification to mentor about new booking:', error);
      // Continue execution even if notification fails
      return false;
    }
  },

  /**
   * Send notification about booking cancellation to mentee
   */
  notifyMenteeAboutCancelledBooking: async (
    menteeId: string,
    mentorId: string,
    mentorName: string,
    bookingId: string,
    scheduledAt: Date,
    cancelReason: string
  ): Promise<boolean> => {
    try {
      // Create notification
      const notification = {
        userId: menteeId,
        title: 'Booking Cancelled',
        message: `${mentorName} has cancelled your mentoring session scheduled for ${scheduledAt.toLocaleString()}. Reason: ${cancelReason}`,
        type: 'booking_cancelled',
        data: {
          bookingId,
          mentorId,
          scheduledAt,
          cancelReason
        },
        read: false,
        createdAt: new Date()
      };

      // Save notification to database
      // This implementation will depend on your notification system
      // await Notification.create(notification);

      // Send email notification if enabled
      // This implementation will depend on your email service
      // await sendEmail(menteeEmail, 'Booking Cancelled', emailTemplate);

      return true;
    } catch (error) {
      console.error('Error sending notification to mentee about cancelled booking:', error);
      // Continue execution even if notification fails
      return false;
    }
  },

  /**
   * Send notification about completed session to mentee
   */
  notifyMenteeAboutCompletedSession: async (
    menteeId: string,
    mentorId: string,
    mentorName: string,
    bookingId: string
  ): Promise<boolean> => {
    try {
      // Create notification
      const notification = {
        userId: menteeId,
        title: 'Session Completed',
        message: `${mentorName} has marked your mentoring session as completed. Please provide feedback.`,
        type: 'session_completed',
        data: {
          bookingId,
          mentorId
        },
        read: false,
        createdAt: new Date()
      };

      // Save notification to database
      // This implementation will depend on your notification system
      // await Notification.create(notification);

      // Send email notification if enabled
      // This implementation will depend on your email service
      // await sendEmail(menteeEmail, 'Session Completed', emailTemplate);

      return true;
    } catch (error) {
      console.error('Error sending notification to mentee about completed session:', error);
      // Continue execution even if notification fails
      return false;
    }
  },

  /**
   * Send notification about new message
   */
  notifyAboutNewMessage: async (
    recipientId: string,
    senderId: string,
    senderName: string,
    messageId: string,
    conversationId: string,
    messagePreview: string
  ): Promise<boolean> => {
    try {
      // Create notification
      const notification = {
        userId: recipientId,
        title: 'New Message',
        message: `${senderName}: ${messagePreview.length > 50 ? messagePreview.substring(0, 47) + '...' : messagePreview}`,
        type: 'new_message',
        data: {
          messageId,
          senderId,
          conversationId
        },
        read: false,
        createdAt: new Date()
      };

      // Save notification to database
      // This implementation will depend on your notification system
      // await Notification.create(notification);

      // Send email notification if enabled (perhaps only if user has been inactive)
      // This implementation will depend on your email service
      // await sendEmail(recipientEmail, 'New Message', emailTemplate);

      return true;
    } catch (error) {
      console.error('Error sending notification about new message:', error);
      // Continue execution even if notification fails
      return false;
    }
  }
}; 