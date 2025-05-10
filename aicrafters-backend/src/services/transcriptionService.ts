import { Course } from '../models/Course';
import { VideoTranscription } from '../models/VideoTranscription';
import { getTranscription } from '../utils/transcriptionApi';
import { SummaryService } from './summaryService';

export class TranscriptionService {
  private static readonly RETRY_DELAY = 10 * 60 * 1000; // 10 minutes in milliseconds
  private static readonly MAX_RETRIES = 3; // Maximum number of retry attempts

  static async processCourseVideos(courseId: string, accessToken: string): Promise<void> {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Extract all video URLs from course content
      const videoUrls = this.extractVideoUrls(course);
      
      for (const videoUrl of videoUrls) {
        await this.processVideo(courseId, videoUrl, accessToken);
      }

      // After all transcriptions are processed, trigger summary generation if OPENAI_API_KEY is set
      if (process.env.OPENAI_API_KEY) {
        try {
          await SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY);
        } catch (error) {
          console.error('Error generating summaries:', error);
          // Don't throw here, as we don't want to fail the transcription process if summary generation fails
        }
      }
    } catch (error) {
      console.error('Error processing course videos:', error);
      throw error;
    }
  }

  private static extractVideoUrls(course: any): string[] {
    const videoUrls: string[] = [];
    
    // Extract video URLs from course content
    course.courseContent.sections.forEach((section: any) => {
      section.contents.forEach((content: any) => {
        if (content.type === 'lesson' && content.content.contentItems) {
          content.content.contentItems.forEach((item: any) => {
            if (item.type === 'media' && item.content.includes('vimeo.com')) {
              videoUrls.push(item.content);
            }
          });
        }
      });
    });

    return videoUrls;
  }

  private static async processVideo(courseId: string, videoUrl: string, accessToken: string): Promise<void> {
    try {
      // Check if transcription already exists
      let transcription = await VideoTranscription.findOne({ courseId, videoUrl });
      
      if (!transcription) {
        transcription = new VideoTranscription({ 
          courseId, 
          videoUrl,
          retryCount: 0 // Initialize retry count
        });
      }

      // Skip if already completed
      if (transcription.status === 'completed') {
        return;
      }

      // Skip if max retries reached
      if (transcription.retryCount >= this.MAX_RETRIES) {
        console.log(`Max retries (${this.MAX_RETRIES}) reached for video ${videoUrl}. Skipping.`);
        return;
      }

      // Check if we should retry (if last attempt was more than 10 minutes ago)
      const timeSinceLastAttempt = Date.now() - transcription.lastAttempt.getTime();
      if (transcription.status === 'failed' && timeSinceLastAttempt < this.RETRY_DELAY) {
        return;
      }

      // Update status and attempt time
      transcription.status = 'pending';
      transcription.lastAttempt = new Date();
      transcription.retryCount = (transcription.retryCount || 0) + 1;
      await transcription.save();

      // Get transcription from Vimeo
      const transcript = await getTranscription(videoUrl, accessToken);
      
      // Update transcription record
      transcription.transcription = transcript;
      transcription.status = 'completed';
      transcription.error = undefined;
      await transcription.save();

    } catch (error: unknown) {
      console.error(`Error processing video ${videoUrl}:`, error);
      
      // Update transcription record with error
      await VideoTranscription.findOneAndUpdate(
        { courseId, videoUrl },
        {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          lastAttempt: new Date(),
          $inc: { retryCount: 1 } // Increment retry count
        },
        { upsert: true }
      );
    }
  }

  static async getTranscription(courseId: string, videoUrl: string): Promise<string | null> {
    const transcription = await VideoTranscription.findOne({ courseId, videoUrl });
    return transcription?.transcription || null;
  }
} 