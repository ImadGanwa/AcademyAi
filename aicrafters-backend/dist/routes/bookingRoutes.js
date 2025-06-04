"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const mentorMiddleware_1 = require("../middleware/mentorMiddleware");
const router = express_1.default.Router();
/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', authMiddleware_1.authMiddleware, bookingController_1.bookingController.createBooking);
/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the current user
 * @access  Private
 */
router.get('/', authMiddleware_1.authMiddleware, bookingController_1.bookingController.getUserBookings);
/**
 * @route   GET /api/bookings/availability/:mentorId
 * @desc    Get mentor's available time slots for a specific date
 * @access  Public
 */
router.get('/availability/:mentorId', bookingController_1.bookingController.getMentorPublicAvailability);
/**
 * @route   GET /api/bookings/mentor
 * @desc    Get all bookings for a mentor
 * @access  Private (requires mentor authentication)
 */
router.get('/mentor', authMiddleware_1.authMiddleware, mentorMiddleware_1.isApprovedMentor, bookingController_1.bookingController.getMentorBookings);
/**
 * @route   GET /api/bookings/mentor/:id
 * @desc    Get details for a specific booking (mentor view)
 * @access  Private (requires mentor authentication)
 */
router.get('/mentor/:id', authMiddleware_1.authMiddleware, mentorMiddleware_1.isApprovedMentor, bookingController_1.bookingController.getMentorBookingDetails);
/**
 * @route   PUT /api/bookings/mentor/:id
 * @desc    Update booking details (mentor only)
 * @access  Private (requires mentor authentication)
 */
router.put('/mentor/:id', authMiddleware_1.authMiddleware, mentorMiddleware_1.isApprovedMentor, bookingController_1.bookingController.updateBooking);
/**
 * @route   POST /api/bookings/mentor/:id/complete
 * @desc    Mark a booking as completed (mentor only)
 * @access  Private (requires mentor authentication)
 */
router.post('/mentor/:id/complete', authMiddleware_1.authMiddleware, mentorMiddleware_1.isApprovedMentor, bookingController_1.bookingController.completeBooking);
/**
 * @route   POST /api/bookings/mentor/:id/cancel
 * @desc    Cancel a booking (mentor view)
 * @access  Private (requires mentor authentication)
 */
router.post('/mentor/:id/cancel', authMiddleware_1.authMiddleware, mentorMiddleware_1.isApprovedMentor, bookingController_1.bookingController.cancelMentorBooking);
/**
 * @route   GET /api/bookings/:id
 * @desc    Get details for a specific booking
 * @access  Private
 */
router.get('/:id', authMiddleware_1.authMiddleware, bookingController_1.bookingController.getBookingDetails);
/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.post('/:id/cancel', authMiddleware_1.authMiddleware, bookingController_1.bookingController.cancelBooking);
/**
 * @route   POST /api/bookings/:id/review
 * @desc    Rate and review a completed session
 * @access  Private
 */
router.post('/:id/review', authMiddleware_1.authMiddleware, bookingController_1.bookingController.rateBooking);
exports.default = router;
