import express from 'express';
import { bookingController } from '../controllers/bookingController';
import { authMiddleware } from '../middleware/authMiddleware';
import { isMentor, isApprovedMentor } from '../middleware/mentorMiddleware';

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', authMiddleware, bookingController.createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the current user
 * @access  Private
 */
router.get('/', authMiddleware, bookingController.getUserBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get details for a specific booking
 * @access  Private
 */
router.get('/:id', authMiddleware, bookingController.getBookingDetails);

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);

/**
 * @route   POST /api/bookings/:id/review
 * @desc    Rate and review a completed session
 * @access  Private
 */
router.post('/:id/review', authMiddleware, bookingController.rateBooking);

/**
 * @route   GET /api/bookings/mentor
 * @desc    Get all bookings for a mentor
 * @access  Private (requires mentor authentication)
 */
router.get('/mentor', authMiddleware, isApprovedMentor, bookingController.getMentorBookings);

/**
 * @route   GET /api/bookings/mentor/:id
 * @desc    Get details for a specific booking (mentor view)
 * @access  Private (requires mentor authentication)
 */
router.get('/mentor/:id', authMiddleware, isApprovedMentor, bookingController.getMentorBookingDetails);

/**
 * @route   PUT /api/bookings/mentor/:id
 * @desc    Update booking details (mentor only)
 * @access  Private (requires mentor authentication)
 */
router.put('/mentor/:id', authMiddleware, isApprovedMentor, bookingController.updateBooking);

/**
 * @route   POST /api/bookings/mentor/:id/complete
 * @desc    Mark a booking as completed (mentor only)
 * @access  Private (requires mentor authentication)
 */
router.post('/mentor/:id/complete', authMiddleware, isApprovedMentor, bookingController.completeBooking);

/**
 * @route   POST /api/bookings/mentor/:id/cancel
 * @desc    Cancel a booking (mentor view)
 * @access  Private (requires mentor authentication)
 */
router.post('/mentor/:id/cancel', authMiddleware, isApprovedMentor, bookingController.cancelMentorBooking);

/**
 * @route   GET /api/bookings/availability/:mentorId
 * @desc    Get mentor's available time slots for a specific date
 * @access  Public
 */
router.get('/availability/:mentorId', bookingController.getMentorPublicAvailability);

export default router; 