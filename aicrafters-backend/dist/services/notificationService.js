"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const User_1 = require("../models/User");
const Notification_1 = require("../models/Notification");
exports.notificationService = {
    /**
     * Send a notification to all admin users
     */
    notifyAdmins: (notification) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Find all admin users
            const admins = yield User_1.User.find({ role: 'admin', status: 'active' });
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
            yield Notification_1.Notification.insertMany(notifications);
            // TODO: In a real-world scenario, you might also want to:
            // 1. Send emails to admins
            // 2. Send push notifications
            // 3. Trigger real-time notifications via WebSockets
            console.log(`Sent notification to ${admins.length} admin(s): ${notification.title}`);
        }
        catch (error) {
            console.error('Error sending admin notifications:', error);
            throw error;
        }
    }),
    /**
     * Get unread notifications for a user
     */
    getUnreadNotifications: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield Notification_1.Notification.find({
                userId,
                isRead: false
            })
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (error) {
            console.error('Error getting unread notifications:', error);
            throw error;
        }
    }),
    /**
     * Mark notifications as read
     */
    markAsRead: (userId, notificationIds) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield Notification_1.Notification.updateMany({
                userId,
                _id: { $in: notificationIds }
            }, {
                isRead: true,
                readAt: new Date()
            });
        }
        catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    }),
    /**
     * Send notification about new booking to mentor
     */
    notifyMentorAboutNewBooking: (mentorId, menteeId, menteeName, bookingId, scheduledAt) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.error('Error sending notification to mentor about new booking:', error);
            // Continue execution even if notification fails
            return false;
        }
    }),
    /**
     * Send notification about booking cancellation to mentee
     */
    notifyMenteeAboutCancelledBooking: (menteeId, mentorId, mentorName, bookingId, scheduledAt, cancelReason) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.error('Error sending notification to mentee about cancelled booking:', error);
            // Continue execution even if notification fails
            return false;
        }
    }),
    /**
     * Send notification about completed session to mentee
     */
    notifyMenteeAboutCompletedSession: (menteeId, mentorId, mentorName, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.error('Error sending notification to mentee about completed session:', error);
            // Continue execution even if notification fails
            return false;
        }
    }),
    /**
     * Send notification about new message
     */
    notifyAboutNewMessage: (recipientId, senderId, senderName, messageId, conversationId, messagePreview) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.error('Error sending notification about new message:', error);
            // Continue execution even if notification fails
            return false;
        }
    })
};
