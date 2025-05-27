import axios from 'axios';
import { VideoTranscription, IVideoTranscription } from '../models/VideoTranscription';
import { Course } from '../models/Course';
import mongoose from 'mongoose';

export class SummaryService {
  private static readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private static readonly MODEL = 'gpt-4o';

  /**
   * Process all videos in a course to generate summaries
   */
  static async processCourseForSummaries(courseId: string, apiKey: string): Promise<void> {
    try {
      // Find all transcriptions for the course that are completed but don't have summaries
      const transcriptions = await VideoTranscription.find({
        courseId,
        status: 'completed',
        summaryStatus: { $ne: 'completed' }
      }) as IVideoTranscription[];

      // Generate video summaries first
      for (const transcription of transcriptions) {
        // Use mongoose ObjectId toString to avoid type issues
        const transcriptionId = transcription._id instanceof mongoose.Types.ObjectId
          ? transcription._id.toString()
          : String(transcription._id);
        
        await this.generateVideoSummary(transcriptionId, apiKey);
      }

      // Get the course to process section summaries
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Generate section summaries
      for (const section of course.courseContent.sections) {
        await this.generateSectionSummary(courseId, section.title, apiKey);
      }

      // Generate course summary
      await this.generateCourseSummary(courseId, apiKey);

    } catch (error) {
      console.error('Error processing course for summaries:', error);
      throw error;
    }
  }

  /**
   * Generate a summary for a specific video
   */
  static async generateVideoSummary(transcriptionId: string, apiKey: string): Promise<void> {
    try {
      const transcription = await VideoTranscription.findById(transcriptionId) as IVideoTranscription | null;
      if (!transcription || transcription.status !== 'completed') {
        throw new Error('Transcription not found or not completed');
      }

      // Update status to pending
      transcription.summaryStatus = 'pending';
      await transcription.save();

      // Prepare prompt for OpenAI
      const prompt = `Summarize the following video transcription in a concise paragraph:
      
${transcription.transcription}`;

      // Call OpenAI API
      const summary = await this.callOpenAI(prompt, apiKey);

      // Update the transcription with summary
      transcription.videoSummary = summary;
      transcription.summaryStatus = 'completed';
      await transcription.save();

    } catch (error) {
      console.error(`Error generating video summary:`, error);
      
      // Update transcription with error
      await VideoTranscription.findByIdAndUpdate(transcriptionId, {
        summaryStatus: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Generate a summary for a course section
   */
  static async generateSectionSummary(courseId: string, sectionTitle: string, apiKey: string): Promise<void> {
    try {
      // Get all video transcriptions for videos in this section
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Find the section
      const section = course.courseContent.sections.find(s => s.title === sectionTitle);
      if (!section) {
        throw new Error('Section not found');
      }

      // Get video URLs from the section
      const videoUrls: string[] = [];
      for (const content of section.contents) {
        if (content.type === 'lesson') {
          const lesson = content.content as any; // Type cast to access lesson properties
          if (lesson.contentItems) {
            for (const item of lesson.contentItems) {
              if (item.type === 'media' && item.content.includes('vimeo.com')) {
                videoUrls.push(item.content);
              }
            }
          }
        }
      }

      // Get transcriptions for these videos
      const transcriptions = await VideoTranscription.find({
        courseId,
        videoUrl: { $in: videoUrls },
        status: 'completed'
      }) as IVideoTranscription[];

      // If no transcriptions found, return
      if (transcriptions.length === 0) {
        return;
      }

      // Collect all video summaries
      const videoSummaries = transcriptions
        .filter(t => t.videoSummary)
        .map(t => t.videoSummary)
        .join('\n\n');

      // Prepare prompt for OpenAI
      const prompt = `Create a concise summary of this course section based on the following video summaries:
      
${videoSummaries}

Section title: ${sectionTitle}`;

      // Call OpenAI API
      const sectionSummary = await this.callOpenAI(prompt, apiKey);

      // Update all transcriptions in this section with the section summary
      await VideoTranscription.updateMany(
        { courseId, videoUrl: { $in: videoUrls } },
        { sectionSummary }
      );

    } catch (error) {
      console.error(`Error generating section summary:`, error);
    }
  }

  /**
   * Generate an overall course summary
   */
  static async generateCourseSummary(courseId: string, apiKey: string): Promise<void> {
    try {
      // Get all section summaries
      const transcriptions = await VideoTranscription.find({
        courseId,
        sectionSummary: { $ne: null }
      }) as IVideoTranscription[];

      // Extract unique section summaries
      const sectionSummaries = Array.from(
        new Set(transcriptions.map(t => t.sectionSummary))
      ).filter(Boolean).join('\n\n');

      // Get course details
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Prepare prompt for OpenAI
      const prompt = `Create a comprehensive course summary based on the following section summaries:
      
${sectionSummaries}

Course title: ${course.title}
Course description: ${course.description}`;

      // Call OpenAI API
      const courseSummary = await this.callOpenAI(prompt, apiKey);

      // Update all transcriptions for this course with the course summary
      await VideoTranscription.updateMany(
        { courseId },
        { courseSummary }
      );

    } catch (error) {
      console.error(`Error generating course summary:`, error);
    }
  }

  /**
   * Retrieve a video transcription with all its associated summaries
   */
  static async getVideoTranscriptionWithSummaries(courseId: string, videoUrl: string): Promise<IVideoTranscription | null> {
    try {
      // Clean the videoUrl by trimming whitespace and decoding URL-encoded spaces
      const cleanedVideoUrl = decodeURIComponent(videoUrl).trim();
      
      // First try exact match
      let transcription = await VideoTranscription.findOne({
        courseId,
        videoUrl: cleanedVideoUrl
      }) as IVideoTranscription | null;
      
      // If not found, try a more flexible search (URL contains the video ID)
      if (!transcription) {
        const vimeoId = cleanedVideoUrl.split('/').pop()?.trim();
        if (vimeoId) {
          transcription = await VideoTranscription.findOne({
            courseId,
            videoUrl: { $regex: vimeoId, $options: 'i' }
          }) as IVideoTranscription | null;
        }
      }
      
      return transcription;
    } catch (error) {
      console.error(`Error getting video transcription:`, error);
      throw error;
    }
  }

  /**
   * Call OpenAI API to generate a summary
   */
  private static async callOpenAI(prompt: string, apiKey: string): Promise<string> {
    try {
      const response = await axios.post(
        this.OPENAI_API_URL,
        {
          model: this.MODEL,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that creates concise, informative summaries.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.5,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to generate summary with OpenAI');
    }
  }
} 