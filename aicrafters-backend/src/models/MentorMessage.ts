import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorMessage extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  sender: 'mentor' | 'mentee';
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MentorMessageSchema = new Schema({
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
  sender: {
    type: String,
    enum: ['mentor', 'mentee'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
MentorMessageSchema.index({ mentorId: 1, menteeId: 1, createdAt: -1 });
MentorMessageSchema.index({ mentorId: 1, isRead: 1 });
MentorMessageSchema.index({ menteeId: 1, isRead: 1 });

// Static methods for common operations
MentorMessageSchema.statics.getConversation = function(
  mentorId: mongoose.Types.ObjectId,
  menteeId: mongoose.Types.ObjectId,
  limit: number = 50,
  skip: number = 0
) {
  return this.find({
    mentorId,
    menteeId
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

MentorMessageSchema.statics.markAsRead = function(
  messageIds: mongoose.Types.ObjectId[]
) {
  return this.updateMany(
    { _id: { $in: messageIds } },
    { isRead: true }
  );
};

MentorMessageSchema.statics.getUnreadCount = function(
  userId: mongoose.Types.ObjectId,
  isMentor: boolean
) {
  const query = isMentor
    ? { mentorId: userId, sender: 'mentee', isRead: false }
    : { menteeId: userId, sender: 'mentor', isRead: false };
  
  return this.countDocuments(query);
};

// Get a list of all conversations for a mentor
MentorMessageSchema.statics.getMentorConversations = async function(
  mentorId: mongoose.Types.ObjectId
) {
  // Find all unique mentees for this mentor
  const uniqueMentees = await this.aggregate([
    { $match: { mentorId } },
    { $group: { _id: '$menteeId' } }
  ]);
  
  const menteeIds = uniqueMentees.map(item => item._id);
  
  // Get the latest message for each conversation and populate mentee info
  const conversations = await Promise.all(
    menteeIds.map(async (menteeId) => {
      const latestMessage = await this.findOne({ mentorId, menteeId })
        .sort({ createdAt: -1 })
        .exec();
      
      const unreadCount = await this.countDocuments({
        mentorId,
        menteeId,
        sender: 'mentee',
        isRead: false
      });
      
      const mentee = await mongoose.model('User').findById(menteeId)
        .select('fullName profileImage')
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
    return new Date(b.latestMessage.createdAt).getTime() - 
           new Date(a.latestMessage.createdAt).getTime();
  });
};

// Get a list of all conversations for a mentee
MentorMessageSchema.statics.getMenteeConversations = async function(
  menteeId: mongoose.Types.ObjectId
) {
  // Find all unique mentors for this mentee
  const uniqueMentors = await this.aggregate([
    { $match: { menteeId } },
    { $group: { _id: '$mentorId' } }
  ]);
  
  const mentorIds = uniqueMentors.map(item => item._id);
  
  // Get the latest message for each conversation and populate mentor info
  const conversations = await Promise.all(
    mentorIds.map(async (mentorId) => {
      const latestMessage = await this.findOne({ mentorId, menteeId })
        .sort({ createdAt: -1 })
        .exec();
      
      const unreadCount = await this.countDocuments({
        mentorId,
        menteeId,
        sender: 'mentor',
        isRead: false
      });
      
      const mentor = await mongoose.model('User').findById(mentorId)
        .select('fullName profileImage mentorProfile.title')
        .exec();
      
      return {
        mentorId,
        mentor,
        latestMessage,
        unreadCount
      };
    })
  );
  
  // Sort by latest message date
  return conversations.sort((a, b) => {
    return new Date(b.latestMessage.createdAt).getTime() - 
           new Date(a.latestMessage.createdAt).getTime();
  });
};

export const MentorMessage = mongoose.model<IMentorMessage>('MentorMessage', MentorMessageSchema); 