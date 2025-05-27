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
async function fixSummaries() {
  try {
    // Get course ID from command line arguments or use default
    const courseId = process.argv[2] || '67c3e57e754c83ca019ea97e';
    
    console.log(`Fixing summaries for course ${courseId}...`);
    
    // Find transcriptions with issues
    const transcriptions = await VideoTranscription.find({ 
      courseId,
      summaryStatus: 'completed'
    });
    
    console.log(`Found ${transcriptions.length} completed summaries for course ${courseId}`);
    
    let fixedCount = 0;
    
    // Check each transcription for issues
    for (const transcription of transcriptions) {
      let needsUpdate = false;
      
      // Fix undefined or incorrect types
      if (transcription.videoSummary === undefined) {
        transcription.videoSummary = '';
        needsUpdate = true;
      }
      
      if (transcription.sectionSummary === undefined) {
        transcription.sectionSummary = '';
        needsUpdate = true;
      }
      
      if (transcription.courseSummary === undefined) {
        transcription.courseSummary = '';
        needsUpdate = true;
      }
      
      // If transcription is in completed state with null videoSummary but has pending status, fix it
      if (transcription.status === 'pending' && transcription.summaryStatus === 'completed') {
        console.log(`Found transcription with pending status but completed summaries: ${transcription.videoUrl}`);
        transcription.status = 'completed';
        needsUpdate = true;
      }
      
      // Save if changes were made
      if (needsUpdate) {
        await transcription.save();
        fixedCount++;
        console.log(`Fixed transcription: ${transcription.videoUrl}`);
      }
    }
    
    console.log(`Fixed ${fixedCount} transcriptions.`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing summaries:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Execute the main function
fixSummaries(); 