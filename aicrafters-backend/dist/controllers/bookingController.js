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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MentorshipBooking_1 = require("../models/MentorshipBooking");
const User_1 = require("../models/User");
const email_1 = require("../utils/email");
const googleMeet_1 = require("../utils/googleMeet");
// Helper function to get the Monday of a week for a given date
const getMondayOfWeek = (date) => {
    const dateObj = new Date(date);
    const day = dateObj.getDay() || 7; // Convert Sunday (0) to 7
    const diff = dateObj.getDate() - day + 1; // 1 = Monday
    const mondayDate = new Date(dateObj);
    mondayDate.setDate(diff);
    // Format as YYYY-MM-DD
    return mondayDate.toISOString().split('T')[0];
};
exports.bookingController = {
    /**
     * Create a new booking
     * @route POST /api/bookings
     */
    createBooking: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const menteeId = req.user._id;
            const { mentorId, date, startTime, endTime, topic, message } = req.body;
            // Validate required fields
            if (!mentorId || !date || !startTime || !endTime || !topic) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields: mentorId, date, startTime, endTime, and topic are required'
                });
                return;
            }
            // Validate mentor ID
            if (!mongoose_1.default.Types.ObjectId.isValid(mentorId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid mentor ID format'
                });
                return;
            }
            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid date format. Use YYYY-MM-DD'
                });
                return;
            }
            // Validate time format (HH:MM)
            if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime) ||
                !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid time format. Use HH:MM (24-hour format)'
                });
                return;
            }
            // Ensure end time is after start time
            if (startTime >= endTime) {
                res.status(400).json({
                    success: false,
                    error: 'End time must be after start time'
                });
                return;
            }
            // Get mentor profile
            const mentor = yield User_1.User.findOne({
                _id: mentorId,
                role: 'mentor',
                'mentorProfile.isVerified': true
            }).select('fullName mentorProfile.hourlyRate mentorProfile.availability');
            if (!mentor) {
                res.status(404).json({
                    success: false,
                    error: 'Mentor not found or not verified'
                });
                return;
            }
            // Calculate scheduled date and time
            const scheduledAt = new Date(`${date}T${startTime}:00`);
            // Check if the selected date is in the past
            const now = new Date();
            if (scheduledAt <= now) {
                res.status(400).json({
                    success: false,
                    error: 'Cannot schedule a session in the past'
                });
                return;
            }
            // Get day of week (0 = Sunday, 1 = Monday, etc.)
            const dayOfWeek = scheduledAt.getDay();
            // Calculate the Monday of the week using our helper function
            const weekKey = getMondayOfWeek(date);
            console.log(`Checking availability for date: ${date}, day of week: ${dayOfWeek}, week key: ${weekKey}`);
            // Check if the mentor has availability for this time slot
            const availability = (((_a = mentor.mentorProfile) === null || _a === void 0 ? void 0 : _a.availability) || []);
            // DEBUG: Print all availability slots
            console.log('All availability slots:', JSON.stringify(availability));
            // First try to find a specific slot for this week
            let availabilitySlot = availability.find(slot => {
                console.log(`Comparing slot day=${slot.day} weekKey=${slot.weekKey} with dayOfWeek=${dayOfWeek} weekKey=${weekKey}`);
                return slot.day === dayOfWeek &&
                    slot.startTime <= startTime &&
                    slot.endTime >= endTime &&
                    slot.weekKey === weekKey;
            });
            // If no specific week slot found, try to find a recurring slot
            if (!availabilitySlot) {
                availabilitySlot = availability.find(slot => slot.day === dayOfWeek &&
                    slot.startTime <= startTime &&
                    slot.endTime >= endTime &&
                    !slot.weekKey);
            }
            if (!availabilitySlot) {
                res.status(400).json({
                    success: false,
                    error: 'Mentor is not available at the selected time'
                });
                return;
            }
            // Calculate duration in minutes
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            const duration = endTotalMinutes - startTotalMinutes;
            // Check for scheduling conflicts
            const hasConflict = yield MentorshipBooking_1.MentorshipBooking.checkForConflicts(new mongoose_1.default.Types.ObjectId(mentorId), scheduledAt, duration);
            if (hasConflict) {
                res.status(409).json({
                    success: false,
                    error: 'This time slot is already booked. Please select a different time.'
                });
                return;
            }
            // Calculate price (hourly rate * duration in hours)
            const hourlyRate = ((_b = mentor.mentorProfile) === null || _b === void 0 ? void 0 : _b.hourlyRate) || 0;
            const price = hourlyRate * (duration / 60);
            // Create a unique identifier for this availability slot if it doesn't have one
            const availabilityId = availabilitySlot.id ||
                `${dayOfWeek}-${startTime}-${endTime}-${availabilitySlot.weekKey || 'recurring'}`;
            // Create the booking with 'pending' status (default) - this immediately reserves the slot
            const booking = new MentorshipBooking_1.MentorshipBooking({
                mentorId,
                menteeId,
                scheduledAt,
                duration,
                topic,
                price,
                status: 'pending', // Explicitly set to pending to reserve the slot immediately
                mentorAvailabilityId: availabilityId, // Store the availability slot ID
                notes: {
                    menteeNotes: message || ''
                }
            });
            // Save to database - this immediately makes the slot unavailable to others
            yield booking.save();
            // Populate mentor details for response
            const populatedBooking = yield MentorshipBooking_1.MentorshipBooking.findById(booking._id)
                .populate('mentorId', 'fullName email profileImage')
                .populate('menteeId', 'fullName email')
                .exec();
            // Send email notifications
            try {
                const mentorData = populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking.mentorId;
                const menteeData = populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking.menteeId;
                const bookingDate = scheduledAt.toISOString().split('T')[0]; // Get YYYY-MM-DD format
                // Send notification to mentor
                yield (0, email_1.sendMentorBookingNotificationEmail)(mentorData.email, mentorData.fullName, menteeData.fullName, ((_c = populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking._id) === null || _c === void 0 ? void 0 : _c.toString()) || '', topic, bookingDate, startTime, endTime);
                // Send confirmation to mentee - use regular booking confirmation
                yield (0, email_1.sendMenteeBookingConfirmationEmail)(menteeData.email, menteeData.fullName, mentorData.fullName, ((_d = populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking._id) === null || _d === void 0 ? void 0 : _d.toString()) || '', topic, bookingDate, startTime, endTime, price);
            }
            catch (emailError) {
                console.error('Error sending booking notification emails:', emailError);
                // Continue anyway since this is not critical to the booking process
            }
            res.status(201).json({
                success: true,
                message: 'Booking request submitted successfully. The mentor will review your request.',
                booking: {
                    id: populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking._id,
                    mentorId: populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking.mentorId,
                    mentorName: (_e = populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking.mentorId) === null || _e === void 0 ? void 0 : _e.fullName,
                    date,
                    startTime,
                    endTime,
                    topic,
                    status: 'pending', // Status is pending until mentor approves
                    meetingLink: populatedBooking === null || populatedBooking === void 0 ? void 0 : populatedBooking.meetingLink,
                    message: 'Your booking request has been sent to the mentor for approval. You will receive an email confirmation once the mentor responds.'
                }
            });
        }
        catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while creating the booking'
            });
        }
    }),
    /**
     * Get all bookings for the current user
     * @route GET /api/bookings
     */
    getUserBookings: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            const { status } = req.query;
            // Build filter object
            const filter = { menteeId: userId };
            // Add status filter if provided
            if (status && ['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
                filter.status = status;
            }
            // Get bookings for the user
            const bookings = yield MentorshipBooking_1.MentorshipBooking.find(filter)
                .sort({ scheduledAt: -1 })
                .populate('mentorId', 'fullName email profileImage mentorProfile.title')
                .exec();
            res.status(200).json({
                success: true,
                data: {
                    bookings,
                    count: bookings.length
                }
            });
        }
        catch (error) {
            console.error('Error fetching user bookings:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching bookings'
            });
        }
    }),
    /**
     * Get details for a specific booking
     * @route GET /api/bookings/:id
     */
    getBookingDetails: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            const bookingId = req.params.id;
            // Validate booking ID
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID format'
                });
                return;
            }
            // Find booking with menteeId to ensure user can only access their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                menteeId: userId
            }).populate('mentorId', 'fullName email profileImage mentorProfile.title mentorProfile.bio').exec();
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Booking not found or you do not have permission to view it'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    booking
                }
            });
        }
        catch (error) {
            console.error('Error fetching booking details:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching booking details'
            });
        }
    }),
    /**
     * Cancel a booking
     * @route POST /api/bookings/:id/cancel
     */
    cancelBooking: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            const bookingId = req.params.id;
            const { reason } = req.body;
            // Validate booking ID
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID format'
                });
                return;
            }
            // Validate cancel reason
            if (!reason) {
                res.status(400).json({
                    success: false,
                    error: 'Cancellation reason is required'
                });
                return;
            }
            // Find booking with menteeId to ensure user can only cancel their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                menteeId: userId
            });
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Booking not found or you do not have permission to cancel it'
                });
                return;
            }
            // Only allow cancellation of scheduled bookings
            if (booking.status !== 'scheduled') {
                res.status(400).json({
                    success: false,
                    error: `Cannot cancel a booking with status: ${booking.status}`
                });
                return;
            }
            // Get time difference to check if cancellation is allowed
            const now = new Date();
            const sessionTime = new Date(booking.scheduledAt);
            const hoursDifference = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            // Check if cancellation is within allowed time (24 hours)
            if (hoursDifference < 24) {
                res.status(400).json({
                    success: false,
                    error: 'Bookings can only be cancelled at least 24 hours before the scheduled time'
                });
                return;
            }
            // Cancel the booking
            const cancelledBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, {
                $set: {
                    status: 'cancelled',
                    'notes.menteeNotes': `Cancelled by mentee. Reason: ${reason}`
                }
            }, { new: true }).populate('mentorId', 'fullName email profileImage')
                .populate('menteeId', 'fullName email').exec();
            // Send cancellation emails
            try {
                const mentorData = cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.mentorId;
                const menteeData = cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.menteeId;
                const bookingDate = new Date((cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.scheduledAt) || '').toISOString().split('T')[0];
                // Extract time information from scheduledAt
                const scheduledDate = new Date((cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.scheduledAt) || '');
                const startHour = scheduledDate.getHours().toString().padStart(2, '0');
                const startMinute = scheduledDate.getMinutes().toString().padStart(2, '0');
                const startTime = `${startHour}:${startMinute}`;
                // Calculate end time based on duration
                const endDate = new Date(scheduledDate.getTime() + ((cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.duration) || 0) * 60 * 1000);
                const endHour = endDate.getHours().toString().padStart(2, '0');
                const endMinute = endDate.getMinutes().toString().padStart(2, '0');
                const endTime = `${endHour}:${endMinute}`;
                // Send notification to mentor about cancellation
                yield (0, email_1.sendMentorBookingCancelledEmail)(mentorData.email, mentorData.fullName, menteeData.fullName, (cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.topic) || '', bookingDate, startTime, endTime, 'mentee', reason);
                // Send confirmation to mentee
                yield (0, email_1.sendMenteeBookingCancelledEmail)(menteeData.email, menteeData.fullName, mentorData.fullName, (cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.topic) || '', bookingDate, startTime, endTime, 'mentee', reason);
            }
            catch (emailError) {
                console.error('Error sending cancellation emails:', emailError);
                // Continue anyway since this is not critical to the cancellation process
            }
            // TODO: Initiate refund process if payment was made
            res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully',
                data: {
                    booking: cancelledBooking
                }
            });
        }
        catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while cancelling booking'
            });
        }
    }),
    /**
     * Rate and review a completed session
     * @route POST /api/bookings/:id/review
     */
    rateBooking: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            const bookingId = req.params.id;
            const { rating, review } = req.body;
            // Validate booking ID
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID format'
                });
                return;
            }
            // Validate rating
            if (rating === undefined || rating < 1 || rating > 5) {
                res.status(400).json({
                    success: false,
                    error: 'Rating must be between 1 and 5'
                });
                return;
            }
            // Find booking with menteeId to ensure user can only rate their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                menteeId: userId,
                status: 'completed'
            });
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Completed booking not found or you do not have permission to rate it'
                });
                return;
            }
            // Check if booking has already been rated
            if (booking.feedback && booking.feedback.rating) {
                res.status(400).json({
                    success: false,
                    error: 'You have already rated this session'
                });
                return;
            }
            // Update booking with feedback
            const updatedBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, {
                $set: {
                    'feedback.rating': rating,
                    'feedback.comment': review || '',
                    'feedback.submittedAt': new Date()
                }
            }, { new: true });
            // Update mentor's average rating
            const mentorId = booking.mentorId;
            // Get all rated bookings for this mentor
            const mentorRatedBookings = yield MentorshipBooking_1.MentorshipBooking.find({
                mentorId,
                'feedback.rating': { $exists: true, $ne: null }
            });
            // Calculate average rating
            const totalRatings = mentorRatedBookings.reduce((sum, b) => { var _a; return sum + (((_a = b.feedback) === null || _a === void 0 ? void 0 : _a.rating) || 0); }, 0);
            const averageRating = totalRatings / mentorRatedBookings.length;
            // Update mentor profile with new rating and count
            yield User_1.User.findByIdAndUpdate(mentorId, {
                $set: {
                    'mentorProfile.mentorRating': averageRating,
                    'mentorProfile.mentorReviewsCount': mentorRatedBookings.length
                }
            });
            // Send notification to mentor about new review
            try {
                const { createNotification } = yield Promise.resolve().then(() => __importStar(require('../utils/notifications')));
                yield createNotification({
                    recipient: mentorId.toString(),
                    type: 'session_review',
                    title: 'New Session Review',
                    message: `You received a ${rating}-star review for your session.`,
                    relatedId: bookingId
                });
            }
            catch (notifyError) {
                console.error('Failed to send review notification:', notifyError);
                // Continue anyway since this is not critical
            }
            res.status(200).json({
                success: true,
                message: 'Session rated successfully',
                data: {
                    rating,
                    review: review || '',
                    updatedAt: (_a = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.feedback) === null || _a === void 0 ? void 0 : _a.submittedAt
                }
            });
        }
        catch (error) {
            console.error('Error rating booking:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while rating the session'
            });
        }
    }),
    /**
     * Get all bookings for a mentor
     * @route GET /api/bookings/mentor
     */
    getMentorBookings: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
            const { status, startDate, endDate } = req.query;
            // Build filter object
            const filter = { mentorId };
            // Add status filter if provided
            if (status && ['pending', 'scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
                filter.status = status;
            }
            // Add date range filter if provided
            if (startDate || endDate) {
                filter.scheduledAt = {};
                if (startDate)
                    filter.scheduledAt.$gte = new Date(startDate);
                if (endDate)
                    filter.scheduledAt.$lte = new Date(endDate);
            }
            // Get bookings for the mentor
            const bookings = yield MentorshipBooking_1.MentorshipBooking.find(filter)
                .sort({ scheduledAt: -1 })
                .populate('menteeId', 'fullName email profileImage')
                .exec();
            res.status(200).json({
                success: true,
                data: {
                    bookings,
                    count: bookings.length
                }
            });
        }
        catch (error) {
            console.error('Error fetching mentor bookings:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching bookings'
            });
        }
    }),
    /**
     * Get details for a specific booking (mentor view)
     * @route GET /api/bookings/mentor/:id
     */
    getMentorBookingDetails: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
            const bookingId = req.params.id;
            // Validate booking ID
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID format'
                });
                return;
            }
            // Find booking with mentorId to ensure mentor can only access their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            }).populate('menteeId', 'fullName email profileImage').exec();
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Booking not found or you do not have permission to view it'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    booking
                }
            });
        }
        catch (error) {
            console.error('Error fetching booking details:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching booking details'
            });
        }
    }),
    /**
     * Update booking details (mentor only)
     * @route PUT /api/bookings/mentor/:id
     */
    updateBooking: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
            const bookingId = req.params.id;
            const { notes, meetingLink, status } = req.body;
            // Validate booking ID
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID format'
                });
                return;
            }
            // Find booking with mentorId to ensure mentor can only update their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            }).populate('menteeId', 'fullName email profileImage')
                .populate('mentorId', 'fullName email').exec();
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Booking not found or you do not have permission to update it'
                });
                return;
            }
            // Prepare update object with only provided fields
            const updateFields = {};
            if ((notes === null || notes === void 0 ? void 0 : notes.mentorNotes) !== undefined) {
                updateFields['notes.mentorNotes'] = notes.mentorNotes;
            }
            if ((notes === null || notes === void 0 ? void 0 : notes.sharedNotes) !== undefined) {
                updateFields['notes.sharedNotes'] = notes.sharedNotes;
            }
            if (meetingLink !== undefined) {
                updateFields.meetingLink = meetingLink;
            }
            // Handle status changes
            if (status !== undefined) {
                console.log('Status change requested:', {
                    currentStatus: booking.status,
                    newStatus: status,
                    bookingId: booking._id
                });
                // Validate status transition
                if (booking.status === 'pending' && status === 'scheduled') {
                    updateFields.status = 'scheduled';
                    // Auto-create Google Meet link if booking is being scheduled and doesn't have one
                    if (!booking.meetingLink && !meetingLink) {
                        console.log('Attempting to create Google Meet for booking:', booking._id);
                        try {
                            const mentorData = booking.mentorId;
                            const menteeData = booking.menteeId;
                            console.log('Creating Google Meet for scheduled booking:', {
                                bookingId: booking._id,
                                topic: booking.topic,
                                scheduledAt: booking.scheduledAt,
                                duration: booking.duration,
                                mentorEmail: mentorData.email,
                                menteeEmail: menteeData.email
                            });
                            const meetDetails = yield (0, googleMeet_1.createGoogleMeet)({
                                topic: booking.topic,
                                start: new Date(booking.scheduledAt),
                                durationMins: booking.duration,
                                mentorEmail: mentorData.email,
                                menteeEmail: menteeData.email
                            });
                            updateFields.meetingLink = meetDetails.joinUrl;
                            updateFields.googleEventId = meetDetails.id;
                            console.log('Google Meet created successfully for booking:', {
                                bookingId: booking._id,
                                meetingLink: meetDetails.joinUrl,
                                eventId: meetDetails.id
                            });
                        }
                        catch (googleError) {
                            console.error('Failed to create Google Meet for booking:', booking._id, googleError);
                            // Return error if Google Meet creation fails
                            res.status(502).json({
                                success: false,
                                error: 'Failed to create meeting link. Please try again or contact support.',
                                details: googleError.message
                            });
                            return;
                        }
                    }
                    else {
                        console.log('Skipping Google Meet creation:', {
                            existingMeetingLink: !!booking.meetingLink,
                            providedMeetingLink: !!meetingLink
                        });
                    }
                }
                else if (status !== booking.status) {
                    // For other status changes, validate if they're allowed
                    const validStatuses = ['pending', 'scheduled', 'completed', 'cancelled', 'no-show'];
                    if (validStatuses.includes(status)) {
                        updateFields.status = status;
                        console.log('Status change approved:', { from: booking.status, to: status });
                    }
                    else {
                        console.log('Invalid status change rejected:', { from: booking.status, to: status });
                        res.status(400).json({
                            success: false,
                            error: `Invalid status: ${status}`
                        });
                        return;
                    }
                }
            }
            // Only allow updates to pending or scheduled bookings
            if (!['pending', 'scheduled'].includes(booking.status)) {
                res.status(400).json({
                    success: false,
                    error: `Cannot update a booking with status: ${booking.status}`
                });
                return;
            }
            // Perform the update
            const updatedBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, { $set: updateFields }, { new: true, runValidators: true }).populate('menteeId', 'fullName email profileImage')
                .populate('mentorId', 'fullName email').exec();
            // Send email notifications
            if (updateFields.status === 'scheduled' || meetingLink || (notes === null || notes === void 0 ? void 0 : notes.sharedNotes)) {
                try {
                    const menteeData = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.menteeId;
                    const mentorData = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.mentorId;
                    const bookingDate = new Date((updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.scheduledAt) || '').toISOString().split('T')[0];
                    // Extract time information from scheduledAt
                    const scheduledDate = new Date((updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.scheduledAt) || '');
                    const startHour = scheduledDate.getHours().toString().padStart(2, '0');
                    const startMinute = scheduledDate.getMinutes().toString().padStart(2, '0');
                    const startTime = `${startHour}:${startMinute}`;
                    // Calculate end time based on duration
                    const endDate = new Date(scheduledDate.getTime() + ((updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.duration) || 0) * 60 * 1000);
                    const endHour = endDate.getHours().toString().padStart(2, '0');
                    const endMinute = endDate.getMinutes().toString().padStart(2, '0');
                    const endTime = `${endHour}:${endMinute}`;
                    // If booking was scheduled or meeting link was added, send confirmation emails
                    if (updateFields.status === 'scheduled' || meetingLink) {
                        // Send confirmation to mentor with calendar
                        yield (0, email_1.sendMentorBookingConfirmedEmail)(mentorData.email, mentorData.fullName, menteeData.fullName, ((_a = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking._id) === null || _a === void 0 ? void 0 : _a.toString()) || '', (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.topic) || '', bookingDate, startTime, endTime, updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.meetingLink);
                        // Send confirmation to mentee with calendar
                        yield (0, email_1.sendMenteeBookingConfirmedEmail)(menteeData.email, menteeData.fullName, mentorData.fullName, ((_b = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking._id) === null || _b === void 0 ? void 0 : _b.toString()) || '', (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.topic) || '', bookingDate, startTime, endTime, updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.meetingLink);
                    }
                    else {
                        // If just notes were updated, send regular update email
                        yield (0, email_1.sendBookingUpdateEmail)(menteeData.email, menteeData.fullName, mentorData.fullName, ((_c = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking._id) === null || _c === void 0 ? void 0 : _c.toString()) || '', (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.topic) || '', bookingDate, startTime, endTime, updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.meetingLink, (_d = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.notes) === null || _d === void 0 ? void 0 : _d.sharedNotes);
                    }
                }
                catch (emailError) {
                    console.error('Error sending booking update/confirmation emails:', emailError);
                    // Continue anyway since this is not critical
                }
            }
            res.status(200).json({
                success: true,
                message: 'Booking updated successfully',
                data: {
                    booking: updatedBooking
                }
            });
        }
        catch (error) {
            console.error('Error updating booking:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while updating booking'
            });
        }
    }),
    /**
     * Mark a booking as completed (mentor only)
     * @route POST /api/bookings/mentor/:id/complete
     */
    completeBooking: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
            const bookingId = req.params.id;
            const { notes } = req.body;
            // Validate booking ID
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID format'
                });
                return;
            }
            // Find booking with mentorId to ensure mentor can only complete their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            });
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Booking not found or you do not have permission to complete it'
                });
                return;
            }
            // Only allow completion of scheduled bookings
            if (booking.status !== 'scheduled') {
                res.status(400).json({
                    success: false,
                    error: `Cannot complete a booking with status: ${booking.status}`
                });
                return;
            }
            // Update booking status and notes if provided
            const updateFields = {
                status: 'completed'
            };
            if (notes === null || notes === void 0 ? void 0 : notes.mentorNotes) {
                updateFields['notes.mentorNotes'] = notes.mentorNotes;
            }
            if (notes === null || notes === void 0 ? void 0 : notes.sharedNotes) {
                updateFields['notes.sharedNotes'] = notes.sharedNotes;
            }
            // Complete the booking
            const completedBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, { $set: updateFields }, { new: true }).populate('menteeId', 'fullName email profileImage')
                .populate('mentorId', 'fullName email').exec();
            // Increment sessions count for mentor
            yield User_1.User.findByIdAndUpdate(mentorId, { $inc: { 'mentorProfile.sessionsCount': 1 } });
            // Send email notification to mentee about session completion
            try {
                const menteeData = completedBooking === null || completedBooking === void 0 ? void 0 : completedBooking.menteeId;
                const mentorData = completedBooking === null || completedBooking === void 0 ? void 0 : completedBooking.mentorId;
                const bookingDate = new Date((completedBooking === null || completedBooking === void 0 ? void 0 : completedBooking.scheduledAt) || '').toISOString().split('T')[0];
                yield (0, email_1.sendSessionCompletionEmail)(menteeData.email, menteeData.fullName, mentorData.fullName, ((_a = completedBooking === null || completedBooking === void 0 ? void 0 : completedBooking._id) === null || _a === void 0 ? void 0 : _a.toString()) || '', (completedBooking === null || completedBooking === void 0 ? void 0 : completedBooking.topic) || '', bookingDate, (_b = completedBooking === null || completedBooking === void 0 ? void 0 : completedBooking.notes) === null || _b === void 0 ? void 0 : _b.sharedNotes);
            }
            catch (emailError) {
                console.error('Error sending session completion email:', emailError);
                // Continue anyway since this is not critical
            }
            res.status(200).json({
                success: true,
                message: 'Booking marked as completed',
                data: {
                    booking: completedBooking
                }
            });
        }
        catch (error) {
            console.error('Error completing booking:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while completing booking'
            });
        }
    }),
    /**
     * Cancel a booking (mentor view)
     * @route POST /api/bookings/mentor/:id/cancel
     */
    cancelMentorBooking: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
            const bookingId = req.params.id;
            const { cancelReason } = req.body;
            // Validate booking ID
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID format'
                });
                return;
            }
            // Validate cancel reason
            if (!cancelReason) {
                res.status(400).json({
                    success: false,
                    error: 'Cancellation reason is required'
                });
                return;
            }
            // Find booking with mentorId to ensure mentor can only cancel their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            });
            if (!booking) {
                res.status(404).json({
                    success: false,
                    error: 'Booking not found or you do not have permission to cancel it'
                });
                return;
            }
            // Only allow cancellation of scheduled bookings
            if (booking.status !== 'scheduled') {
                res.status(400).json({
                    success: false,
                    error: `Cannot cancel a booking with status: ${booking.status}`
                });
                return;
            }
            // Get time difference to check if cancellation is allowed
            const now = new Date();
            const sessionTime = new Date(booking.scheduledAt);
            const hoursDifference = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            // Check if cancellation is within allowed time (24 hours)
            if (hoursDifference < 24) {
                res.status(400).json({
                    success: false,
                    error: 'Bookings can only be cancelled at least 24 hours before the scheduled time'
                });
                return;
            }
            // Cancel the booking
            const cancelledBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, {
                $set: {
                    status: 'cancelled',
                    'notes.mentorNotes': `Cancelled by mentor. Reason: ${cancelReason}`
                }
            }, { new: true }).populate('menteeId', 'fullName email profileImage')
                .populate('mentorId', 'fullName email').exec();
            // Send cancellation emails
            try {
                const mentorData = cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.mentorId;
                const menteeData = cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.menteeId;
                const bookingDate = new Date((cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.scheduledAt) || '').toISOString().split('T')[0];
                // Extract time information from scheduledAt
                const scheduledDate = new Date((cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.scheduledAt) || '');
                const startHour = scheduledDate.getHours().toString().padStart(2, '0');
                const startMinute = scheduledDate.getMinutes().toString().padStart(2, '0');
                const startTime = `${startHour}:${startMinute}`;
                // Calculate end time based on duration
                const endDate = new Date(scheduledDate.getTime() + ((cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.duration) || 0) * 60 * 1000);
                const endHour = endDate.getHours().toString().padStart(2, '0');
                const endMinute = endDate.getMinutes().toString().padStart(2, '0');
                const endTime = `${endHour}:${endMinute}`;
                // Send notification to mentee about cancellation
                yield (0, email_1.sendMenteeBookingCancelledEmail)(menteeData.email, menteeData.fullName, mentorData.fullName, (cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.topic) || '', bookingDate, startTime, endTime, 'mentor', cancelReason);
                // Send confirmation to mentor
                yield (0, email_1.sendMentorBookingCancelledEmail)(mentorData.email, mentorData.fullName, menteeData.fullName, (cancelledBooking === null || cancelledBooking === void 0 ? void 0 : cancelledBooking.topic) || '', bookingDate, startTime, endTime, 'mentor', cancelReason);
            }
            catch (emailError) {
                console.error('Error sending cancellation emails:', emailError);
                // Continue anyway since this is not critical to the cancellation process
            }
            // TODO: Initiate refund process if payment was made
            res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully',
                data: {
                    booking: cancelledBooking
                }
            });
        }
        catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while cancelling booking'
            });
        }
    }),
    /**
     * Get public mentor availability slots for a specific date
     * @route GET /api/bookings/availability/:mentorId
     */
    getMentorPublicAvailability: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const mentorId = req.params.mentorId;
            const date = req.query.date;
            if (!date || !mentorId) {
                res.status(400).json({
                    success: false,
                    error: 'Date and mentor ID are required'
                });
                return;
            }
            // Validate mentor ID
            if (!mongoose_1.default.Types.ObjectId.isValid(mentorId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid mentor ID format'
                });
                return;
            }
            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid date format. Use YYYY-MM-DD'
                });
                return;
            }
            // Get mentor with availability
            const mentor = yield User_1.User.findOne({
                _id: mentorId,
                role: 'mentor',
                'mentorProfile.isVerified': true
            }).select('mentorProfile.availability');
            if (!mentor) {
                res.status(404).json({
                    success: false,
                    error: 'Mentor not found or not verified'
                });
                return;
            }
            // Get day of week from date (0 = Sunday, 1 = Monday, etc.)
            const selectedDate = new Date(date);
            const dayOfWeek = selectedDate.getDay();
            // Get the Monday of the selected week using our helper function
            const weekKey = getMondayOfWeek(date);
            console.log(`Checking availability for date: ${date}, day of week: ${dayOfWeek}, week key: ${weekKey}`);
            // DEBUG: Log all available slots to see what's in the database
            console.log('All availability slots:', JSON.stringify(((_a = mentor.mentorProfile) === null || _a === void 0 ? void 0 : _a.availability) || []));
            // Filter availability slots for the selected day AND week
            // First check specific week, then fallback to general recurring slots
            let availabilitySlots = ((_c = (_b = mentor.mentorProfile) === null || _b === void 0 ? void 0 : _b.availability) === null || _c === void 0 ? void 0 : _c.filter(slot => {
                console.log(`Comparing slot day=${slot.day} weekKey=${slot.weekKey} with dayOfWeek=${dayOfWeek} weekKey=${weekKey}`);
                return slot.day === dayOfWeek &&
                    (slot.weekKey === weekKey || !slot.weekKey); // Match specific week OR recurring slots
            })) || [];
            console.log(`Found ${availabilitySlots.length} potential slots for the selected day/week`);
            // If no specific slots for this week, use the recurring slots (without weekKey)
            if (availabilitySlots.length === 0) {
                availabilitySlots = ((_e = (_d = mentor.mentorProfile) === null || _d === void 0 ? void 0 : _d.availability) === null || _e === void 0 ? void 0 : _e.filter(slot => slot.day === dayOfWeek && !slot.weekKey)) || [];
                console.log(`Using ${availabilitySlots.length} recurring slots instead`);
            }
            if (availabilitySlots.length === 0) {
                // No availability set for this day
                res.status(200).json({
                    success: true,
                    data: {
                        availableSlots: [],
                        date
                    }
                });
                return;
            }
            // Check for existing bookings on this date that might conflict
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            // FIXED: Exclude both 'scheduled' AND 'pending' bookings to prevent double bookings
            // 'cancelled' bookings are not excluded so slots become available again when mentor rejects
            const existingBookings = yield MentorshipBooking_1.MentorshipBooking.find({
                mentorId,
                scheduledAt: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['scheduled', 'pending'] } // Exclude both pending and scheduled bookings
            }).select('scheduledAt duration');
            // Build array of available time slots in 30-minute increments
            const availableSlots = [];
            // Process each availability slot
            availabilitySlots.forEach(slot => {
                // Parse start and end time (HH:MM format)
                const [startHour, startMinute] = slot.startTime.split(':').map(Number);
                const [endHour, endMinute] = slot.endTime.split(':').map(Number);
                // Generate 30-minute slots
                const startTimeMinutes = startHour * 60 + startMinute;
                const endTimeMinutes = endHour * 60 + endMinute;
                // Create 30-minute increments
                for (let minutes = startTimeMinutes; minutes < endTimeMinutes; minutes += 30) {
                    const hour = Math.floor(minutes / 60);
                    const minute = minutes % 60;
                    const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    // Check if this time slot overlaps with any existing booking
                    const slotDate = new Date(date);
                    slotDate.setHours(hour, minute, 0, 0);
                    // Default slot duration is 30 minutes
                    const slotEndDate = new Date(slotDate.getTime() + 30 * 60 * 1000);
                    const isBooked = existingBookings.some(booking => {
                        const bookingStart = new Date(booking.scheduledAt);
                        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000);
                        // Check if time slots overlap
                        return ((slotDate >= bookingStart && slotDate < bookingEnd) ||
                            (slotEndDate > bookingStart && slotEndDate <= bookingEnd) ||
                            (slotDate <= bookingStart && slotEndDate >= bookingEnd));
                    });
                    if (!isBooked && !availableSlots.includes(timeSlot)) {
                        availableSlots.push(timeSlot);
                    }
                }
            });
            // Sort available slots by time
            availableSlots.sort();
            // Remove any duplicate slots that might have been created
            const uniqueSlots = [...new Set(availableSlots)];
            // Return the available time slots
            res.status(200).json({
                success: true,
                data: {
                    availableSlots: uniqueSlots,
                    date
                }
            });
        }
        catch (error) {
            console.error('Error fetching mentor public availability:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while retrieving availability slots'
            });
        }
    })
};
