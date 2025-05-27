import mongoose, { Document } from 'mongoose';
import { Course } from '../models/Course';
import { SummaryService } from '../services/summaryService';
import dotenv from 'dotenv';

dotenv.config();

// Interface for the course document with needed properties
interface CourseDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
}

async function triggerAllSummaries() {
  try {
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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all courses
    const courses = await Course.find({}) as CourseDocument[];
    console.log(`Found ${courses.length} courses to process for summaries`);

    // Process each course
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const courseId = course._id.toString();
      const courseTitle = course.title || courseId;
      
      console.log(`\nProcessing summaries for course ${i+1}/${courses.length}: ${courseTitle}`);
      
      try {
        await SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY as string);
        console.log(`Completed summary generation for course: ${courseTitle}`);
      } catch (error) {
        console.error(`Error generating summaries for course ${courseId}:`, error);
      }
      
      // Add a delay between courses to avoid overloading the API
      if (i < courses.length - 1) {
        console.log('Waiting 5 seconds before processing next course...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('\nAll courses processed for summary generation');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

triggerAllSummaries(); 