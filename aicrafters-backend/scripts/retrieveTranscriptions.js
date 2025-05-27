/**
 * Script to retrieve all transcriptions for a specific course
 * 
 * Usage: node retrieveTranscriptions.js <courseId>
 * Example: node retrieveTranscriptions.js 67c3e57e754c83ca019ea97e
 */

// Enable ES module syntax
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Load models - adjust the path if needed
const VideoTranscription = require('../dist/models/VideoTranscription').VideoTranscription;
const Course = require('../dist/models/Course').Course;

// Get course ID from command line
const courseId = process.argv[2] || '67c3e57e754c83ca019ea97e';

if (!courseId) {
  console.error('Please provide a course ID');
  process.exit(1);
}

async function retrieveTranscriptions() {
  try {
    console.log(`Retrieving transcriptions for course: ${courseId}`);
    
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      console.error('Course not found');
      process.exit(1);
    }
    
    console.log(`Course name: ${course.title || 'Unnamed course'}`);
    
    // Get all transcriptions for this course
    const transcriptions = await VideoTranscription.find({ courseId });
    
    console.log(`Found ${transcriptions.length} transcriptions`);
    
    if (transcriptions.length === 0) {
      console.log('No transcriptions found for this course');
      process.exit(0);
    }
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'transcriptions', courseId);
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Write each transcription to a file and print to console
    let index = 1;
    for (const transcription of transcriptions) {
      const videoUrl = transcription.videoUrl;
      const status = transcription.status;
      const text = transcription.transcription || 'No transcription text available';
      
      console.log(`\n--- Transcription ${index} ---`);
      console.log(`Video URL: ${videoUrl}`);
      console.log(`Status: ${status}`);
      console.log(`Length: ${text.length} characters`);
      console.log(`Excerpt: ${text.substring(0, 100)}...`);
      
      // Write to file
      const sanitizedUrl = videoUrl.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const filename = path.join(outputDir, `${index}_${sanitizedUrl}.txt`);
      
      fs.writeFileSync(filename, text);
      console.log(`Saved to: ${filename}`);
      
      index++;
    }
    
    console.log('\nAll transcriptions retrieved and saved successfully');
  } catch (error) {
    console.error('Error retrieving transcriptions:', error);
  } finally {
    mongoose.disconnect();
  }
}

retrieveTranscriptions(); 