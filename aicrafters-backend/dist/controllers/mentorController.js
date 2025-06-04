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
exports.mentorController = void 0;
const User_1 = require("../models/User");
const MentorshipBooking_1 = require("../models/MentorshipBooking");
const MentorMessage_1 = require("../models/MentorMessage");
const MentorApplication_1 = require("../models/MentorApplication");
const mongoose_1 = __importDefault(require("mongoose"));
const mentorService_1 = require("../services/mentorService");
const notificationService_1 = require("../services/notificationService");
const mentorUtils_1 = require("../utils/mentorUtils");
const fileUpload_1 = require("../utils/fileUpload");
const mentorAiService_1 = require("../services/mentorAiService");
exports.mentorController = {
    /**
     * Apply to become a mentor
     * @route POST /api/mentor/apply
     */
    applyToBecomeMentor: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { fullName, email, bio, hourlyRate, skills, availability, languages, professionalInfo, preferences, countries } = req.body;
            console.log('Received mentor application data:', req.body);
            // Validate required fields
            if (!email || !fullName || !bio || !skills || !Array.isArray(skills) || skills.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields: email, fullName, bio, and skills are required. Skills must be a non-empty array.'
                });
                return;
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    error: 'Please provide a valid email address'
                });
                return;
            }
            // Validate professionalInfo structure
            if (!professionalInfo || typeof professionalInfo !== 'object') {
                res.status(400).json({
                    success: false,
                    error: 'Professional information is required'
                });
                return;
            }
            if (!professionalInfo.role || !professionalInfo.linkedIn || !professionalInfo.academicBackground || !professionalInfo.experience) {
                res.status(400).json({
                    success: false,
                    error: 'Professional role, LinkedIn URL, academic background, and experience are required'
                });
                return;
            }
            // Validate experience field within professionalInfo
            if (!professionalInfo.experience || typeof professionalInfo.experience !== 'string' || professionalInfo.experience.trim() === '') {
                res.status(400).json({
                    success: false,
                    error: 'Professional experience is required'
                });
                return;
            }
            // Validate LinkedIn URL format
            const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
            if (!linkedInRegex.test(professionalInfo.linkedIn)) {
                res.status(400).json({
                    success: false,
                    error: 'Please provide a valid LinkedIn URL'
                });
                return;
            }
            // Validate languages array
            if (!languages || !Array.isArray(languages) || languages.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'At least one language is required'
                });
                return;
            }
            // Validate countries array
            if (!countries || !Array.isArray(countries) || countries.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Country information is required'
                });
                return;
            }
            // Check if application already exists for this email
            const existingApplication = yield MentorApplication_1.MentorApplication.findOne({
                email: email.toLowerCase().trim(),
                status: { $in: ['pending', 'approved'] }
            });
            if (existingApplication) {
                const statusMessage = existingApplication.status === 'approved'
                    ? 'You have already been approved as a mentor'
                    : 'You have already submitted a mentor application that is pending review';
                res.status(400).json({
                    success: false,
                    error: statusMessage
                });
                return;
            }
            // Create application record with validated data
            const applicationData = {
                fullName: fullName.trim(),
                email: email.toLowerCase().trim(),
                bio: bio.trim(),
                skills: skills.map((skill) => skill.trim()).filter((skill) => skill.length > 0),
                hourlyRate: Number(hourlyRate) || 0,
                languages: languages.map((lang) => lang.trim()).filter((lang) => lang.length > 0),
                countries: countries.map((country) => country.trim()).filter((country) => country.length > 0),
                availability: availability || {},
                professionalInfo: Object.assign({ role: professionalInfo.role.trim(), linkedIn: professionalInfo.linkedIn.trim(), experience: professionalInfo.experience.trim(), academicBackground: professionalInfo.academicBackground.trim() }, professionalInfo),
                preferences: preferences || {},
                appliedAt: new Date(),
                status: 'pending'
            };
            console.log('Processed application data:', applicationData);
            // Store the application data in the MentorApplication model
            const application = new MentorApplication_1.MentorApplication(applicationData);
            yield application.save();
            console.log('Application saved successfully with ID:', application._id);
            // Send notification to admins
            try {
                yield notificationService_1.notificationService.notifyAdmins({
                    title: 'New Mentor Application',
                    message: `${fullName} (${email}) has applied to become a mentor with skills in ${skills.join(', ')}.`,
                    type: 'mentor_application',
                    data: {
                        applicationId: application._id,
                        userEmail: email,
                        userName: fullName,
                        skills: skills
                    }
                });
                console.log('Admin notification sent successfully');
            }
            catch (notifyError) {
                console.error('Failed to send admin notification:', notifyError);
                // Continue anyway since this is not critical
            }
            // Return success response
            res.status(200).json({
                success: true,
                message: 'Mentor application submitted successfully! We will review your application and get back to you within 5-7 business days.',
                data: {
                    applicationId: application._id,
                    applicationDate: applicationData.appliedAt,
                    status: 'pending',
                    fullName: applicationData.fullName,
                    email: applicationData.email
                }
            });
        }
        catch (error) {
            console.error('Error in mentor application:', error);
            // Handle specific MongoDB validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map((err) => err.message);
                res.status(400).json({
                    success: false,
                    error: `Validation error: ${validationErrors.join(', ')}`
                });
                return;
            }
            // Handle duplicate key errors
            if (error.code === 11000) {
                res.status(400).json({
                    success: false,
                    error: 'An application with this email already exists'
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred during the mentor application process'
            });
        }
    }),
    /**
     * Get mentor profile
     * @route GET /api/mentor/profile
     */
    getMentorProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            // Check if user exists and is a mentor or has a pending application
            const user = yield User_1.User.findById(userId);
            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            // If user is not a mentor and doesn't have a mentor profile
            if (user.role !== 'mentor' && !user.mentorProfile) {
                res.status(403).json({
                    success: false,
                    error: 'User is not a mentor and has not applied to be one'
                });
                return;
            }
            // Determine application status
            let applicationStatus = 'none';
            if (user.role === 'mentor') {
                applicationStatus = 'approved';
            }
            else if (user.mentorProfile && user.mentorProfile.appliedAt) {
                applicationStatus = 'pending';
            }
            // Return user's mentor profile with additional user data
            res.status(200).json({
                success: true,
                data: {
                    profile: user.mentorProfile,
                    status: applicationStatus,
                    isVerified: ((_a = user.mentorProfile) === null || _a === void 0 ? void 0 : _a.isVerified) || false,
                    fullName: user.fullName,
                    email: user.email,
                    profileImage: user.profileImage
                }
            });
        }
        catch (error) {
            console.error('Error getting mentor profile:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while retrieving mentor profile'
            });
        }
    }),
    /**
     * Update mentor profile
     * @route PUT /api/mentor/profile
     */
    updateMentorProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            const { fullName, bio, hourlyRate, skills, languages, professionalInfo, country, availability, removeProfileImage } = req.body;
            console.log('Received mentor profile update data:', req.body);
            // Check if user exists and has a mentor profile
            const user = yield User_1.User.findById(userId);
            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            // If user is not a mentor and doesn't have a mentor profile
            if (user.role !== 'mentor' && !user.mentorProfile) {
                res.status(403).json({
                    success: false,
                    error: 'User is not a mentor and has not applied to be one'
                });
                return;
            }
            // Handle profile image upload if file is included
            let profileImageUrl = undefined;
            if (req.file) {
                try {
                    // Upload new image to Cloudinary or local storage
                    profileImageUrl = yield (0, fileUpload_1.uploadToCloudinary)(req.file, 'profile-images');
                    console.log(`Uploaded new profile image: ${profileImageUrl}`);
                }
                catch (uploadError) {
                    console.error('Error uploading profile image:', uploadError);
                    res.status(500).json({
                        success: false,
                        error: uploadError.message || 'Failed to upload profile image'
                    });
                    return;
                }
            }
            else if (removeProfileImage === 'true') {
                // If removeProfileImage flag is set, explicitly set profileImageUrl to empty string
                // This will clear the profile image in the database
                profileImageUrl = '';
            }
            // Process skills - Fixed to handle JSON string properly
            let processedSkills;
            if (skills !== undefined) {
                try {
                    let skillsData;
                    if (typeof skills === 'string') {
                        skillsData = JSON.parse(skills);
                        console.log('Parsed skills from JSON string:', skillsData);
                    }
                    else {
                        skillsData = skills;
                    }
                    processedSkills = (0, mentorUtils_1.processNamedItems)(skillsData);
                    console.log('Processed skills:', processedSkills);
                }
                catch (e) {
                    console.error('Error parsing skills:', e);
                    processedSkills = []; // Default to empty array if parsing fails
                }
            }
            // Process languages - Fixed to handle JSON string properly
            let processedLanguages;
            if (languages !== undefined) {
                try {
                    let languagesData;
                    if (typeof languages === 'string') {
                        languagesData = JSON.parse(languages);
                        console.log('Parsed languages from JSON string:', languagesData);
                    }
                    else {
                        languagesData = languages;
                    }
                    processedLanguages = (0, mentorUtils_1.processNamedItems)(languagesData);
                    console.log('Processed languages:', processedLanguages);
                }
                catch (e) {
                    console.error('Error parsing languages:', e);
                    processedLanguages = []; // Default to empty array if parsing fails
                }
            }
            // Process professional info - Fixed to handle JSON string properly
            let processedProfessionalInfo;
            if (professionalInfo !== undefined) {
                try {
                    if (typeof professionalInfo === 'string') {
                        processedProfessionalInfo = JSON.parse(professionalInfo);
                        console.log('Parsed professionalInfo from JSON string:', processedProfessionalInfo);
                    }
                    else if (typeof professionalInfo === 'object') {
                        processedProfessionalInfo = professionalInfo;
                    }
                }
                catch (e) {
                    console.error('Error parsing professionalInfo:', e);
                    processedProfessionalInfo = undefined; // Don't update if parsing fails
                }
            }
            // Prepare update object with only provided fields
            const updateFields = {};
            // Update fullName at user level if provided
            if (fullName !== undefined && fullName.trim() !== '') {
                updateFields['fullName'] = fullName.trim();
            }
            // Update mentor profile fields
            if (bio !== undefined)
                updateFields['mentorProfile.bio'] = bio.trim();
            if (hourlyRate !== undefined)
                updateFields['mentorProfile.hourlyRate'] = Number(hourlyRate) || 0;
            if (country !== undefined)
                updateFields['mentorProfile.country'] = country.trim();
            if (processedLanguages !== undefined)
                updateFields['mentorProfile.languages'] = processedLanguages;
            if (processedProfessionalInfo !== undefined) {
                updateFields['mentorProfile.professionalInfo'] = processedProfessionalInfo;
                // Update title from professionalInfo.role
                if (processedProfessionalInfo.role) {
                    updateFields['mentorProfile.title'] = processedProfessionalInfo.role;
                }
            }
            if (processedSkills !== undefined)
                updateFields['mentorProfile.skills'] = processedSkills;
            if (availability !== undefined)
                updateFields['mentorProfile.availability'] = availability;
            if (profileImageUrl !== undefined)
                updateFields['profileImage'] = profileImageUrl;
            console.log('Final update fields:', updateFields);
            // Validate required fields if they're being updated
            if (Object.keys(updateFields).length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'No valid fields to update'
                });
                return;
            }
            // Perform partial update
            const updatedUser = yield User_1.User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true });
            if (!updatedUser) {
                res.status(404).json({ success: false, error: 'Failed to update mentor profile' });
                return;
            }
            console.log('Updated user professionalInfo:', (_a = updatedUser.mentorProfile) === null || _a === void 0 ? void 0 : _a.professionalInfo);
            // Return updated profile with consistent field names
            res.status(200).json({
                success: true,
                message: 'Mentor profile updated successfully',
                data: {
                    profile: Object.assign(Object.assign({}, (updatedUser.mentorProfile ? JSON.parse(JSON.stringify(updatedUser.mentorProfile)) : {})), { 
                        // Ensure backward compatibility by providing skills field
                        skills: (_b = updatedUser.mentorProfile) === null || _b === void 0 ? void 0 : _b.skills }),
                    profileImage: updatedUser.profileImage,
                    fullName: updatedUser.fullName,
                    bio: updatedUser.bio,
                    title: ((_c = updatedUser.mentorProfile) === null || _c === void 0 ? void 0 : _c.title) || ((_e = (_d = updatedUser.mentorProfile) === null || _d === void 0 ? void 0 : _d.professionalInfo) === null || _e === void 0 ? void 0 : _e.role)
                }
            });
        }
        catch (error) {
            console.error('Error updating mentor profile:', error);
            // Handle specific MongoDB validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map((err) => err.message);
                res.status(400).json({
                    success: false,
                    error: `Validation error: ${validationErrors.join(', ')}`
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while updating mentor profile'
            });
        }
    }),
    /**
     * Get mentor availability
     * @route GET /api/mentor/availability
     */
    getMentorAvailability: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            // Fetch user with mentor profile
            const user = yield User_1.User.findById(userId).select('mentorProfile.availability role');
            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            // Verify user is a mentor or has applied to be one
            if (user.role !== 'mentor' && (!user.mentorProfile || !user.mentorProfile.appliedAt)) {
                res.status(403).json({
                    success: false,
                    error: 'User is not a mentor and has not applied to be one'
                });
                return;
            }
            // Return availability slots
            res.status(200).json({
                success: true,
                data: {
                    availability: ((_a = user.mentorProfile) === null || _a === void 0 ? void 0 : _a.availability) || []
                }
            });
        }
        catch (error) {
            console.error('Error getting mentor availability:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while retrieving mentor availability'
            });
        }
    }),
    /**
     * Update mentor availability
     * @route PUT /api/mentor/availability
     */
    updateMentorAvailability: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id;
            const { availability } = req.body;
            console.log('Updating mentor availability with data:', availability);
            // Validate availability data
            if (!availability || !Array.isArray(availability)) {
                res.status(400).json({
                    success: false,
                    error: 'Availability must be provided as an array of time slots'
                });
                return;
            }
            // Validate each availability slot and ensure it has all required fields
            const processedAvailability = availability.map(slot => {
                // Ensure the day is a number between 0-6
                const day = Number(slot.day);
                if (isNaN(day) || day < 0 || day > 6) {
                    throw new Error(`Invalid day value: ${slot.day}. Must be a number 0-6`);
                }
                // Ensure start/end times are in HH:MM format
                if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime) ||
                    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime)) {
                    throw new Error(`Invalid time format for slot. Must be HH:MM`);
                }
                // Ensure start time is before end time
                if (slot.startTime >= slot.endTime) {
                    throw new Error(`Start time (${slot.startTime}) must be before end time (${slot.endTime})`);
                }
                // Validate weekKey format if provided (should be YYYY-MM-DD)
                let normalizedWeekKey = null;
                if (slot.weekKey) {
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.weekKey)) {
                        throw new Error(`Invalid weekKey format: ${slot.weekKey}. Must be YYYY-MM-DD`);
                    }
                    // Ensure the weekKey is actually a Monday (beginning of week)
                    const calculatedMonday = getMondayOfWeek(slot.weekKey);
                    if (calculatedMonday !== slot.weekKey) {
                        console.warn(`Warning: Correcting weekKey from ${slot.weekKey} to ${calculatedMonday} (Monday of that week)`);
                        normalizedWeekKey = calculatedMonday;
                    }
                    else {
                        normalizedWeekKey = slot.weekKey;
                    }
                }
                // Generate a unique ID for each slot based on its data
                return {
                    id: `${day}-${slot.startTime}-${slot.endTime}-${slot.weekKey || 'recurring'}`,
                    day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    weekKey: normalizedWeekKey,
                    status: 'active'
                };
            });
            // Check for duplicate slots and filter them out
            const uniqueSlotMap = new Map();
            processedAvailability.forEach(slot => {
                uniqueSlotMap.set(slot.id, slot);
            });
            const uniqueAvailability = Array.from(uniqueSlotMap.values());
            // Check if user exists and has a mentor profile
            const user = yield User_1.User.findById(userId);
            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            // If user is not a mentor and doesn't have a mentor profile
            if (user.role !== 'mentor' && !user.mentorProfile) {
                res.status(403).json({
                    success: false,
                    error: 'User is not a mentor and has not applied to be one'
                });
                return;
            }
            // Update availability
            const updatedUser = yield User_1.User.findByIdAndUpdate(userId, { $set: { 'mentorProfile.availability': uniqueAvailability } }, { new: true });
            if (!updatedUser) {
                res.status(404).json({ success: false, error: 'Failed to update availability' });
                return;
            }
            // Return updated availability
            res.status(200).json({
                success: true,
                message: 'Mentor availability updated successfully',
                data: {
                    availability: ((_a = updatedUser.mentorProfile) === null || _a === void 0 ? void 0 : _a.availability) || []
                }
            });
        }
        catch (error) {
            console.error('Error updating mentor availability:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while updating mentor availability'
            });
        }
    }),
    /**
     * Get all conversations for a mentor
     * @route GET /api/mentor/messages
     */
    getMentorConversations: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
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
            conversations.sort((a, b) => {
                var _a, _b;
                const timeA = ((_a = a.latestMessage) === null || _a === void 0 ? void 0 : _a.createdAt) ? new Date(a.latestMessage.createdAt).getTime() : 0;
                const timeB = ((_b = b.latestMessage) === null || _b === void 0 ? void 0 : _b.createdAt) ? new Date(b.latestMessage.createdAt).getTime() : 0;
                return timeB - timeA;
            });
            res.status(200).json({
                success: true,
                data: {
                    conversations
                }
            });
        }
        catch (error) {
            console.error('Error getting mentor conversations:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching conversations'
            });
        }
    }),
    /**
     * Get messages with a specific mentee
     * @route GET /api/mentor/messages/:menteeId
     */
    getMentorMenteeMessages: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
            const menteeId = req.params.menteeId;
            const limit = parseInt(req.query.limit) || 50;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;
            // Validate mentee ID
            if (!mongoose_1.default.Types.ObjectId.isValid(menteeId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid mentee ID format'
                });
                return;
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
            // Get mentee info
            const mentee = yield User_1.User.findById(menteeId)
                .select('fullName profileImage email')
                .exec();
            res.status(200).json({
                success: true,
                data: {
                    messages,
                    mentee,
                    pagination: {
                        total,
                        page,
                        limit,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        }
        catch (error) {
            console.error('Error getting mentor-mentee messages:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching messages'
            });
        }
    }),
    /**
     * Send a message to a mentee
     * @route POST /api/mentor/messages/:menteeId
     */
    sendMenteeMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const mentorId = req.user._id;
            const menteeId = req.params.menteeId;
            const { content } = req.body;
            // Validate mentee ID
            if (!mongoose_1.default.Types.ObjectId.isValid(menteeId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid mentee ID format'
                });
                return;
            }
            // Validate message content
            if (!content || content.trim() === '') {
                res.status(400).json({
                    success: false,
                    error: 'Message content is required'
                });
                return;
            }
            // Verify mentee exists
            const mentee = yield User_1.User.findById(menteeId);
            if (!mentee) {
                res.status(404).json({
                    success: false,
                    error: 'Mentee not found'
                });
                return;
            }
            // Check if there's a booking relationship between mentor and mentee
            const hasBooking = yield MentorshipBooking_1.MentorshipBooking.exists({
                mentorId,
                menteeId,
                status: { $in: ['scheduled', 'completed'] }
            });
            if (!hasBooking) {
                res.status(403).json({
                    success: false,
                    error: 'You can only message mentees who have booked a session with you'
                });
                return;
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
            // TODO: Send notification to mentee about new message
            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: {
                    message
                }
            });
        }
        catch (error) {
            console.error('Error sending message to mentee:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while sending message'
            });
        }
    }),
    /**
     * Get public list of mentors with filters
     * @route GET /api/mentor/public/mentors
     */
    getPublicMentorList: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { skills, languages, country, minHourlyRate, maxHourlyRate, search, page = '1', limit = '10' } = req.query;
            // Parse filters
            const filters = {};
            if (skills) {
                filters.skills = Array.isArray(skills) ? skills : [skills];
            }
            if (languages) {
                filters.languages = Array.isArray(languages) ? languages : [languages];
            }
            if (country) {
                filters.country = country;
            }
            if (minHourlyRate && !isNaN(Number(minHourlyRate))) {
                filters.minHourlyRate = Number(minHourlyRate);
            }
            if (maxHourlyRate && !isNaN(Number(maxHourlyRate))) {
                filters.maxHourlyRate = Number(maxHourlyRate);
            }
            if (search) {
                filters.search = search;
            }
            // Parse pagination params
            const pageNumber = parseInt(page) || 1;
            const limitNumber = parseInt(limit) || 10;
            // Get mentors from service
            const result = yield mentorService_1.mentorService.getMentors(filters, pageNumber, limitNumber);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Error fetching public mentor list:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching mentors'
            });
        }
    }),
    /**
     * Get public mentor profile by ID
     * @route GET /api/mentor/public/:mentorId
     */
    getPublicMentorProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            const mentorId = req.params.mentorId;
            // Validate mentor ID
            if (!mongoose_1.default.Types.ObjectId.isValid(mentorId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid mentor ID format'
                });
                return;
            }
            // Get mentor profile
            const mentor = yield User_1.User.findOne({
                _id: mentorId,
                role: 'mentor',
                'mentorProfile.isVerified': true
            }).select('fullName email profileImage mentorProfile.title mentorProfile.bio mentorProfile.hourlyRate ' +
                'mentorProfile.country mentorProfile.skills mentorProfile.languages mentorProfile.professionalInfo ' +
                'mentorProfile.mentorRating mentorProfile.mentorReviewsCount mentorProfile.menteesCount mentorProfile.sessionsCount');
            if (!mentor) {
                res.status(404).json({
                    success: false,
                    error: 'Mentor not found or not verified'
                });
                return;
            }
            // Get mentor reviews
            const reviews = yield MentorshipBooking_1.MentorshipBooking.find({
                mentorId,
                status: 'completed',
                'feedback.rating': { $exists: true, $ne: null }
            })
                .select('feedback.rating feedback.comment feedback.submittedAt menteeId')
                .populate('menteeId', 'fullName profileImage')
                .sort({ 'feedback.submittedAt': -1 })
                .limit(10);
            // Transform mentor data for public view
            const publicMentorProfile = {
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
                },
                reviews: reviews.map(review => ({
                    rating: review.feedback.rating,
                    comment: review.feedback.comment,
                    date: review.feedback.submittedAt,
                    mentee: {
                        id: review.menteeId._id,
                        fullName: review.menteeId.fullName,
                        profileImage: review.menteeId.profileImage
                    }
                }))
            };
            res.status(200).json({
                success: true,
                data: publicMentorProfile
            });
        }
        catch (error) {
            console.error('Error fetching public mentor profile:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching mentor profile'
            });
        }
    }),
    /**
     * Get complete mentor profile by ID (includes experience and academic background)
     * @route GET /api/mentor/private/:mentorId
     */
    getCompleteMentorProfile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        try {
            const mentorId = req.params.mentorId;
            // Validate mentor ID
            if (!mongoose_1.default.Types.ObjectId.isValid(mentorId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid mentor ID format'
                });
                return;
            }
            // Get complete mentor profile including professional info
            const mentor = yield User_1.User.findOne({
                _id: mentorId,
                role: 'mentor',
                'mentorProfile.isVerified': true
            }).select('fullName email profileImage mentorProfile.title mentorProfile.bio mentorProfile.hourlyRate ' +
                'mentorProfile.country mentorProfile.skills mentorProfile.languages mentorProfile.professionalInfo ' +
                'mentorProfile.mentorRating mentorProfile.mentorReviewsCount mentorProfile.menteesCount mentorProfile.sessionsCount');
            if (!mentor) {
                res.status(404).json({
                    success: false,
                    error: 'Mentor not found or not verified'
                });
                return;
            }
            // Get mentor reviews
            const reviews = yield MentorshipBooking_1.MentorshipBooking.find({
                mentorId,
                status: 'completed',
                'feedback.rating': { $exists: true, $ne: null }
            })
                .select('feedback.rating feedback.comment feedback.submittedAt menteeId')
                .populate('menteeId', 'fullName profileImage')
                .sort({ 'feedback.submittedAt': -1 })
                .limit(10);
            // Transform mentor data for complete view including professional info
            const completeMentorProfile = {
                id: mentor._id,
                fullName: mentor.fullName,
                profileImage: mentor.profileImage,
                title: (_a = mentor.mentorProfile) === null || _a === void 0 ? void 0 : _a.title,
                bio: (_b = mentor.mentorProfile) === null || _b === void 0 ? void 0 : _b.bio,
                hourlyRate: (_c = mentor.mentorProfile) === null || _c === void 0 ? void 0 : _c.hourlyRate,
                country: (_d = mentor.mentorProfile) === null || _d === void 0 ? void 0 : _d.country,
                skills: (_e = mentor.mentorProfile) === null || _e === void 0 ? void 0 : _e.skills,
                languages: (_f = mentor.mentorProfile) === null || _f === void 0 ? void 0 : _f.languages,
                professionalInfo: {
                    role: (_h = (_g = mentor.mentorProfile) === null || _g === void 0 ? void 0 : _g.professionalInfo) === null || _h === void 0 ? void 0 : _h.role,
                    linkedIn: (_k = (_j = mentor.mentorProfile) === null || _j === void 0 ? void 0 : _j.professionalInfo) === null || _k === void 0 ? void 0 : _k.linkedIn,
                    experience: (_m = (_l = mentor.mentorProfile) === null || _l === void 0 ? void 0 : _l.professionalInfo) === null || _m === void 0 ? void 0 : _m.experience,
                    academicBackground: (_p = (_o = mentor.mentorProfile) === null || _o === void 0 ? void 0 : _o.professionalInfo) === null || _p === void 0 ? void 0 : _p.academicBackground
                },
                stats: {
                    rating: (_q = mentor.mentorProfile) === null || _q === void 0 ? void 0 : _q.mentorRating,
                    reviewsCount: (_r = mentor.mentorProfile) === null || _r === void 0 ? void 0 : _r.mentorReviewsCount,
                    menteesCount: (_s = mentor.mentorProfile) === null || _s === void 0 ? void 0 : _s.menteesCount,
                    sessionsCount: (_t = mentor.mentorProfile) === null || _t === void 0 ? void 0 : _t.sessionsCount
                },
                reviews: reviews.map(review => ({
                    rating: review.feedback.rating,
                    comment: review.feedback.comment,
                    date: review.feedback.submittedAt,
                    mentee: {
                        id: review.menteeId._id,
                        fullName: review.menteeId.fullName,
                        profileImage: review.menteeId.profileImage
                    }
                }))
            };
            res.status(200).json({
                success: true,
                data: completeMentorProfile
            });
        }
        catch (error) {
            console.error('Error fetching complete mentor profile:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while fetching complete mentor profile'
            });
        }
    }),
    /**
     * Chat with AI Mentor
     * @route POST /api/mentor/ai/chat
     */
    mentorAiChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const userId = req.user._id.toString();
            const { message, threadId, mentorId } = req.body;
            if (!message || message.trim() === '') {
                res.status(400).json({ success: false, error: 'Message is required' });
                return;
            }
            const response = yield (0, mentorAiService_1.chatWithMentor)(userId, message, threadId, mentorId);
            res.status(200).json({
                success: true,
                data: response
            });
        }
        catch (error) {
            console.error('Error in mentor AI chat:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while chatting with mentor AI'
            });
        }
    }),
    /**
     * Get mentor AI system statistics (for monitoring)
     * @route GET /api/mentor/ai/stats
     */
    getMentorAiStats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const stats = yield (0, mentorAiService_1.getMentorSystemStats)();
            res.status(200).json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error getting mentor AI stats:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while getting mentor AI stats'
            });
        }
    }),
    /**
     * Preload popular mentor content (for performance optimization)
     * @route POST /api/mentor/ai/preload
     */
    preloadMentorContent: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            yield (0, mentorAiService_1.preloadPopularMentorContent)();
            res.status(200).json({
                success: true,
                message: 'Popular mentor content preloaded successfully'
            });
        }
        catch (error) {
            console.error('Error preloading mentor content:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while preloading mentor content'
            });
        }
    }),
    /**
     * Clear mentor search cache
     * @route DELETE /api/mentor/ai/cache
     */
    clearMentorCache: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const { pattern } = req.query;
            yield (0, mentorAiService_1.invalidateMentorSearchCache)(pattern);
            res.status(200).json({
                success: true,
                message: pattern
                    ? `Mentor search cache cleared for pattern: ${pattern}`
                    : 'All mentor search cache cleared successfully'
            });
        }
        catch (error) {
            console.error('Error clearing mentor cache:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while clearing mentor cache'
            });
        }
    }),
    /**
     * Clear mentor thread for user (for testing and troubleshooting)
     * @route DELETE /api/mentor/ai/threads/:userId
     */
    clearMentorThread: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'User not authenticated' });
                return;
            }
            const { userId } = req.params;
            const { mentorId } = req.query;
            // Allow users to clear their own threads or admin to clear any
            if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
                res.status(403).json({
                    success: false,
                    error: 'You can only clear your own mentor threads'
                });
                return;
            }
            yield (0, mentorAiService_1.clearMentorThreadForUser)(userId, mentorId);
            res.status(200).json({
                success: true,
                message: mentorId
                    ? `Mentor thread cleared for user ${userId} with mentor ${mentorId}`
                    : `General mentor thread cleared for user ${userId}`
            });
        }
        catch (error) {
            console.error('Error clearing mentor thread:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'An error occurred while clearing mentor thread'
            });
        }
    }),
};
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
