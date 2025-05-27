import mongoose from 'mongoose';
import { VideoTranscription } from '../models/VideoTranscription';
import dotenv from 'dotenv';

dotenv.config();

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is missing');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

// Main function
async function checkVideoTranscription() {
  try {
    // Get arguments from command line
    if (process.argv.length < 4) {
      console.error('Usage: npm run ts-node src/scripts/checkVideoTranscription.ts <courseId> <videoUrl>');
      process.exit(1);
    }
    
    const courseId = process.argv[2];
    const videoUrl = process.argv[3];
    
    console.log(`Checking video transcription for course ${courseId} and video ${videoUrl}...`);
    
    // Find the transcription
    const transcription = await VideoTranscription.findOne({ 
      courseId, 
      videoUrl
    });
    
    if (!transcription) {
      console.log(`No transcription found for video ${videoUrl} in course ${courseId}`);
      process.exit(0);
    }
    
    console.log('\nTranscription details:');
    console.log('ID:', transcription._id);
    console.log('Status:', transcription.status);
    console.log('Summary Status:', transcription.summaryStatus);
    console.log('Video Summary:', transcription.videoSummary === null ? 'NULL' : (transcription.videoSummary || 'EMPTY STRING'));
    console.log('Section Summary:', transcription.sectionSummary || 'N/A');
    console.log('Course Summary:', transcription.courseSummary ? 'Present' : 'N/A');
    console.log('Error:', transcription.error || 'None');
    console.log('Last Attempt:', transcription.lastAttempt);
    console.log('Retry Count:', transcription.retryCount);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error checking video transcription:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Execute the main function
checkVideoTranscription(); 