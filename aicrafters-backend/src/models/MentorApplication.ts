import mongoose, { Schema } from 'mongoose';
import { IMentorApplication as IMentorApplicationBase } from './User';

// Re-export for compatibility
export { IMentorApplication } from './User';

const MentorApplicationSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  bio: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: [String],
    required: true
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  languages: {
    type: [String],
    default: []
  },
  countries: {
    type: [String],
    default: []
  },
  availability: {
    type: Schema.Types.Mixed,
    default: {}
  },
  professionalInfo: {
    type: Schema.Types.Mixed,
    default: {},
    required: true
  },
  preferences: {
    type: Schema.Types.Mixed,
    default: {}
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

export const MentorApplication = mongoose.model<IMentorApplicationBase>('MentorApplication', MentorApplicationSchema); 