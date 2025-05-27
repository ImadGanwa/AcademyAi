import mongoose from 'mongoose';
import { VideoTranscription } from '../models/VideoTranscription';
import dotenv from 'dotenv';

dotenv.config();

async function resetTranscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    const courseId = '67c3e57e754c83ca019ea97e'; // Course ID to reset
    
    console.log(`Resetting transcriptions for course: ${courseId}`);
    
    const result = await VideoTranscription.updateMany(
      { courseId },
      { 
        $set: { 
          status: 'pending',
          retryCount: 0,
          lastAttempt: new Date(0) // Set to epoch time to ensure retry delay is satisfied
        }
      }
    );
    
    console.log(`Reset ${result.modifiedCount} transcription records`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

resetTranscriptions(); 