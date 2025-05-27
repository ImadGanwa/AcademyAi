import mongoose, { Document } from 'mongoose';
import { Course } from '../models/Course';
import { TranscriptionService } from '../services/transcriptionService';
import dotenv from 'dotenv';

dotenv.config();

// Interface for the course document with needed properties
interface CourseDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
}

async function triggerAllTranscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    const accessToken = process.env.VIMEO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('VIMEO_ACCESS_TOKEN is not set in environment variables');
    }

    // Get all courses
    const courses = await Course.find({}) as CourseDocument[];
    console.log(`Found ${courses.length} courses to process`);

    // Process each course
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const courseId = course._id.toString();
      const courseTitle = course.title || courseId;
      
      console.log(`\nProcessing course ${i+1}/${courses.length}: ${courseTitle}`);
      
      try {
        await TranscriptionService.processCourseVideos(courseId, accessToken);
        console.log(`Completed transcription for course: ${courseTitle}`);
      } catch (error) {
        console.error(`Error processing course ${courseId}:`, error);
      }
      
      // Add a delay between courses to avoid overloading the API
      if (i < courses.length - 1) {
        console.log('Waiting 5 seconds before processing next course...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('\nAll courses processed for transcription');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

triggerAllTranscriptions(); 