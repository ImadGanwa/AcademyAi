"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
// Get all notifications
router.get('/', auth_1.authMiddleware, notificationController_1.getNotifications);
// Mark a notification as read
router.post('/:notificationId/read', auth_1.authMiddleware, notificationController_1.markNotificationAsRead);
// Mark all notifications as read
router.post('/read-all', auth_1.authMiddleware, notificationController_1.markAllNotificationsAsRead);
// Delete a notification
router.delete('/:notificationId', auth_1.authMiddleware, notificationController_1.deleteNotification);
exports.default = router;
