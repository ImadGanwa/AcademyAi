import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorshipBooking extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
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
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
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
  
  // Check for overlapping bookings
  const query: any = {
    mentorId,
    status: 'scheduled',
    $or: [
      // Case 1: New booking starts during an existing booking
      {
        scheduledAt: { $lte: scheduledAt },
        $expr: {
          $gt: [
            { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
            scheduledAt.getTime()
          ]
        }
      },
      // Case 2: New booking ends during an existing booking
      {
        $and: [
          { scheduledAt: { $lt: sessionEndTime } },
          { scheduledAt: { $gt: scheduledAt } }
        ]
      }
    ]
  };
  
  // Exclude the current booking if we're checking an update
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflictCount = await this.countDocuments(query);
  return conflictCount > 0;
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