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
async function updateVideoSummary() {
  try {
    if (process.argv.length < 4) {
      console.error('Usage: npm run ts-node src/scripts/updateVideoSummary.ts <courseId> <videoUrl>');
      process.exit(1);
    }
    
    const courseId = process.argv[2];
    const videoUrl = process.argv[3];
    
    console.log(`Updating section summary for video ${videoUrl} in course ${courseId}...`);
    
    // The new section summary
    const newSectionSummary = `This section introduces the concept of Microsoft Copilot 365 and its integration within Microsoft's productivity tools, emphasizing its role as a "copilot" to enhance workplace efficiency. It highlights studies demonstrating AI's impact on productivity, with tools like GPT boosting task completion speed and quality. The course, led by informatics expert Bois Canine, explores Copilot's applications in Microsoft tools such as Word, PowerPoint, Excel, Outlook, and Teams. It covers the installation and different versions of Copilot, including a free version, a Pro subscription, and Microsoft 365 Copilot for business, which offers cloud integration and security features. The section aims to provide a comprehensive understanding of how Copilot can streamline tasks and improve productivity, with future content planned for further exploration.`;
    
    // Find the transcription
    const vimeoId = videoUrl.split('/').pop()?.trim();
    
    if (!vimeoId) {
      console.error('Could not extract video ID from URL');
      process.exit(1);
    }
    
    // Try to find the transcription using flexible matching
    const transcription = await VideoTranscription.findOne({
      courseId,
      videoUrl: { $regex: vimeoId, $options: 'i' }
    });
    
    if (!transcription) {
      console.error(`No transcription found for video ${videoUrl} in course ${courseId}`);
      process.exit(1);
    }
    
    console.log(`Found transcription: ${transcription.videoUrl}`);
    console.log(`Current section summary: ${transcription.sectionSummary || 'None'}`);
    
    // Update the section summary
    transcription.sectionSummary = newSectionSummary;
    await transcription.save();
    
    console.log('Section summary updated successfully!');
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error updating section summary:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Execute the main function
updateVideoSummary(); 