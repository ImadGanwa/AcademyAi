"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authMiddleware);
// Get all conversations
router.get('/conversations', messageController_1.messageController.getConversations);
// Get messages for a specific conversation
router.get('/:userId', messageController_1.messageController.getMessages);
// Send a new message
router.post('/send', messageController_1.messageController.sendMessage);
// Mark messages as read
router.put('/:userId/read', messageController_1.messageController.markAsRead);
exports.default = router;
