import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoTranscription extends Document {
  courseId: mongoose.Types.ObjectId;
  videoUrl: string;
  transcription: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  lastAttempt: Date;
  retryCount: number;
  videoSummary?: string;
  sectionSummary?: string;
  courseSummary?: string;
  summaryStatus?: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const videoTranscriptionSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  transcription: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  retryCount: {
    type: Number,
    default: 0
  },
  videoSummary: {
    type: String,
    default: null
  },
  sectionSummary: {
    type: String,
    default: null
  },
  courseSummary: {
    type: String,
    default: null
  },
  summaryStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
videoTranscriptionSchema.index({ courseId: 1, videoUrl: 1 }, { unique: true });
videoTranscriptionSchema.index({ status: 1, lastAttempt: 1 });
videoTranscriptionSchema.index({ summaryStatus: 1 });

export const VideoTranscription = mongoose.model<IVideoTranscription>('VideoTranscription', videoTranscriptionSchema); 