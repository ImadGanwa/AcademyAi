import express from 'express';
import { mentorController } from '../controllers/mentorController';
import { authMiddleware } from '../middleware/authMiddleware';
import { isMentor, isApprovedMentor, hasMentorApplication } from '../middleware/mentorMiddleware';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

/**
 * @route   GET /api/mentor/chat
 * @desc    Chat with the Adwina Mentor AI assistant (deprecated - use POST /ai/chat)
 * @access  Private (requires authentication)
 */
router.get('/chat', authMiddleware, mentorController.mentorAiChat);

/**
 * @route   GET /api/mentor/public/mentors
 * @desc    Get public list of mentors with filters
 * @access  Public
 */
router.get('/public/mentors', mentorController.getPublicMentorList);

/**
 * @route   GET /api/mentor/public/:mentorId
 * @desc    Get public mentor profile by ID
 * @access  Public
 */
router.get('/public/:mentorId', mentorController.getPublicMentorProfile);

/**
 * @route   POST /api/mentor/apply
 * @desc    Apply to become a mentor
 * @access  Public
 */
router.post('/apply', mentorController.applyToBecomeMentor);

/**
 * @route   GET /api/mentor/profile
 * @desc    Get mentor profile
 * @access  Private (requires mentor authentication)
 */
router.get('/profile', authMiddleware, isMentor, mentorController.getMentorProfile);

/**
 * @route   PUT /api/mentor/profile
 * @desc    Update mentor profile
 * @access  Private (requires mentor authentication)
 */
router.put('/profile', authMiddleware, isMentor, upload.single('profileImage'), mentorController.updateMentorProfile);

/**
 * @route   GET /api/mentor/availability
 * @desc    Get mentor availability
 * @access  Private (requires mentor authentication)
 */
router.get('/availability', authMiddleware, isMentor, mentorController.getMentorAvailability);

/**
 * @route   PUT /api/mentor/availability
 * @desc    Update mentor availability
 * @access  Private (requires mentor authentication)
 */
router.put('/availability', authMiddleware, isMentor, mentorController.updateMentorAvailability);

/**
 * @route   GET /api/mentor/messages
 * @desc    Get all conversations for a mentor
 * @access  Private (requires mentor authentication)
 */
router.get('/messages', authMiddleware, isMentor, mentorController.getMentorConversations);

/**
 * @route   GET /api/mentor/messages/:menteeId
 * @desc    Get messages with a specific mentee
 * @access  Private (requires mentor authentication)
 */
router.get('/messages/:menteeId', authMiddleware, isMentor, mentorController.getMentorMenteeMessages);

/**
 * @route   POST /api/mentor/messages/:menteeId
 * @desc    Send a message to a mentee
 * @access  Private (requires mentor authentication)
 */
router.post('/messages/:menteeId', authMiddleware, isMentor, mentorController.sendMenteeMessage);

/**
 * @route   GET /api/mentor/private/:mentorId
 * @desc    Get complete mentor profile by ID (includes experience and academic background)
 * @access  Private (requires authentication)
 */
router.get('/private/:mentorId', authMiddleware, mentorController.getCompleteMentorProfile);

// Mentor AI Service Routes
/**
 * @route   POST /api/mentor/ai/chat
 * @desc    Chat with AI Mentor
 * @access  Private (requires authentication)
 */
router.post('/ai/chat', authMiddleware, mentorController.mentorAiChat);

/**
 * @route   GET /api/mentor/ai/stats
 * @desc    Get mentor AI system statistics
 * @access  Private (requires authentication)
 */
router.get('/ai/stats', authMiddleware, mentorController.getMentorAiStats);

/**
 * @route   POST /api/mentor/ai/preload
 * @desc    Preload popular mentor content for performance
 * @access  Private (requires authentication)
 */
router.post('/ai/preload', authMiddleware, mentorController.preloadMentorContent);

/**
 * @route   DELETE /api/mentor/ai/cache
 * @desc    Clear mentor search cache
 * @access  Private (requires authentication)
 */
router.delete('/ai/cache', authMiddleware, mentorController.clearMentorCache);

/**
 * @route   DELETE /api/mentor/ai/threads/:userId
 * @desc    Clear mentor thread for user
 * @access  Private (requires authentication - own threads or admin)
 */
router.delete('/ai/threads/:userId', authMiddleware, mentorController.clearMentorThread);

export default router; 