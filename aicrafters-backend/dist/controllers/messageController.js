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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
exports.messageController = {
    // Get all conversations for the current user
    getConversations: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            // Find all messages where user is either sender or receiver
            const messages = yield Message_1.Message.aggregate([
                {
                    $match: {
                        $or: [
                            { sender: new mongoose_1.default.Types.ObjectId(req.user._id) },
                            { receiver: new mongoose_1.default.Types.ObjectId(req.user._id) }
                        ]
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $group: {
                        _id: '$conversationId',
                        lastMessage: { $first: '$$ROOT' },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$receiver', new mongoose_1.default.Types.ObjectId(req.user._id)] },
                                            { $eq: ['$read', false] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);
            // Get user details for each conversation
            const conversations = yield Promise.all(messages.map((msg) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const otherUserId = msg.lastMessage.sender.equals((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)
                    ? msg.lastMessage.receiver
                    : msg.lastMessage.sender;
                const otherUser = yield User_1.User.findById(otherUserId).select('fullName email status lastActive');
                return {
                    id: msg._id,
                    user: otherUser,
                    lastMessage: {
                        content: msg.lastMessage.content,
                        createdAt: msg.lastMessage.createdAt,
                        sender: msg.lastMessage.sender,
                        read: msg.lastMessage.read
                    },
                    unreadCount: msg.unreadCount
                };
            })));
            res.json(conversations);
        }
        catch (error) {
            console.error('Get conversations error:', error);
            res.status(500).json({ message: 'Error fetching conversations' });
        }
    }),
    // Get messages for a specific conversation
    getMessages: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const { userId } = req.params;
            // Create conversationId
            const ids = [req.user._id.toString(), userId].sort();
            const conversationId = ids.join('_');
            // Get messages and mark them as read
            const messages = yield Message_1.Message.find({ conversationId })
                .sort({ createdAt: 1 });
            // Mark unread messages as read
            yield Message_1.Message.updateMany({
                conversationId,
                receiver: req.user._id,
                read: false
            }, { $set: { read: true } });
            res.json(messages);
        }
        catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({ message: 'Error fetching messages' });
        }
    }),
    // Send a new message
    sendMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const { receiverId, content } = req.body;
            if (!(content === null || content === void 0 ? void 0 : content.trim())) {
                return res.status(400).json({ message: 'Message content is required' });
            }
            // Check if receiver exists
            const receiver = yield User_1.User.findById(receiverId);
            if (!receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }
            // Create conversationId by sorting and joining user IDs
            const ids = [req.user._id.toString(), receiverId].sort();
            const conversationId = ids.join('_');
            // Create and save the message
            const message = new Message_1.Message({
                sender: req.user._id,
                receiver: receiverId,
                content: content.trim(),
                conversationId
            });
            yield message.save();
            res.json(message);
        }
        catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ message: 'Error sending message' });
        }
    }),
    // Mark messages as read
    markAsRead: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const { userId } = req.params;
            // Create conversationId
            const ids = [req.user._id.toString(), userId].sort();
            const conversationId = ids.join('_');
            // Mark all messages in the conversation as read
            yield Message_1.Message.updateMany({
                conversationId,
                receiver: req.user._id,
                read: false
            }, { $set: { read: true } });
            res.json({ message: 'Messages marked as read' });
        }
        catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({ message: 'Error marking messages as read' });
        }
    })
};
