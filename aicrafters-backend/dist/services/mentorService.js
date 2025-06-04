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
exports.mentorService = void 0;
const User_1 = require("../models/User");
const MentorshipBooking_1 = require("../models/MentorshipBooking");
const MentorMessage_1 = require("../models/MentorMessage");
const mongoose_1 = __importDefault(require("mongoose"));
const mentorUtils_1 = require("../utils/mentorUtils");
exports.mentorService = {
    /**
     * Process a mentor application
     */
    processMentorApplication: (userId, profileData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Validate mentor profile data
            if (!validateMentorProfile(profileData)) {
                throw new Error('Invalid mentor profile data');
            }
            // Check if user exists and is not already a mentor
            const user = yield User_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.role === 'mentor') {
                throw new Error('User is already a mentor');
            }
            if (user.mentorProfile && user.mentorProfile.appliedAt) {
                throw new Error('User has already applied to become a mentor');
            }
            // Create mentor profile
            const mentorProfile = Object.assign(Object.assign({}, profileData), { availability: profileData.availability || [], isVerified: false, menteesCount: 0, sessionsCount: 0, mentorRating: 0, mentorReviewsCount: 0, appliedAt: new Date(), approvedAt: null });
            // Update user with mentor profile
            yield User_1.User.findByIdAndUpdate(userId, {
                mentorProfile
            });
            return true;
        }
        catch (error) {
            console.error('Error processing mentor application:', error);
            throw error;
        }
    }),
    /**
     * Get mentor profile by user ID
     */
    getMentorProfile: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const user = yield User_1.User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            if (user.role !== 'mentor' && !user.mentorProfile) {
                throw new Error('User is not a mentor and has not applied to be one');
            }
            // Determine application status
            let applicationStatus = 'none';
            if (user.role === 'mentor') {
                applicationStatus = 'approved';
            }
            else if (user.mentorProfile && user.mentorProfile.appliedAt) {
                applicationStatus = 'pending';
            }
            return {
                profile: user.mentorProfile,
                status: applicationStatus,
                isVerified: ((_a = user.mentorProfile) === null || _a === void 0 ? void 0 : _a.isVerified) || false,
                userId: user._id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage
            };
        }
        catch (error) {
            console.error('Error getting mentor profile:', error);
            throw error;
        }
    }),
    /**
     * Update mentor profile
     */
    updateMentorProfile: (userId, profileUpdate) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check if user exists
            const user = yield User_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Validate if user is a mentor or has applied to be one
            if (user.role !== 'mentor' && !user.mentorProfile) {
                throw new Error('User is not a mentor and has not applied to be one');
            }
            // Process skills and languages to ensure they have proper IDs
            const processedSkills = profileUpdate.skills !== undefined ? (0, mentorUtils_1.processNamedItems)(profileUpdate.skills) : undefined;
            const processedLanguages = profileUpdate.languages !== undefined ? (0, mentorUtils_1.processNamedItems)(profileUpdate.languages) : undefined;
            // Create update object
            const updateFields = {};
            if (profileUpdate.title !== undefined)
                updateFields['mentorProfile.title'] = profileUpdate.title;
            if (profileUpdate.bio !== undefined)
                updateFields['mentorProfile.bio'] = profileUpdate.bio;
            if (profileUpdate.hourlyRate !== undefined)
                updateFields['mentorProfile.hourlyRate'] = profileUpdate.hourlyRate;
            if (processedSkills !== undefined)
                updateFields['mentorProfile.skills'] = processedSkills;
            if (processedLanguages !== undefined)
                updateFields['mentorProfile.languages'] = processedLanguages;
            // Validate if there's anything to update
            if (Object.keys(updateFields).length === 0) {
                throw new Error('No valid fields to update');
            }
            // Perform update
            const updatedUser = yield User_1.User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
            if (!updatedUser) {
                throw new Error('Failed to update mentor profile');
            }
            return updatedUser.mentorProfile;
        }
        catch (error) {
            console.error('Error updating mentor profile:', error);
            throw error;
        }
    }),
    /**
     * Update mentor availability
     */
    updateMentorAvailability: (userId, availability) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Validate availability format
            if (!validateAvailability(availability)) {
                throw new Error('Invalid availability format');
            }
            // Check if user exists
            const user = yield User_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Validate if user is a mentor or has applied to be one
            if (user.role !== 'mentor' && !user.mentorProfile) {
                throw new Error('User is not a mentor and has not applied to be one');
            }
            // Update availability
            const updatedUser = yield User_1.User.findByIdAndUpdate(userId, { $set: { 'mentorProfile.availability': availability } }, { new: true }).select('mentorProfile.availability');
            if (!updatedUser) {
                throw new Error('Failed to update availability');
            }
            return ((_a = updatedUser.mentorProfile) === null || _a === void 0 ? void 0 : _a.availability) || [];
        }
        catch (error) {
            console.error('Error updating mentor availability:', error);
            throw error;
        }
    }),
    /**
     * Approve a mentor application
     */
    approveMentorApplication: (userId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Find user and check if they have applied
            const user = yield User_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.mentorProfile || !user.mentorProfile.appliedAt) {
                throw new Error('User has not applied to become a mentor');
            }
            if (user.mentorProfile.approvedAt) {
                throw new Error('Mentor application already approved');
            }
            // Update user to be a mentor
            yield User_1.User.findByIdAndUpdate(userId, {
                role: 'mentor',
                'mentorProfile.approvedAt': new Date(),
                'mentorProfile.isVerified': true
            });
            // TODO: Send notification to user about approval
            // TODO: Log admin action for audit trail
            return true;
        }
        catch (error) {
            console.error('Error approving mentor application:', error);
            throw error;
        }
    }),
    /**
     * Reject a mentor application
     */
    rejectMentorApplication: (userId, adminId, reason) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Find user and check if they have applied
            const user = yield User_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.mentorProfile || !user.mentorProfile.appliedAt) {
                throw new Error('User has not applied to become a mentor');
            }
            if (user.mentorProfile.approvedAt) {
                throw new Error('Mentor application already approved');
            }
            // Remove mentor profile
            yield User_1.User.findByIdAndUpdate(userId, {
                $unset: { mentorProfile: 1 }
            });
            // TODO: Send notification to user about rejection with reason
            // TODO: Log admin action for audit trail
            return true;
        }
        catch (error) {
            console.error('Error rejecting mentor application:', error);
            throw error;
        }
    }),
    /**
     * Get all mentors (with optional filters)
     */
    getMentors: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, page = 1, limit = 10) {
        try {
            const query = { role: 'mentor' };
            // Apply filters if provided
            if (filters.skills && filters.skills.length > 0) {
                query['mentorProfile.skills.name'] = { $in: filters.skills };
            }
            if (filters.languages && filters.languages.length > 0) {
                query['mentorProfile.languages.name'] = { $in: filters.languages };
            }
            if (filters.country) {
                query['mentorProfile.country'] = filters.country;
            }
            if (filters.minHourlyRate !== undefined) {
                query['mentorProfile.hourlyRate'] = { $gte: filters.minHourlyRate };
            }
            if (filters.maxHourlyRate !== undefined) {
                if (query['mentorProfile.hourlyRate']) {
                    query['mentorProfile.hourlyRate'].$lte = filters.maxHourlyRate;
                }
                else {
                    query['mentorProfile.hourlyRate'] = { $lte: filters.maxHourlyRate };
                }
            }
            // Add search functionality
            if (filters.search) {
                const searchRegex = new RegExp(filters.search, 'i');
                query.$or = [
                    { fullName: searchRegex },
                    { 'mentorProfile.title': searchRegex },
                    { 'mentorProfile.bio': searchRegex },
                    { 'mentorProfile.skills.name': searchRegex },
                    { 'mentorProfile.languages.name': searchRegex }
                ];
            }
            // Only get verified mentors for public listing
            query['mentorProfile.isVerified'] = true;
            // Calculate pagination
            const skip = (page - 1) * limit;
            // Get mentors with pagination
            const mentors = yield User_1.User.find(query)
                .select('fullName email profileImage mentorProfile')
                .sort({ 'mentorProfile.mentorRating': -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            // Get total count for pagination
            const total = yield User_1.User.countDocuments(query);
            // Transform mentor data for public view
            const transformedMentors = mentors.map(mentor => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return ({
                    id: mentor._id,
                    fullName: mentor.fullName,
                    profileImage: mentor.profileImage,
                    title: (_a = mentor.mentorProfile) === null || _a === void 0 ? void 0 : _a.title,
                    bio: (_b = mentor.mentorProfile) === null || _b === void 0 ? void 0 : _b.bio,
                    hourlyRate: (_c = mentor.mentorProfile) === null || _c === void 0 ? void 0 : _c.hourlyRate,
                    country: (_d = mentor.mentorProfile) === null || _d === void 0 ? void 0 : _d.country,
                    skills: (_e = mentor.mentorProfile) === null || _e === void 0 ? void 0 : _e.skills,
                    languages: (_f = mentor.mentorProfile) === null || _f === void 0 ? void 0 : _f.languages,
                    stats: {
                        rating: (_g = mentor.mentorProfile) === null || _g === void 0 ? void 0 : _g.mentorRating,
                        reviewsCount: (_h = mentor.mentorProfile) === null || _h === void 0 ? void 0 : _h.mentorReviewsCount,
                        menteesCount: (_j = mentor.mentorProfile) === null || _j === void 0 ? void 0 : _j.menteesCount,
                        sessionsCount: (_k = mentor.mentorProfile) === null || _k === void 0 ? void 0 : _k.sessionsCount
                    }
                });
            });
            return {
                mentors: transformedMentors,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            console.error('Error getting mentors:', error);
            throw error;
        }
    }),
    /**
     * Get bookings for a mentor
     */
    getMentorBookings: (mentorId_1, ...args_1) => __awaiter(void 0, [mentorId_1, ...args_1], void 0, function* (mentorId, filters = {}) {
        try {
            // Build filter object
            const filter = { mentorId };
            // Add status filter if provided
            if (filters.status && ['scheduled', 'completed', 'cancelled', 'no-show'].includes(filters.status)) {
                filter.status = filters.status;
            }
            // Add date range filter if provided
            if (filters.startDate || filters.endDate) {
                filter.scheduledAt = {};
                if (filters.startDate)
                    filter.scheduledAt.$gte = filters.startDate;
                if (filters.endDate)
                    filter.scheduledAt.$lte = filters.endDate;
            }
            // Get bookings for the mentor
            const bookings = yield MentorshipBooking_1.MentorshipBooking.find(filter)
                .sort({ scheduledAt: -1 })
                .populate('menteeId', 'fullName email profileImage')
                .exec();
            return bookings;
        }
        catch (error) {
            console.error('Error getting mentor bookings:', error);
            throw error;
        }
    }),
    /**
     * Get a specific booking by ID for a mentor
     */
    getBookingById: (mentorId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                throw new Error('Invalid booking ID format');
            }
            // Find booking with mentorId to ensure mentor can only access their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            }).populate('menteeId', 'fullName email profileImage').exec();
            if (!booking) {
                throw new Error('Booking not found or you do not have permission to view it');
            }
            return booking;
        }
        catch (error) {
            console.error('Error getting booking by ID:', error);
            throw error;
        }
    }),
    /**
     * Update a booking
     */
    updateBooking: (mentorId, bookingId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                throw new Error('Invalid booking ID format');
            }
            // Find booking with mentorId to ensure mentor can only update their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            });
            if (!booking) {
                throw new Error('Booking not found or you do not have permission to update it');
            }
            // Only allow updates to active bookings
            if (booking.status !== 'scheduled') {
                throw new Error(`Cannot update a booking with status: ${booking.status}`);
            }
            // Prepare update object with only provided fields
            const updateFields = {};
            if (((_a = updateData.notes) === null || _a === void 0 ? void 0 : _a.mentorNotes) !== undefined) {
                updateFields['notes.mentorNotes'] = updateData.notes.mentorNotes;
            }
            if (((_b = updateData.notes) === null || _b === void 0 ? void 0 : _b.sharedNotes) !== undefined) {
                updateFields['notes.sharedNotes'] = updateData.notes.sharedNotes;
            }
            if (updateData.meetingLink !== undefined) {
                updateFields.meetingLink = updateData.meetingLink;
            }
            // Perform the update
            const updatedBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, { $set: updateFields }, { new: true, runValidators: true }).populate('menteeId', 'fullName email profileImage');
            if (!updatedBooking) {
                throw new Error('Failed to update booking');
            }
            return updatedBooking;
        }
        catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    }),
    /**
     * Complete a booking
     */
    completeBooking: (mentorId, bookingId, notes) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                throw new Error('Invalid booking ID format');
            }
            // Find booking with mentorId to ensure mentor can only complete their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            });
            if (!booking) {
                throw new Error('Booking not found or you do not have permission to complete it');
            }
            // Only allow completion of scheduled bookings
            if (booking.status !== 'scheduled') {
                throw new Error(`Cannot complete a booking with status: ${booking.status}`);
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
            const completedBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, { $set: updateFields }, { new: true }).populate('menteeId', 'fullName email profileImage');
            if (!completedBooking) {
                throw new Error('Failed to complete booking');
            }
            // Increment sessions count for mentor
            yield User_1.User.findByIdAndUpdate(mentorId, { $inc: { 'mentorProfile.sessionsCount': 1 } });
            return completedBooking;
        }
        catch (error) {
            console.error('Error completing booking:', error);
            throw error;
        }
    }),
    /**
     * Cancel a booking
     */
    cancelBooking: (mentorId, bookingId, cancelReason) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(bookingId)) {
                throw new Error('Invalid booking ID format');
            }
            if (!cancelReason) {
                throw new Error('Cancellation reason is required');
            }
            // Find booking with mentorId to ensure mentor can only cancel their bookings
            const booking = yield MentorshipBooking_1.MentorshipBooking.findOne({
                _id: bookingId,
                mentorId
            });
            if (!booking) {
                throw new Error('Booking not found or you do not have permission to cancel it');
            }
            // Only allow cancellation of scheduled bookings
            if (booking.status !== 'scheduled') {
                throw new Error(`Cannot cancel a booking with status: ${booking.status}`);
            }
            // Get time difference to check if cancellation is allowed
            const now = new Date();
            const sessionTime = new Date(booking.scheduledAt);
            const hoursDifference = (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            // Check if cancellation is within allowed time (24 hours)
            if (hoursDifference < 24) {
                throw new Error('Bookings can only be cancelled at least 24 hours before the scheduled time');
            }
            // Cancel the booking
            const cancelledBooking = yield MentorshipBooking_1.MentorshipBooking.findByIdAndUpdate(bookingId, {
                $set: {
                    status: 'cancelled',
                    'notes.mentorNotes': `Cancelled by mentor. Reason: ${cancelReason}`
                }
            }, { new: true }).populate('menteeId', 'fullName email profileImage');
            if (!cancelledBooking) {
                throw new Error('Failed to cancel booking');
            }
            return cancelledBooking;
        }
        catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    }),
    /**
     * Get mentor conversations
     */
    getMentorConversations: (mentorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Find all unique mentees that have messages with this mentor
            const uniqueMentees = yield MentorMessage_1.MentorMessage.aggregate([
                { $match: { mentorId: new mongoose_1.default.Types.ObjectId(mentorId.toString()) } },
                { $group: { _id: '$menteeId' } }
            ]);
            const menteeIds = uniqueMentees.map(item => item._id);
            // Get the latest message and unread count for each conversation
            const conversations = yield Promise.all(menteeIds.map((menteeId) => __awaiter(void 0, void 0, void 0, function* () {
                // Get latest message
                const latestMessage = yield MentorMessage_1.MentorMessage.findOne({
                    mentorId,
                    menteeId
                }).sort({ createdAt: -1 }).exec();
                // Get unread count
                const unreadCount = yield MentorMessage_1.MentorMessage.countDocuments({
                    mentorId,
                    menteeId,
                    sender: 'mentee',
                    isRead: false
                });
                // Get mentee info
                const mentee = yield User_1.User.findById(menteeId)
                    .select('fullName profileImage email')
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
                var _a, _b;
                // Handle null latestMessage gracefully
                const timeA = ((_a = a.latestMessage) === null || _a === void 0 ? void 0 : _a.createdAt) ? new Date(a.latestMessage.createdAt).getTime() : 0;
                const timeB = ((_b = b.latestMessage) === null || _b === void 0 ? void 0 : _b.createdAt) ? new Date(b.latestMessage.createdAt).getTime() : 0;
                return timeB - timeA;
            });
        }
        catch (error) {
            console.error('Error getting mentor conversations:', error);
            throw error;
        }
    }),
    /**
     * Get messages between mentor and mentee
     */
    getMentorMenteeMessages: (mentorId_1, menteeId_1, ...args_1) => __awaiter(void 0, [mentorId_1, menteeId_1, ...args_1], void 0, function* (mentorId, menteeId, options = {}) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(menteeId)) {
                throw new Error('Invalid mentee ID format');
            }
            const limit = options.limit || 50;
            const page = options.page || 1;
            const skip = (page - 1) * limit;
            // Get mentee info
            const mentee = yield User_1.User.findById(menteeId)
                .select('fullName profileImage email')
                .exec();
            if (!mentee) {
                throw new Error('Mentee not found');
            }
            // Get messages between mentor and mentee
            const messages = yield MentorMessage_1.MentorMessage.find({
                mentorId,
                menteeId
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();
            // Get total count for pagination
            const total = yield MentorMessage_1.MentorMessage.countDocuments({
                mentorId,
                menteeId
            });
            // Mark unread messages as read
            yield MentorMessage_1.MentorMessage.updateMany({
                mentorId,
                menteeId,
                sender: 'mentee',
                isRead: false
            }, { $set: { isRead: true } });
            return {
                messages,
                mentee,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            console.error('Error getting mentor-mentee messages:', error);
            throw error;
        }
    }),
    /**
     * Send message from mentor to mentee
     */
    sendMenteeMessage: (mentorId, menteeId, content) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(menteeId)) {
                throw new Error('Invalid mentee ID format');
            }
            if (!content || content.trim() === '') {
                throw new Error('Message content is required');
            }
            // Verify mentee exists
            const mentee = yield User_1.User.findById(menteeId);
            if (!mentee) {
                throw new Error('Mentee not found');
            }
            // Check if there's a booking relationship between mentor and mentee
            const hasBooking = yield MentorshipBooking_1.MentorshipBooking.exists({
                mentorId,
                menteeId,
                status: { $in: ['scheduled', 'completed'] }
            });
            if (!hasBooking) {
                throw new Error('You can only message mentees who have booked a session with you');
            }
            // Create and save the message
            const message = new MentorMessage_1.MentorMessage({
                mentorId,
                menteeId,
                sender: 'mentor',
                content,
                isRead: false
            });
            yield message.save();
            return message;
        }
        catch (error) {
            console.error('Error sending message to mentee:', error);
            throw error;
        }
    })
};
/**
 * Helper function to validate mentor profile data
 */
function validateMentorProfile(profile) {
    // Check required fields
    if (!profile.title || !profile.bio || !profile.hourlyRate) {
        return false;
    }
    // Validate skills
    if (!profile.skills || !Array.isArray(profile.skills) || profile.skills.length === 0) {
        return false;
    }
    // Validate if skills have required properties
    if (!profile.skills.every(skill => skill.id && skill.name)) {
        return false;
    }
    // Validate languages
    if (!profile.languages || !Array.isArray(profile.languages) || profile.languages.length === 0) {
        return false;
    }
    // Validate if languages have required properties
    if (!profile.languages.every(language => language.id && language.name)) {
        return false;
    }
    return true;
}
/**
 * Helper function to validate availability format
 */
function validateAvailability(availability) {
    if (!Array.isArray(availability)) {
        return false;
    }
    return availability.every(slot => typeof slot.day === 'number' &&
        slot.day >= 0 &&
        slot.day <= 6 &&
        typeof slot.startTime === 'string' &&
        typeof slot.endTime === 'string' &&
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime) &&
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime) &&
        slot.startTime < slot.endTime);
}
