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
async function checkSummaries() {
  try {
    // Get course ID from command line arguments or use default
    const courseId = process.argv[2] || '67c3e57e754c83ca019ea97e';
    
    console.log(`Checking summaries for course ${courseId}...`);
    
    // Find transcriptions with completed summaries
    const transcriptions = await VideoTranscription.find({ 
      courseId, 
      summaryStatus: 'completed' 
    });
    
    console.log(`Found ${transcriptions.length} completed summaries for course ${courseId}`);
    
    if (transcriptions.length > 0) {
      // Print the first summary as an example
      const example = transcriptions[1];
      console.log('\nExample summaries for video:', example.videoUrl);
      console.log('\nVideo Summary:', example.videoSummary);
      console.log('\nSection Summary:', example.sectionSummary);
      console.log('\nCourse Summary:', example.courseSummary);
    } else {
      console.log('\nNo completed summaries found. Check if summaries are still being processed.');
      
      // Check if there are any pending summaries
      const pendingSummaries = await VideoTranscription.find({
        courseId,
        summaryStatus: 'pending'
      });
      
      console.log(`Found ${pendingSummaries.length} pending summaries.`);
      
      // Check if there are any failed summaries
      const failedSummaries = await VideoTranscription.find({
        courseId,
        summaryStatus: 'failed'
      });
      
      console.log(`Found ${failedSummaries.length} failed summaries.`);
      
      if (failedSummaries.length > 0) {
        console.log('\nExample of failed summary error:', failedSummaries[0].error);
      }
    }
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error checking summaries:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Execute the main function
checkSummaries(); 