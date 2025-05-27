import mongoose from 'mongoose';
import { VideoTranscription } from '../models/VideoTranscription';
import dotenv from 'dotenv';

dotenv.config();

async function checkTranscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    const courseId = '67c3e57e754c83ca019ea97e'; // Course ID to check
    
    console.log(`Checking transcriptions for course: ${courseId}`);
    
    const transcriptions = await VideoTranscription.find({ courseId });
    
    if (transcriptions.length === 0) {
      console.log('No transcriptions found for this course.');
    } else {
      transcriptions.forEach((t, i) => {
        console.log(`\nTranscription ${i+1}:`);
        console.log(`Course ID: ${t.courseId}`);
        console.log(`Video URL: ${t.videoUrl}`);
        console.log(`Status: ${t.status}`);
        console.log(`Last Attempt: ${t.lastAttempt}`);
        console.log(`Error: ${t.error || 'None'}`);
        console.log(`Retry Count: ${t.retryCount || 0}`);
        console.log(`Transcription length: ${t.transcription ? t.transcription.length : 0}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkTranscriptions();