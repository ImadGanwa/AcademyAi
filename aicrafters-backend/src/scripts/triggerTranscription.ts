import mongoose from 'mongoose';
import { TranscriptionService } from '../services/transcriptionService';
import dotenv from 'dotenv';

dotenv.config();

async function triggerTranscription() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    const courseId = '67c3e57e754c83ca019ea97e'; // Your course ID
    const accessToken = process.env.VIMEO_ACCESS_TOKEN; // Make sure this is set in your .env

    if (!accessToken) {
      throw new Error('VIMEO_ACCESS_TOKEN is not set in environment variables');
    }

    console.log('Starting transcription process for course:', courseId);
    await TranscriptionService.processCourseVideos(courseId, accessToken);
    console.log('Transcription process completed');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

triggerTranscription();