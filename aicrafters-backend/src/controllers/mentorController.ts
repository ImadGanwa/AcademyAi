import { Request, Response } from 'express';
import { User } from '../models/User';
import { MentorshipBooking } from '../models/MentorshipBooking';
import { MentorMessage } from '../models/MentorMessage';
import { MentorApplication } from '../models/MentorApplication';
import mongoose from 'mongoose';
import { mentorService } from '../services/mentorService';
import { notificationService } from '../services/notificationService';
import { processNamedItems } from '../utils/mentorUtils';
import { uploadToCloudinary } from '../utils/fileUpload';

export const mentorController = {
  /**
   * Apply to become a mentor
   * @route POST /api/mentor/apply
   */
  applyToBecomeMentor: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        fullName,
        email,
        bio,
        hourlyRate,
        expertise,
        languages,
        education,
        experience,
        availability,
        socialLinks,
        professionalInfo,
        preferences,
        countries
      } = req.body;

      // Validate required fields
      if (!email || !fullName || !bio || !expertise || !expertise.length) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: email, fullName, bio, and expertise are required'
        });
        return;
      }

      // Create application record without linking to user yet
      const applicationData = {
        fullName,
        email,
        bio,
        expertise,
        experience,
        hourlyRate: Number(hourlyRate) || 0,
        languages: languages || [],
        availability: availability || {},
        professionalInfo: professionalInfo || {},
        preferences: preferences || {},
        countries: countries || [],
        appliedAt: new Date(),
        status: 'pending'
      };

      // Store the application data in the MentorApplication model
      const application = new MentorApplication(applicationData);
      await application.save();
      
      // Send notification to admins
      try {
        await notificationService.notifyAdmins({
          title: 'New Mentor Application',
          message: `${fullName} has applied to become a mentor.`,
          type: 'mentor_application',
          data: {
            userEmail: email,
            userName: fullName
          }
        });
      } catch (notifyError) {
        console.error('Failed to send admin notification:', notifyError);
        // Continue anyway since this is not critical
      }

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Mentor application submitted successfully',
        data: {
          applicationDate: applicationData.appliedAt,
          status: 'pending'
        }
      });

    } catch (error: any) {
      console.error('Error in mentor application:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An error occurred during the mentor application process'
      });
    }
  },

  /**
   * Get mentor profile
   * @route GET /api/mentor/profile
   */
  getMentorProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const userId = req.user._id;

      // Check if user exists and is a mentor or has a pending application
      const user = await User.findById(userId);
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
      } else if (user.mentorProfile && user.mentorProfile.appliedAt) {
        applicationStatus = 'pending';
      }

      // Return user's mentor profile with additional user data
      res.status(200).json({
        success: true,
        data: {
          profile: user.mentorProfile,
          status: applicationStatus,
          isVerified: user.mentorProfile?.isVerified || false,
          fullName: user.fullName,
          email: user.email,
          profileImage: user.profileImage
        }
      });
    } catch (error: any) {
      console.error('Error getting mentor profile:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while retrieving mentor profile' 
      });
    }
  },

  /**
   * Update mentor profile
   * @route PUT /api/mentor/profile
   */
  updateMentorProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const userId = req.user._id;
      const {
        title,
        bio,
        hourlyRate,
        skills,
        languages,
        education,
        experience,
        socialLinks,
        country,
        removeProfileImage
      } = req.body;

      // Add detailed logging for skills
      console.log('Received skills in request body:', skills);
      console.log('Skills type:', typeof skills);
      
      // Log the raw request body for debugging
      console.log('Raw request body:', req.body);

      // Check if user exists and has a mentor profile
      const user = await User.findById(userId);
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
          profileImageUrl = await uploadToCloudinary(req.file, 'profile-images');
          console.log(`Uploaded new profile image: ${profileImageUrl}`);
        } catch (uploadError: any) {
          console.error('Error uploading profile image:', uploadError);
          res.status(500).json({ 
            success: false, 
            error: uploadError.message || 'Failed to upload profile image'
          });
          return;
        }
      } else if (removeProfileImage === 'true') {
        // If removeProfileImage flag is set, explicitly set profileImageUrl to empty string
        // This will clear the profile image in the database
        profileImageUrl = '';
      }
      
      // Process skills and languages to ensure they have proper IDs
      let parsedSkills;
      if (skills) {
        try {
          // If skills is a string (JSON), parse it
          if (typeof skills === 'string') {
            parsedSkills = JSON.parse(skills);
            console.log('Parsed skills from JSON string:', parsedSkills);
          } else {
            parsedSkills = skills;
            console.log('Skills was already an object/array:', parsedSkills);
          }
        } catch (e) {
          console.error('Error parsing skills:', e);
          parsedSkills = skills; // Use as is if parsing fails
        }
      }
      
      const processedSkills = parsedSkills !== undefined ? processNamedItems(parsedSkills) : undefined;
      console.log('Processed skills after processNamedItems:', processedSkills);
      
      const processedLanguages = languages !== undefined ? processNamedItems(languages) : undefined;
      
      // Prepare update object with only provided fields
      const updateFields: any = {};

      if (title !== undefined) updateFields['mentorProfile.title'] = title;
      if (bio !== undefined) updateFields['mentorProfile.bio'] = bio;
      if (hourlyRate !== undefined) updateFields['mentorProfile.hourlyRate'] = hourlyRate;
      if (country !== undefined) updateFields['mentorProfile.country'] = country;
      if (processedSkills !== undefined) updateFields['mentorProfile.skills'] = processedSkills;
      if (processedLanguages !== undefined) updateFields['mentorProfile.languages'] = processedLanguages;
      if (education !== undefined) updateFields['mentorProfile.education'] = education;
      if (experience !== undefined) updateFields['mentorProfile.experience'] = experience;
      if (socialLinks !== undefined) updateFields['mentorProfile.socialLinks'] = socialLinks;
      if (profileImageUrl !== undefined) updateFields['profileImage'] = profileImageUrl;

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
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        res.status(404).json({ success: false, error: 'Failed to update mentor profile' });
        return;
      }

      console.log('Updated user skills:', updatedUser.mentorProfile?.skills);

      // Return updated profile
      res.status(200).json({
        success: true,
        message: 'Mentor profile updated successfully',
        data: {
          profile: updatedUser.mentorProfile,
          profileImage: updatedUser.profileImage
        }
      });
    } catch (error: any) {
      console.error('Error updating mentor profile:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while updating mentor profile' 
      });
    }
  },

  /**
   * Get mentor availability
   * @route GET /api/mentor/availability
   */
  getMentorAvailability: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const userId = req.user._id;

      // Fetch user with mentor profile
      const user = await User.findById(userId).select('mentorProfile.availability role');
      
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
          availability: user.mentorProfile?.availability || []
        }
      });
    } catch (error: any) {
      console.error('Error getting mentor availability:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while retrieving mentor availability' 
      });
    }
  },

  /**
   * Update mentor availability
   * @route PUT /api/mentor/availability
   */
  updateMentorAvailability: async (req: Request, res: Response): Promise<void> => {
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
          } else {
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
      const user = await User.findById(userId);
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
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { 'mentorProfile.availability': uniqueAvailability } },
        { new: true }
      );

      if (!updatedUser) {
        res.status(404).json({ success: false, error: 'Failed to update availability' });
        return;
      }

      // Return updated availability
      res.status(200).json({
        success: true,
        message: 'Mentor availability updated successfully',
        data: {
          availability: updatedUser.mentorProfile?.availability || []
        }
      });
    } catch (error: any) {
      console.error('Error updating mentor availability:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while updating mentor availability' 
      });
    }
  },

  /**
   * Get all conversations for a mentor
   * @route GET /api/mentor/messages
   */
  getMentorConversations: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const mentorId = req.user._id;
      
      // Find all unique mentees that have messages with this mentor
      const uniqueMentees = await MentorMessage.aggregate([
        { $match: { mentorId: new mongoose.Types.ObjectId(mentorId.toString()) } },
        { $group: { _id: '$menteeId' } }
      ]);
      
      const menteeIds = uniqueMentees.map(item => item._id);
      
      // Get the latest message and unread count for each conversation
      const conversations = await Promise.all(
        menteeIds.map(async (menteeId) => {
          // Get latest message
          const latestMessage = await MentorMessage.findOne({
            mentorId,
            menteeId
          }).sort({ createdAt: -1 }).exec();
          
          // Get unread count
          const unreadCount = await MentorMessage.countDocuments({
            mentorId,
            menteeId,
            sender: 'mentee',
            isRead: false
          });
          
          // Get mentee info
          const mentee = await User.findById(menteeId)
            .select('fullName profileImage email')
            .exec();
          
          return {
            menteeId,
            mentee,
            latestMessage,
            unreadCount
          };
        })
      );
      
      // Sort by latest message date
      conversations.sort((a, b) => {
        const timeA = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
        const timeB = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      
      res.status(200).json({
        success: true,
        data: {
          conversations
        }
      });
    } catch (error: any) {
      console.error('Error getting mentor conversations:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while fetching conversations'
      });
    }
  },

  /**
   * Get messages with a specific mentee
   * @route GET /api/mentor/messages/:menteeId
   */
  getMentorMenteeMessages: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const mentorId = req.user._id;
      const menteeId = req.params.menteeId;
      const limit = parseInt(req.query.limit as string) || 50;
      const page = parseInt(req.query.page as string) || 1;
      const skip = (page - 1) * limit;
      
      // Validate mentee ID
      if (!mongoose.Types.ObjectId.isValid(menteeId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid mentee ID format'
        });
        return;
      }
      
      // Get messages between mentor and mentee
      const messages = await MentorMessage.find({
        mentorId,
        menteeId
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
      // Get total count for pagination
      const total = await MentorMessage.countDocuments({
        mentorId,
        menteeId
      });
      
      // Mark unread messages as read
      await MentorMessage.updateMany(
        {
          mentorId,
          menteeId,
          sender: 'mentee',
          isRead: false
        },
        { $set: { isRead: true } }
      );
      
      // Get mentee info
      const mentee = await User.findById(menteeId)
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
    } catch (error: any) {
      console.error('Error getting mentor-mentee messages:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while fetching messages'
      });
    }
  },

  /**
   * Send a message to a mentee
   * @route POST /api/mentor/messages/:menteeId
   */
  sendMenteeMessage: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'User not authenticated' });
        return;
      }

      const mentorId = req.user._id;
      const menteeId = req.params.menteeId;
      const { content } = req.body;
      
      // Validate mentee ID
      if (!mongoose.Types.ObjectId.isValid(menteeId)) {
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
      const mentee = await User.findById(menteeId);
      if (!mentee) {
        res.status(404).json({
          success: false,
          error: 'Mentee not found'
        });
        return;
      }
      
      // Check if there's a booking relationship between mentor and mentee
      const hasBooking = await MentorshipBooking.exists({
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
      const message = new MentorMessage({
        mentorId,
        menteeId,
        sender: 'mentor',
        content,
        isRead: false
      });
      
      await message.save();
      
      // TODO: Send notification to mentee about new message
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          message
        }
      });
    } catch (error: any) {
      console.error('Error sending message to mentee:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while sending message'
      });
    }
  },

  /**
   * Get public list of mentors with filters
   * @route GET /api/mentor/public/mentors
   */
  getPublicMentorList: async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        skills, 
        languages, 
        country,
        minHourlyRate, 
        maxHourlyRate,
        search, 
        page = '1', 
        limit = '10' 
      } = req.query;
      
      // Parse filters
      const filters: any = {};
      
      if (skills) {
        filters.skills = Array.isArray(skills) ? skills : [skills];
      }
      
      if (languages) {
        filters.languages = Array.isArray(languages) ? languages : [languages];
      }
      
      if (country) {
        filters.country = country as string;
      }
      
      if (minHourlyRate && !isNaN(Number(minHourlyRate))) {
        filters.minHourlyRate = Number(minHourlyRate);
      }
      
      if (maxHourlyRate && !isNaN(Number(maxHourlyRate))) {
        filters.maxHourlyRate = Number(maxHourlyRate);
      }
      
      if (search) {
        filters.search = search as string;
      }
      
      // Parse pagination params
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      
      // Get mentors from service
      const result = await mentorService.getMentors(filters, pageNumber, limitNumber);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error fetching public mentor list:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while fetching mentors'
      });
    }
  },

  /**
   * Get public mentor profile by ID
   * @route GET /api/mentor/public/:mentorId
   */
  getPublicMentorProfile: async (req: Request, res: Response): Promise<void> => {
    try {
      const mentorId = req.params.mentorId;
      
      // Validate mentor ID
      if (!mongoose.Types.ObjectId.isValid(mentorId)) {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid mentor ID format'
        });
        return;
      }
      
      // Get mentor profile
      const mentor = await User.findOne({
        _id: mentorId,
        role: 'mentor',
        'mentorProfile.isVerified': true
      }).select(
        'fullName email profileImage mentorProfile.title mentorProfile.bio mentorProfile.hourlyRate ' +
        'mentorProfile.skills mentorProfile.languages mentorProfile.education mentorProfile.experience ' +
        'mentorProfile.availability mentorProfile.socialLinks mentorProfile.mentorRating ' +
        'mentorProfile.mentorReviewsCount mentorProfile.menteesCount mentorProfile.sessionsCount'
      );
      
      if (!mentor) {
        res.status(404).json({
          success: false,
          error: 'Mentor not found or not verified'
        });
        return;
      }
      
      // Get mentor reviews
      const reviews = await MentorshipBooking.find({
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
        title: mentor.mentorProfile?.title,
        bio: mentor.mentorProfile?.bio,
        hourlyRate: mentor.mentorProfile?.hourlyRate,
        skills: mentor.mentorProfile?.skills,
        languages: mentor.mentorProfile?.languages,
        education: mentor.mentorProfile?.education,
        experience: mentor.mentorProfile?.experience,
        availability: mentor.mentorProfile?.availability,
        socialLinks: mentor.mentorProfile?.socialLinks,
        stats: {
          rating: mentor.mentorProfile?.mentorRating,
          reviewsCount: mentor.mentorProfile?.mentorReviewsCount,
          menteesCount: mentor.mentorProfile?.menteesCount,
          sessionsCount: mentor.mentorProfile?.sessionsCount
        },
        reviews: reviews.map(review => ({
          rating: review.feedback.rating,
          comment: review.feedback.comment,
          date: review.feedback.submittedAt,
          mentee: {
            id: review.menteeId._id,
            fullName: (review.menteeId as any).fullName,
            profileImage: (review.menteeId as any).profileImage
          }
        }))
      };
      
      res.status(200).json({
        success: true,
        data: publicMentorProfile
      });
    } catch (error: any) {
      console.error('Error fetching public mentor profile:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while fetching mentor profile'
      });
    }
  },
};

// Helper function to get the Monday of a week for a given date
const getMondayOfWeek = (date: Date | string): string => {
  const dateObj = new Date(date);
  const day = dateObj.getDay() || 7; // Convert Sunday (0) to 7
  const diff = dateObj.getDate() - day + 1; // 1 = Monday
  const mondayDate = new Date(dateObj);
  mondayDate.setDate(diff);
  
  // Format as YYYY-MM-DD
  return mondayDate.toISOString().split('T')[0];
}; 