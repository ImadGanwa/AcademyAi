"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all notifications for the current user
router.get('/', auth_1.authMiddleware, notificationController_1.notificationController.getNotifications);
// Mark a notification as read
router.post('/:notificationId/read', auth_1.authMiddleware, notificationController_1.notificationController.markAsRead);
// Mark all notifications as read
router.post('/read-all', auth_1.authMiddleware, notificationController_1.notificationController.markAllAsRead);
// Delete a notification
router.delete('/:notificationId', auth_1.authMiddleware, notificationController_1.notificationController.deleteNotification);
exports.default = router;
