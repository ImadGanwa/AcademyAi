"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.MentorMessage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MentorMessageSchema = new mongoose_1.Schema({
    mentorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    menteeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: String,
        enum: ['mentor', 'mentee'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Create compound indexes for efficient queries
MentorMessageSchema.index({ mentorId: 1, menteeId: 1, createdAt: -1 });
MentorMessageSchema.index({ mentorId: 1, isRead: 1 });
MentorMessageSchema.index({ menteeId: 1, isRead: 1 });
// Static methods for common operations
MentorMessageSchema.statics.getConversation = function (mentorId, menteeId, limit = 50, skip = 0) {
    return this.find({
        mentorId,
        menteeId
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
};
MentorMessageSchema.statics.markAsRead = function (messageIds) {
    return this.updateMany({ _id: { $in: messageIds } }, { isRead: true });
};
MentorMessageSchema.statics.getUnreadCount = function (userId, isMentor) {
    const query = isMentor
        ? { mentorId: userId, sender: 'mentee', isRead: false }
        : { menteeId: userId, sender: 'mentor', isRead: false };
    return this.countDocuments(query);
};
// Get a list of all conversations for a mentor
MentorMessageSchema.statics.getMentorConversations = function (mentorId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find all unique mentees for this mentor
        const uniqueMentees = yield this.aggregate([
            { $match: { mentorId } },
            { $group: { _id: '$menteeId' } }
        ]);
        const menteeIds = uniqueMentees.map(item => item._id);
        // Get the latest message for each conversation and populate mentee info
        const conversations = yield Promise.all(menteeIds.map((menteeId) => __awaiter(this, void 0, void 0, function* () {
            const latestMessage = yield this.findOne({ mentorId, menteeId })
                .sort({ createdAt: -1 })
                .exec();
            const unreadCount = yield this.countDocuments({
                mentorId,
                menteeId,
                sender: 'mentee',
                isRead: false
            });
            const mentee = yield mongoose_1.default.model('User').findById(menteeId)
                .select('fullName profileImage')
                .exec();
            return {
                menteeId,
                mentee,
                latestMessage,
                unreadCount
            };
        })));
        // Sort by latest message date
        return conversations.sort((a, b) => {
            return new Date(b.latestMessage.createdAt).getTime() -
                new Date(a.latestMessage.createdAt).getTime();
        });
    });
};
// Get a list of all conversations for a mentee
MentorMessageSchema.statics.getMenteeConversations = function (menteeId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find all unique mentors for this mentee
        const uniqueMentors = yield this.aggregate([
            { $match: { menteeId } },
            { $group: { _id: '$mentorId' } }
        ]);
        const mentorIds = uniqueMentors.map(item => item._id);
        // Get the latest message for each conversation and populate mentor info
        const conversations = yield Promise.all(mentorIds.map((mentorId) => __awaiter(this, void 0, void 0, function* () {
            const latestMessage = yield this.findOne({ mentorId, menteeId })
                .sort({ createdAt: -1 })
                .exec();
            const unreadCount = yield this.countDocuments({
                mentorId,
                menteeId,
                sender: 'mentor',
                isRead: false
            });
            const mentor = yield mongoose_1.default.model('User').findById(mentorId)
                .select('fullName profileImage mentorProfile.title')
                .exec();
            return {
                mentorId,
                mentor,
                latestMessage,
                unreadCount
            };
        })));
        // Sort by latest message date
        return conversations.sort((a, b) => {
            return new Date(b.latestMessage.createdAt).getTime() -
                new Date(a.latestMessage.createdAt).getTime();
        });
    });
};
exports.MentorMessage = mongoose_1.default.model('MentorMessage', MentorMessageSchema);
