import mongoose from 'mongoose';
import { VideoTranscription } from '../models/VideoTranscription';
import dotenv from 'dotenv';

dotenv.config();

async function checkTranscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    // Find all transcriptions
    const transcriptions = await VideoTranscription.find();
    console.log('\nFound transcriptions:', transcriptions.length);
    
    // Print each transcription
    transcriptions.forEach((transcription, index) => {
      console.log(`\nTranscription ${index + 1}:`);
      console.log('Course ID:', transcription.courseId);
      console.log('Video URL:', transcription.videoUrl);
      console.log('Status:', transcription.status);
      console.log('Last Attempt:', transcription.lastAttempt);
      if (transcription.error) {
        console.log('Error:', transcription.error);
      }
      console.log('Transcription length:', transcription.transcription.length);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkTranscriptions();