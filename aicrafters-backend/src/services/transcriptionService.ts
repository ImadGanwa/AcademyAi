import { Course } from '../models/Course';
import { VideoTranscription } from '../models/VideoTranscription';
import { getTranscription } from '../utils/transcriptionApi';
import { SummaryService } from './summaryService';
import redis from '../config/redis';
import logger from '../config/logger';

// Cache TTL settings
// TODO: Move hardcoded cache TTL to environment variables or configuration
const TRANSCRIPTION_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days in seconds

export class TranscriptionService {
  // TODO: Move hardcoded retry values to environment variables or configuration
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
      
      // Process videos in chunks to avoid overwhelming the system
      const chunkSize = 3; // Process 3 videos at a time
      for (let i = 0; i < videoUrls.length; i += chunkSize) {
        const chunk = videoUrls.slice(i, i + chunkSize);
        await Promise.all(chunk.map(url => this.processVideo(courseId, url, accessToken)));
        // Add a small delay between chunks
        if (i + chunkSize < videoUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // After all transcriptions are processed, trigger summary generation if OPENAI_API_KEY is set
      if (process.env.OPENAI_API_KEY) {
        try {
          await SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY);
        } catch (error) {
          logger.error('Error generating summaries:', error);
          // Don't throw here, as we don't want to fail the transcription process if summary generation fails
        }
      }
    } catch (error) {
      logger.error('Error processing course videos:', error);
      throw error;
    }
  }

  private static extractVideoUrls(course: any): string[] {
    const videoUrls: string[] = [];
    const content = course.content || [];

    // Helper function to recursively extract video URLs from content blocks
    const extractFromContent = (blocks: any[]) => {
      for (const block of blocks) {
        if (block.type === 'video' && block.data?.url) {
          videoUrls.push(block.data.url);
        } else if (block.type === 'section' && Array.isArray(block.data?.content)) {
          extractFromContent(block.data.content);
        } else if (block.type === 'subsection' && Array.isArray(block.data?.content)) {
          extractFromContent(block.data.content);
        }
        // Add more block types as needed
      }
    };

    extractFromContent(content);
    return [...new Set(videoUrls)]; // Remove duplicates
  }

  static async processVideo(courseId: string, videoUrl: string, accessToken: string): Promise<void> {
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
        logger.info(`Max retries (${this.MAX_RETRIES}) reached for video ${videoUrl}. Skipping.`);
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

      // Cache the transcription in Redis for fast access
      const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
      await redis.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcript);
      logger.info(`Cached transcription for ${videoUrl} with key: ${cacheKey}`);

    } catch (error: unknown) {
      logger.error(`Error processing video ${videoUrl}:`, error);
      
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
    try {
      // Try to get from Redis cache first
      const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
      const cachedTranscription = await redis.get<string>(cacheKey);
      
      if (cachedTranscription) {
        logger.info(`Retrieved transcription from cache for key: ${cacheKey}`);
        return cachedTranscription;
      }
      
      // If not in cache, get from database
      const transcription = await VideoTranscription.findOne({ courseId, videoUrl });
      const transcriptionText = transcription?.transcription || null;
      
      // Cache the result if found
      if (transcriptionText) {
        await redis.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcriptionText);
        logger.info(`Cached transcription from database with key: ${cacheKey}`);
      }
      
      return transcriptionText;
    } catch (error) {
      logger.error(`Error retrieving transcription for ${videoUrl}:`, error);
      return null;
    }
  }

  /**
   * Updates a transcription in the database
   * 
   * @param courseId - The ID of the course
   * @param videoUrl - The URL of the video
   * @param transcriptionText - The new transcription text
   * @returns Promise<void>
   */
  static async updateTranscription(courseId: string, videoUrl: string, transcriptionText: string): Promise<void> {
    try {
      // Find the existing transcription
      let transcription = await VideoTranscription.findOne({ courseId, videoUrl });
      
      if (!transcription) {
        // Create a new transcription if it doesn't exist
        transcription = new VideoTranscription({
          courseId,
          videoUrl,
          transcription: transcriptionText,
          status: 'completed',
          lastAttempt: new Date(),
          retryCount: 0
        });
      } else {
        // Update the existing transcription
        transcription.transcription = transcriptionText;
        transcription.status = 'completed';
        transcription.error = undefined;
        transcription.lastAttempt = new Date();
      }
      
      // Save to database
      await transcription.save();
      
      // Update the cache
      const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
      await redis.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcriptionText);
      logger.info(`Updated transcription in cache for key: ${cacheKey}`);
      
    } catch (error) {
      logger.error(`Error updating transcription for ${videoUrl}:`, error);
      throw error;
    }
  }
} 