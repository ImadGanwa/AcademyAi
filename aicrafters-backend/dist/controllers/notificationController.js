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
exports.notificationController = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getNotifications = exports.createNotification = void 0;
const Notification_1 = require("../models/Notification");
const createNotification = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = new Notification_1.Notification(Object.assign(Object.assign({}, params), { read: false, createdAt: new Date() }));
        return yield notification.save();
    }
    catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
});
exports.createNotification = createNotification;
// Export individual functions for direct import
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        const { filter } = req.query;
        let query = { recipient: user.id };
        // Add filter for unread/read notifications
        if (filter === 'unread') {
            query.read = false;
        }
        else if (filter === 'read') {
            query.read = true;
        }
        const notifications = yield Notification_1.Notification.find(query)
            .sort({ createdAt: -1 });
        // Get unread count
        const unreadCount = yield Notification_1.Notification.countDocuments({
            recipient: user.id,
            read: false
        });
        res.json({
            notifications,
            unreadCount
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});
exports.getNotifications = getNotifications;
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        const { notificationId } = req.params;
        const notification = yield Notification_1.Notification.findOne({
            _id: notificationId,
            recipient: user.id
        });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        notification.read = true;
        yield notification.save();
        // Get updated unread count
        const unreadCount = yield Notification_1.Notification.countDocuments({
            recipient: user.id,
            read: false
        });
        res.json({
            notification,
            unreadCount
        });
    }
    catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        yield Notification_1.Notification.updateMany({ recipient: user.id, read: false }, { read: true });
        res.json({
            message: 'All notifications marked as read',
            unreadCount: 0
        });
    }
    catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ message: 'Error marking all notifications as read' });
    }
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        const { notificationId } = req.params;
        const notification = yield Notification_1.Notification.findOneAndDelete({
            _id: notificationId,
            recipient: user.id
        });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        // Get updated unread count
        const unreadCount = yield Notification_1.Notification.countDocuments({
            recipient: user.id,
            read: false
        });
        res.json({
            message: 'Notification deleted successfully',
            unreadCount
        });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
});
exports.deleteNotification = deleteNotification;
// Also export as a controller object for backward compatibility
exports.notificationController = {
    getNotifications: exports.getNotifications,
    markAsRead: exports.markNotificationAsRead,
    markAllAsRead: exports.markAllNotificationsAsRead,
    deleteNotification: exports.deleteNotification
};
