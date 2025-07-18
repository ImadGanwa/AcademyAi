import { User } from '../models/User';
import { MentorshipBooking } from '../models/MentorshipBooking';
import { MentorMessage } from '../models/MentorMessage';
import mongoose from 'mongoose';
import { processNamedItems } from '../utils/mentorUtils';

interface MentorProfile {
  title: string;
  bio: string;
  hourlyRate: number;
  skills: Array<{
    id: string;
    name: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
  }>;
  experience: Array<{
    company: string;
    position: string;
    description: string;
    startYear: number;
    endYear: number | null;
  }>;
  availability?: Array<{
    day: number;
    startTime: string;
    endTime: string;
  }>;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

interface MentorProfileUpdate {
  title?: string;
  bio?: string;
  hourlyRate?: number;
  skills?: Array<string | { id?: string; name: string }>;
  languages?: Array<string | { id?: string; name: string }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
  }>;
  experience?: Array<{
    company: string;
    position: string;
    description: string;
    startYear: number;
    endYear: number | null;
  }>;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export const mentorService = {
  /**
   * Process a mentor application
   */
  processMentorApplication: async (userId: mongoose.Types.ObjectId, profileData: MentorProfile): Promise<boolean> => {
    try {
      // Validate mentor profile data
      if (!validateMentorProfile(profileData)) {
        throw new Error('Invalid mentor profile data');
      }

      // Check if user exists and is not already a mentor
      const user = await User.findById(userId);
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
      const mentorProfile = {
        ...profileData,
        availability: profileData.availability || [],
        socialLinks: profileData.socialLinks || {},
        isVerified: false,
        menteesCount: 0,
        sessionsCount: 0,
        mentorRating: 0,
        mentorReviewsCount: 0,
        appliedAt: new Date(),
        approvedAt: null
      };

      // Update user with mentor profile
      await User.findByIdAndUpdate(userId, {
        mentorProfile
      });

      return true;
    } catch (error) {
      console.error('Error processing mentor application:', error);
      throw error;
    }
  },

  /**
   * Get mentor profile by user ID
   */
  getMentorProfile: async (userId: mongoose.Types.ObjectId) => {
    try {
      const user = await User.findById(userId).select('-password');
      
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
      } else if (user.mentorProfile && user.mentorProfile.appliedAt) {
        applicationStatus = 'pending';
      }
      
      return {
        profile: user.mentorProfile,
        status: applicationStatus,
        isVerified: user.mentorProfile?.isVerified || false,
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage
      };
    } catch (error) {
      console.error('Error getting mentor profile:', error);
      throw error;
    }
  },

  /**
   * Update mentor profile
   */
  updateMentorProfile: async (userId: mongoose.Types.ObjectId, profileUpdate: MentorProfileUpdate) => {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Validate if user is a mentor or has applied to be one
      if (user.role !== 'mentor' && !user.mentorProfile) {
        throw new Error('User is not a mentor and has not applied to be one');
      }
      
      // Process skills and languages to ensure they have proper IDs
      const processedSkills = profileUpdate.skills !== undefined ? processNamedItems(profileUpdate.skills) : undefined;
      const processedLanguages = profileUpdate.languages !== undefined ? processNamedItems(profileUpdate.languages) : undefined;
      
      // Create update object
      const updateFields: any = {};
      
      if (profileUpdate.title !== undefined) updateFields['mentorProfile.title'] = profileUpdate.title;
      if (profileUpdate.bio !== undefined) updateFields['mentorProfile.bio'] = profileUpdate.bio;
      if (profileUpdate.hourlyRate !== undefined) updateFields['mentorProfile.hourlyRate'] = profileUpdate.hourlyRate;
      if (processedSkills !== undefined) updateFields['mentorProfile.skills'] = processedSkills;
      if (processedLanguages !== undefined) updateFields['mentorProfile.languages'] = processedLanguages;
      if (profileUpdate.education !== undefined) updateFields['mentorProfile.education'] = profileUpdate.education;
      if (profileUpdate.experience !== undefined) updateFields['mentorProfile.experience'] = profileUpdate.experience;
      if (profileUpdate.socialLinks !== undefined) updateFields['mentorProfile.socialLinks'] = profileUpdate.socialLinks;
      
      // Validate if there's anything to update
      if (Object.keys(updateFields).length === 0) {
        throw new Error('No valid fields to update');
      }
      
      // Perform update
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        throw new Error('Failed to update mentor profile');
      }
      
      return updatedUser.mentorProfile;
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      throw error;
    }
  },

  /**
   * Update mentor availability
   */
  updateMentorAvailability: async (
    userId: mongoose.Types.ObjectId, 
    availability: Array<{ day: number; startTime: string; endTime: string }>
  ) => {
    try {
      // Validate availability format
      if (!validateAvailability(availability)) {
        throw new Error('Invalid availability format');
      }
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Validate if user is a mentor or has applied to be one
      if (user.role !== 'mentor' && !user.mentorProfile) {
        throw new Error('User is not a mentor and has not applied to be one');
      }
      
      // Update availability
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { 'mentorProfile.availability': availability } },
        { new: true }
      ).select('mentorProfile.availability');
      
      if (!updatedUser) {
        throw new Error('Failed to update availability');
      }
      
      return updatedUser.mentorProfile?.availability || [];
    } catch (error) {
      console.error('Error updating mentor availability:', error);
      throw error;
    }
  },

  /**
   * Approve a mentor application
   */
  approveMentorApplication: async (userId: mongoose.Types.ObjectId, adminId: mongoose.Types.ObjectId): Promise<boolean> => {
    try {
      // Find user and check if they have applied
      const user = await User.findById(userId);
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
      await User.findByIdAndUpdate(userId, {
        role: 'mentor',
        'mentorProfile.approvedAt': new Date(),
        'mentorProfile.isVerified': true
      });

      // TODO: Send notification to user about approval
      // TODO: Log admin action for audit trail

      return true;
    } catch (error) {
      console.error('Error approving mentor application:', error);
      throw error;
    }
  },

  /**
   * Reject a mentor application
   */
  rejectMentorApplication: async (userId: mongoose.Types.ObjectId, adminId: mongoose.Types.ObjectId, reason: string): Promise<boolean> => {
    try {
      // Find user and check if they have applied
      const user = await User.findById(userId);
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
      await User.findByIdAndUpdate(userId, {
        $unset: { mentorProfile: 1 }
      });

      // TODO: Send notification to user about rejection with reason
      // TODO: Log admin action for audit trail

      return true;
    } catch (error) {
      console.error('Error rejecting mentor application:', error);
      throw error;
    }
  },

  /**
   * Get all mentors (with optional filters)
   */
  getMentors: async (filters: any = {}, page: number = 1, limit: number = 10) => {
    try {
      const query: any = { role: 'mentor' };
      
      // Apply filters if provided
      if (filters.skills && filters.skills.length > 0) {
        query['mentorProfile.skills.name'] = { $in: filters.skills };
      }
      
      if (filters.languages && filters.languages.length > 0) {
        query['mentorProfile.languages.name'] = { $in: filters.languages };
      }
      
      if (filters.minHourlyRate !== undefined) {
        query['mentorProfile.hourlyRate'] = { $gte: filters.minHourlyRate };
      }
      
      if (filters.maxHourlyRate !== undefined) {
        if (query['mentorProfile.hourlyRate']) {
          query['mentorProfile.hourlyRate'].$lte = filters.maxHourlyRate;
        } else {
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
      const mentors = await User.find(query)
        .select('fullName email profileImage mentorProfile')
        .sort({ 'mentorProfile.mentorRating': -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      
      // Get total count for pagination
      const total = await User.countDocuments(query);

      // Transform mentor data for public view
      const transformedMentors = mentors.map(mentor => ({
        id: mentor._id,
        fullName: mentor.fullName,
        profileImage: mentor.profileImage,
        title: mentor.mentorProfile?.title,
        bio: mentor.mentorProfile?.bio,
        hourlyRate: mentor.mentorProfile?.hourlyRate,
        skills: mentor.mentorProfile?.skills,
        languages: mentor.mentorProfile?.languages,
        stats: {
          rating: mentor.mentorProfile?.mentorRating,
          reviewsCount: mentor.mentorProfile?.mentorReviewsCount,
          menteesCount: mentor.mentorProfile?.menteesCount,
          sessionsCount: mentor.mentorProfile?.sessionsCount
        }
      }));
      
      return {
        mentors: transformedMentors,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting mentors:', error);
      throw error;
    }
  },

  /**
   * Get bookings for a mentor
   */
  getMentorBookings: async (
    mentorId: mongoose.Types.ObjectId,
    filters: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) => {
    try {
      // Build filter object
      const filter: any = { mentorId };
      
      // Add status filter if provided
      if (filters.status && ['scheduled', 'completed', 'cancelled', 'no-show'].includes(filters.status)) {
        filter.status = filters.status;
      }
      
      // Add date range filter if provided
      if (filters.startDate || filters.endDate) {
        filter.scheduledAt = {};
        if (filters.startDate) filter.scheduledAt.$gte = filters.startDate;
        if (filters.endDate) filter.scheduledAt.$lte = filters.endDate;
      }
      
      // Get bookings for the mentor
      const bookings = await MentorshipBooking.find(filter)
        .sort({ scheduledAt: -1 })
        .populate('menteeId', 'fullName email profileImage')
        .exec();
      
      return bookings;
    } catch (error) {
      console.error('Error getting mentor bookings:', error);
      throw error;
    }
  },

  /**
   * Get a specific booking by ID for a mentor
   */
  getBookingById: async (mentorId: mongoose.Types.ObjectId, bookingId: string) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw new Error('Invalid booking ID format');
      }
      
      // Find booking with mentorId to ensure mentor can only access their bookings
      const booking = await MentorshipBooking.findOne({
        _id: bookingId,
        mentorId
      }).populate('menteeId', 'fullName email profileImage').exec();
      
      if (!booking) {
        throw new Error('Booking not found or you do not have permission to view it');
      }
      
      return booking;
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      throw error;
    }
  },

  /**
   * Update a booking
   */
  updateBooking: async (
    mentorId: mongoose.Types.ObjectId,
    bookingId: string,
    updateData: {
      notes?: {
        mentorNotes?: string;
        sharedNotes?: string;
      };
      meetingLink?: string;
    }
  ) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw new Error('Invalid booking ID format');
      }
      
      // Find booking with mentorId to ensure mentor can only update their bookings
      const booking = await MentorshipBooking.findOne({
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
      const updateFields: any = {};
      
      if (updateData.notes?.mentorNotes !== undefined) {
        updateFields['notes.mentorNotes'] = updateData.notes.mentorNotes;
      }
      
      if (updateData.notes?.sharedNotes !== undefined) {
        updateFields['notes.sharedNotes'] = updateData.notes.sharedNotes;
      }
      
      if (updateData.meetingLink !== undefined) {
        updateFields.meetingLink = updateData.meetingLink;
      }
      
      // Perform the update
      const updatedBooking = await MentorshipBooking.findByIdAndUpdate(
        bookingId,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).populate('menteeId', 'fullName email profileImage');
      
      if (!updatedBooking) {
        throw new Error('Failed to update booking');
      }
      
      return updatedBooking;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  /**
   * Complete a booking
   */
  completeBooking: async (
    mentorId: mongoose.Types.ObjectId,
    bookingId: string,
    notes?: {
      mentorNotes?: string;
      sharedNotes?: string;
    }
  ) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw new Error('Invalid booking ID format');
      }
      
      // Find booking with mentorId to ensure mentor can only complete their bookings
      const booking = await MentorshipBooking.findOne({
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
      const updateFields: any = {
        status: 'completed'
      };
      
      if (notes?.mentorNotes) {
        updateFields['notes.mentorNotes'] = notes.mentorNotes;
      }
      
      if (notes?.sharedNotes) {
        updateFields['notes.sharedNotes'] = notes.sharedNotes;
      }
      
      // Complete the booking
      const completedBooking = await MentorshipBooking.findByIdAndUpdate(
        bookingId,
        { $set: updateFields },
        { new: true }
      ).populate('menteeId', 'fullName email profileImage');
      
      if (!completedBooking) {
        throw new Error('Failed to complete booking');
      }
      
      // Increment sessions count for mentor
      await User.findByIdAndUpdate(
        mentorId,
        { $inc: { 'mentorProfile.sessionsCount': 1 } }
      );
      
      return completedBooking;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (
    mentorId: mongoose.Types.ObjectId,
    bookingId: string,
    cancelReason: string
  ) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw new Error('Invalid booking ID format');
      }
      
      if (!cancelReason) {
        throw new Error('Cancellation reason is required');
      }
      
      // Find booking with mentorId to ensure mentor can only cancel their bookings
      const booking = await MentorshipBooking.findOne({
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
      const cancelledBooking = await MentorshipBooking.findByIdAndUpdate(
        bookingId,
        { 
          $set: { 
            status: 'cancelled',
            'notes.mentorNotes': `Cancelled by mentor. Reason: ${cancelReason}`
          } 
        },
        { new: true }
      ).populate('menteeId', 'fullName email profileImage');
      
      if (!cancelledBooking) {
        throw new Error('Failed to cancel booking');
      }
      
      return cancelledBooking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },

  /**
   * Get mentor conversations
   */
  getMentorConversations: async (mentorId: mongoose.Types.ObjectId) => {
    try {
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
      return conversations.sort((a, b) => {
        // Handle null latestMessage gracefully
        const timeA = a.latestMessage?.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
        const timeB = b.latestMessage?.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Error getting mentor conversations:', error);
      throw error;
    }
  },

  /**
   * Get messages between mentor and mentee
   */
  getMentorMenteeMessages: async (
    mentorId: mongoose.Types.ObjectId,
    menteeId: string,
    options: {
      limit?: number;
      page?: number;
    } = {}
  ) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(menteeId)) {
        throw new Error('Invalid mentee ID format');
      }
      
      const limit = options.limit || 50;
      const page = options.page || 1;
      const skip = (page - 1) * limit;
      
      // Get mentee info
      const mentee = await User.findById(menteeId)
        .select('fullName profileImage email')
        .exec();
      
      if (!mentee) {
        throw new Error('Mentee not found');
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
    } catch (error) {
      console.error('Error getting mentor-mentee messages:', error);
      throw error;
    }
  },

  /**
   * Send message from mentor to mentee
   */
  sendMenteeMessage: async (
    mentorId: mongoose.Types.ObjectId,
    menteeId: string,
    content: string
  ) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(menteeId)) {
        throw new Error('Invalid mentee ID format');
      }
      
      if (!content || content.trim() === '') {
        throw new Error('Message content is required');
      }
      
      // Verify mentee exists
      const mentee = await User.findById(menteeId);
      if (!mentee) {
        throw new Error('Mentee not found');
      }
      
      // Check if there's a booking relationship between mentor and mentee
      const hasBooking = await MentorshipBooking.exists({
        mentorId,
        menteeId,
        status: { $in: ['scheduled', 'completed'] }
      });
      
      if (!hasBooking) {
        throw new Error('You can only message mentees who have booked a session with you');
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
      
      return message;
    } catch (error) {
      console.error('Error sending message to mentee:', error);
      throw error;
    }
  }
};

/**
 * Helper function to validate mentor profile data
 */
function validateMentorProfile(profile: MentorProfile): boolean {
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
  
  // Validate education
  if (!profile.education || !Array.isArray(profile.education) || profile.education.length === 0) {
    return false;
  }
  
  // Validate education entries
  if (!profile.education.every(edu => 
    edu.institution && 
    edu.degree && 
    edu.field && 
    typeof edu.startYear === 'number')) {
    return false;
  }
  
  // Validate experience
  if (!profile.experience || !Array.isArray(profile.experience) || profile.experience.length === 0) {
    return false;
  }
  
  // Validate experience entries
  if (!profile.experience.every(exp => 
    exp.company && 
    exp.position && 
    exp.description && 
    typeof exp.startYear === 'number')) {
    return false;
  }
  
  return true;
}

/**
 * Helper function to validate availability format
 */
function validateAvailability(availability: Array<{ day: number; startTime: string; endTime: string }>): boolean {
  if (!Array.isArray(availability)) {
    return false;
  }
  
  return availability.every(slot => 
    typeof slot.day === 'number' && 
    slot.day >= 0 && 
    slot.day <= 6 &&
    typeof slot.startTime === 'string' && 
    typeof slot.endTime === 'string' &&
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime) &&
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime) &&
    slot.startTime < slot.endTime
  );
} 