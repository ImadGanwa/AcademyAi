import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorApplication extends Document {
  fullName: string;
  email: string;
  bio: string;
  expertise: string[];
  experience: string;
  hourlyRate: number;
  languages: string[];
  countries: string[];
  availability: {
    weekdays?: boolean;
    weekends?: boolean;
    mornings?: boolean;
    afternoons?: boolean;
    evenings?: boolean;
    [key: string]: any;
  };
  professionalInfo: {
    role?: string;
    linkedIn?: string;
    academicBackground?: string;
    [key: string]: any;
  };
  preferences: {
    sessionDuration?: string;
    [key: string]: any;
  };
  appliedAt: Date;
  reviewedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

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
  expertise: {
    type: [String],
    required: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
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
    default: {}
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

export const MentorApplication = mongoose.model<IMentorApplication>('MentorApplication', MentorApplicationSchema); 