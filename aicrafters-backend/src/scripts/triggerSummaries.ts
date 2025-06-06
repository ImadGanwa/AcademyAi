import mongoose from 'mongoose';
import { SummaryService } from '../services/summaryService';
import dotenv from 'dotenv';

dotenv.config();

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is missing');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is missing');
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
async function triggerSummaries() {
  try {
    // Get course ID from command line arguments
    const courseId = process.argv[2] || '6840dbd473d5eb026e404141';
    
    if (!courseId) {
      console.error('Please provide a course ID as an argument');
      console.log('Usage: npx ts-node src/scripts/triggerSummaries.ts <courseId>');
      process.exit(1);
    }

    console.log(`Triggering summary generation for course ${courseId}...`);
    
    // Call the summary service
    await SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY as string);
    
    console.log('Summary generation triggered successfully');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error triggering summaries:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Execute the main function
triggerSummaries(); 