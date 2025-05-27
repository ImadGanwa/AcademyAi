import mongoose from 'mongoose';
import { VideoTranscription } from '../models/VideoTranscription';
import { getTranscription } from '../utils/transcriptionApi';
import dotenv from 'dotenv';
import redis from '../config/redis';

dotenv.config();

// Cache TTL setting
const TRANSCRIPTION_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days in seconds

async function processVideoDirectly() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    const courseId = '67c3e57e754c83ca019ea97e';
    const accessToken = process.env.VIMEO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('VIMEO_ACCESS_TOKEN is not set in environment variables');
    }

    // Process specific videos
    const videoUrls = [
      'https://vimeo.com/1017725861/c2cd4540a2',
      'https://vimeo.com/1017726547'
    ];

    console.log('Starting direct video processing...');
    
    // Process videos one by one
    for (const videoUrl of videoUrls) {
      console.log(`\nProcessing video: ${videoUrl}`);
      try {
        // Get transcription directly
        const transcript = await getTranscription(videoUrl, accessToken);
        console.log(`Transcription received with length: ${transcript.length}`);
        
        // Update or create transcription record
        await VideoTranscription.findOneAndUpdate(
          { courseId, videoUrl },
          {
            transcription: transcript,
            status: 'completed',
            error: undefined,
            lastAttempt: new Date()
          },
          { upsert: true }
        );
        
        // Cache the transcription in Redis for fast access
        const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
        await redis.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcript);
        console.log(`Cached transcription with key: ${cacheKey}`);
        
        console.log(`Completed processing for ${videoUrl}`);
      } catch (error) {
        console.error(`Error processing ${videoUrl}:`, error);
        
        // Update transcription record with error
        await VideoTranscription.findOneAndUpdate(
          { courseId, videoUrl },
          {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            lastAttempt: new Date()
          },
          { upsert: true }
        );
      }
    }

    console.log('\nAll videos processed.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

processVideoDirectly(); 