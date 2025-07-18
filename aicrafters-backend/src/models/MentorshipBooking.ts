import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorshipBooking extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  topic: string;
  notes: {
    mentorNotes?: string;
    menteeNotes?: string;
    sharedNotes?: string;
  };
  feedback: {
    rating?: number;
    comment?: string;
    submittedAt?: Date;
  };
  meetingLink?: string;
  price: number;
  mentorAvailabilityId?: string; // Reference to specific availability slot
  createdAt: Date;
  updatedAt: Date;
}

// Add static methods interface
interface MentorshipBookingModel extends mongoose.Model<IMentorshipBooking> {
  checkForConflicts(
    mentorId: mongoose.Types.ObjectId,
    scheduledAt: Date,
    duration: number,
    excludeBookingId?: mongoose.Types.ObjectId
  ): Promise<boolean>;
  getUpcomingForMentor(
    mentorId: mongoose.Types.ObjectId,
    limit?: number
  ): Promise<IMentorshipBooking[]>;
  getUpcomingForMentee(
    menteeId: mongoose.Types.ObjectId,
    limit?: number
  ): Promise<IMentorshipBooking[]>;
}

const MentorshipBookingSchema = new Schema({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15, // Minimum 15 minutes
    default: 60 // Default 1 hour
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    mentorNotes: {
      type: String,
      trim: true
    },
    menteeNotes: {
      type: String,
      trim: true
    },
    sharedNotes: {
      type: String,
      trim: true
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date
    }
  },
  meetingLink: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mentorAvailabilityId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
MentorshipBookingSchema.index({ mentorId: 1, scheduledAt: 1 });
MentorshipBookingSchema.index({ menteeId: 1, scheduledAt: 1 });
MentorshipBookingSchema.index({ status: 1, scheduledAt: 1 });

// Add instance methods for common operations
MentorshipBookingSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

MentorshipBookingSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

MentorshipBookingSchema.methods.markNoShow = function() {
  this.status = 'no-show';
  return this.save();
};

MentorshipBookingSchema.methods.addFeedback = function(rating: number, comment: string) {
  this.feedback = {
    rating,
    comment,
    submittedAt: new Date()
  };
  return this.save();
};

// Static method to check for scheduling conflicts
MentorshipBookingSchema.statics.checkForConflicts = async function(
  mentorId: mongoose.Types.ObjectId,
  scheduledAt: Date,
  duration: number,
  excludeBookingId?: mongoose.Types.ObjectId
): Promise<boolean> {
  // Calculate session end time
  const sessionEndTime = new Date(scheduledAt.getTime() + duration * 60000);
  
  console.log(`Checking for conflicts at time: ${scheduledAt.toISOString()} to ${sessionEndTime.toISOString()}`);
  console.log(`Session duration: ${duration} minutes`);
  
  // Using a simpler approach with manual verification instead of complex MongoDB queries
  // that might not work correctly with date calculations
  const query: any = {
    mentorId,
    status: 'scheduled',
    scheduledAt: { 
      // Look for bookings that start around the same time (within a larger window)
      $gte: new Date(scheduledAt.getTime() - 2 * 60 * 60000), // 2 hours before
      $lte: new Date(sessionEndTime.getTime() + 2 * 60 * 60000)  // 2 hours after
    }
  };
  
  // Exclude the current booking if we're checking an update
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  // Find all potential conflicts
  const potentialConflicts = await this.find(query);
  
  console.log(`Found ${potentialConflicts.length} potential conflicts to check`);
  
  // Manually check each potential conflict
  let hasConflict = false;
  for (let i = 0; i < potentialConflicts.length; i++) {
    const booking = potentialConflicts[i];
    const bookingStart = new Date(booking.scheduledAt);
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
    
    console.log(`Examining potential conflict:
      Booking: ${booking._id}
      Start: ${bookingStart.toISOString()}
      End: ${bookingEnd.toISOString()}
    `);
    
    // Check for overlap
    const overlaps = (
      // Case 1: New booking starts during existing booking
      (scheduledAt >= bookingStart && scheduledAt < bookingEnd) ||
      // Case 2: New booking ends during existing booking
      (sessionEndTime > bookingStart && sessionEndTime <= bookingEnd) ||
      // Case 3: New booking completely contains existing booking
      (scheduledAt <= bookingStart && sessionEndTime >= bookingEnd)
    );
    
    if (overlaps) {
      console.log(`CONFLICT DETECTED with booking ${booking._id}`);
      hasConflict = true;
      break;
    }
  }
  
  console.log(`Final conflict result: ${hasConflict}`);
  return hasConflict;
};

// Static method to get upcoming sessions for a mentor
MentorshipBookingSchema.statics.getUpcomingForMentor = function(
  mentorId: mongoose.Types.ObjectId,
  limit: number = 10
) {
  return this.find({
    mentorId,
    status: 'scheduled',
    scheduledAt: { $gt: new Date() }
  })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .populate('menteeId', 'fullName email profileImage')
    .exec();
};

// Static method to get upcoming sessions for a mentee
MentorshipBookingSchema.statics.getUpcomingForMentee = function(
  menteeId: mongoose.Types.ObjectId,
  limit: number = 10
) {
  return this.find({
    menteeId,
    status: 'scheduled',
    scheduledAt: { $gt: new Date() }
  })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .populate('mentorId', 'fullName email profileImage mentorProfile.title')
    .exec();
};

export const MentorshipBooking = mongoose.model<IMentorshipBooking, MentorshipBookingModel>('MentorshipBooking', MentorshipBookingSchema); 