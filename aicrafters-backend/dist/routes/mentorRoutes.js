"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mentorController_1 = require("../controllers/mentorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const mentorMiddleware_1 = require("../middleware/mentorMiddleware");
const multer_1 = __importDefault(require("multer"));
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
const router = express_1.default.Router();
/**
 * @route   GET /api/mentor/chat
 * @desc    Chat with the Adwina Mentor AI assistant (deprecated - use POST /ai/chat)
 * @access  Private (requires authentication)
 */
router.get('/chat', authMiddleware_1.authMiddleware, mentorController_1.mentorController.mentorAiChat);
/**
 * @route   GET /api/mentor/public/mentors
 * @desc    Get public list of mentors with filters
 * @access  Public
 */
router.get('/public/mentors', mentorController_1.mentorController.getPublicMentorList);
/**
 * @route   GET /api/mentor/public/:mentorId
 * @desc    Get public mentor profile by ID
 * @access  Public
 */
router.get('/public/:mentorId', mentorController_1.mentorController.getPublicMentorProfile);
/**
 * @route   POST /api/mentor/apply
 * @desc    Apply to become a mentor
 * @access  Public
 */
router.post('/apply', mentorController_1.mentorController.applyToBecomeMentor);
/**
 * @route   GET /api/mentor/profile
 * @desc    Get mentor profile
 * @access  Private (requires mentor authentication)
 */
router.get('/profile', authMiddleware_1.authMiddleware, mentorMiddleware_1.isMentor, mentorController_1.mentorController.getMentorProfile);
/**
 * @route   PUT /api/mentor/profile
 * @desc    Update mentor profile
 * @access  Private (requires mentor authentication)
 */
router.put('/profile', authMiddleware_1.authMiddleware, mentorMiddleware_1.isMentor, upload.single('profileImage'), mentorController_1.mentorController.updateMentorProfile);
/**
 * @route   GET /api/mentor/availability
 * @desc    Get mentor availability
 * @access  Private (requires mentor authentication)
 */
router.get('/availability', authMiddleware_1.authMiddleware, mentorMiddleware_1.isMentor, mentorController_1.mentorController.getMentorAvailability);
/**
 * @route   PUT /api/mentor/availability
 * @desc    Update mentor availability
 * @access  Private (requires mentor authentication)
 */
router.put('/availability', authMiddleware_1.authMiddleware, mentorMiddleware_1.isMentor, mentorController_1.mentorController.updateMentorAvailability);
/**
 * @route   GET /api/mentor/messages
 * @desc    Get all conversations for a mentor
 * @access  Private (requires mentor authentication)
 */
router.get('/messages', authMiddleware_1.authMiddleware, mentorMiddleware_1.isMentor, mentorController_1.mentorController.getMentorConversations);
/**
 * @route   GET /api/mentor/messages/:menteeId
 * @desc    Get messages with a specific mentee
 * @access  Private (requires mentor authentication)
 */
router.get('/messages/:menteeId', authMiddleware_1.authMiddleware, mentorMiddleware_1.isMentor, mentorController_1.mentorController.getMentorMenteeMessages);
/**
 * @route   POST /api/mentor/messages/:menteeId
 * @desc    Send a message to a mentee
 * @access  Private (requires mentor authentication)
 */
router.post('/messages/:menteeId', authMiddleware_1.authMiddleware, mentorMiddleware_1.isMentor, mentorController_1.mentorController.sendMenteeMessage);
/**
 * @route   GET /api/mentor/private/:mentorId
 * @desc    Get complete mentor profile by ID (includes experience and academic background)
 * @access  Private (requires authentication)
 */
router.get('/private/:mentorId', authMiddleware_1.authMiddleware, mentorController_1.mentorController.getCompleteMentorProfile);
// Mentor AI Service Routes
/**
 * @route   POST /api/mentor/ai/chat
 * @desc    Chat with AI Mentor
 * @access  Private (requires authentication)
 */
router.post('/ai/chat', authMiddleware_1.authMiddleware, mentorController_1.mentorController.mentorAiChat);
/**
 * @route   GET /api/mentor/ai/stats
 * @desc    Get mentor AI system statistics
 * @access  Private (requires authentication)
 */
router.get('/ai/stats', authMiddleware_1.authMiddleware, mentorController_1.mentorController.getMentorAiStats);
/**
 * @route   POST /api/mentor/ai/preload
 * @desc    Preload popular mentor content for performance
 * @access  Private (requires authentication)
 */
router.post('/ai/preload', authMiddleware_1.authMiddleware, mentorController_1.mentorController.preloadMentorContent);
/**
 * @route   DELETE /api/mentor/ai/cache
 * @desc    Clear mentor search cache
 * @access  Private (requires authentication)
 */
router.delete('/ai/cache', authMiddleware_1.authMiddleware, mentorController_1.mentorController.clearMentorCache);
/**
 * @route   DELETE /api/mentor/ai/threads/:userId
 * @desc    Clear mentor thread for user
 * @access  Private (requires authentication - own threads or admin)
 */
router.delete('/ai/threads/:userId', authMiddleware_1.authMiddleware, mentorController_1.mentorController.clearMentorThread);
exports.default = router;
