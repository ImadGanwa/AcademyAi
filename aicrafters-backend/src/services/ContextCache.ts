import mongoose from 'mongoose';
import redis, { generateKeys, TTL } from '../utils/redisClient';
import { VideoTranscription } from '../models/VideoTranscription';
import logger from '../config/logger';

export class ContextCache {
  /**
   * Get or build context with Redis caching
   * This dramatically reduces database load by caching context data
   */
  async getOrBuildContext(courseId: string, videoUrl: string): Promise<string> {
    const cacheKey = generateKeys.context(courseId, videoUrl);
    
    try {
      // Try cache first (fast)
      const cachedContext = await redis.get(cacheKey) as string | null;
      if (cachedContext) {
        logger.debug(`Context cache hit for course ${courseId}, video ${videoUrl}`);
        return cachedContext;
      }
      
      // Cache miss - build context from database (slow)
      logger.debug(`Context cache miss for course ${courseId}, video ${videoUrl} - building from DB`);
      const context = await this.buildContextFromDB(courseId, videoUrl);
      
      // Cache for future requests
      await redis.setex(cacheKey, TTL.CONTEXT, context);
      
      return context;
    } catch (error) {
      logger.error('Error in getOrBuildContext:', error);
      // Fallback to building context without caching
      return await this.buildContextFromDB(courseId, videoUrl);
    }
  }

  /**
   * Build context from database with optimizations
   */
  private async buildContextFromDB(courseId: string, videoUrl: string): Promise<string> {
    try {
      const courseObjectId = new mongoose.Types.ObjectId(courseId);
      
      // Use lean() for better performance - returns plain objects instead of Mongoose documents
      const transcriptionData = await VideoTranscription.findOne({
        courseId: courseObjectId,
        videoUrl
      }).lean().exec();

      if (!transcriptionData) {
        return "No transcription data available for this video.";
      }

      return this.formatContext(transcriptionData);
    } catch (error) {
      logger.error('Error building context from DB:', error);
      return "Error loading transcription data for this video.";
    }
  }

  /**
   * Format context data into a structured string
   */
  private formatContext(transcriptionData: any): string {
    let context = "Context about the current video:\n";

    // Add video transcription if available
    if (transcriptionData.transcription) {
      context += `Video Transcription:\n${transcriptionData.transcription}\n\n`;
    }

    // Add video summary if available
    if (transcriptionData.videoSummary) {
      context += `Video Summary:\n${transcriptionData.videoSummary}\n\n`;
    }

    // Add section summary if available
    if (transcriptionData.sectionSummary) {
      context += `Section Summary:\n${transcriptionData.sectionSummary}\n\n`;
    }

    // Add course summary if available
    if (transcriptionData.courseSummary) {
      context += `Course Summary:\n${transcriptionData.courseSummary}\n\n`;
    }

    return context;
  }

  /**
   * Preload context for a course's videos (useful for batch operations)
   */
  async preloadCourseContext(courseId: string, videoUrls: string[]): Promise<void> {
    logger.info(`Preloading context for ${videoUrls.length} videos in course ${courseId}`);
    
    const promises = videoUrls.map(videoUrl => 
      this.getOrBuildContext(courseId, videoUrl).catch(error => {
        logger.warn(`Failed to preload context for video ${videoUrl}:`, error);
        return null;
      })
    );
    
    await Promise.allSettled(promises);
    logger.info(`Completed preloading context for course ${courseId}`);
  }

  /**
   * Invalidate cache for specific video (useful when transcription is updated)
   */
  async invalidateContext(courseId: string, videoUrl: string): Promise<void> {
    const cacheKey = generateKeys.context(courseId, videoUrl);
    
    try {
      await redis.del(cacheKey);
      logger.info(`Invalidated context cache for course ${courseId}, video ${videoUrl}`);
    } catch (error) {
      logger.error('Error invalidating context cache:', error);
    }
  }

  /**
   * Invalidate all context cache for a course (useful when course is updated)
   */
  async invalidateCourseContext(courseId: string): Promise<void> {
    try {
      // Get all cache keys for this course
      const pattern = generateKeys.context(courseId, '*');
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Invalidated ${keys.length} context cache entries for course ${courseId}`);
      }
    } catch (error) {
      logger.error('Error invalidating course context cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ totalCachedContexts: number; cacheSize: string }> {
    try {
      const contextKeys = await redis.keys(`${generateKeys.context('*', '*')}`);
      
      return {
        totalCachedContexts: contextKeys.length,
        cacheSize: `${contextKeys.length} entries`
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return { totalCachedContexts: 0, cacheSize: '0 entries' };
    }
  }

  /**
   * Warm up cache with most accessed content
   */
  async warmUpCache(): Promise<void> {
    try {
      logger.info('Starting cache warm-up...');
      
      // Get recently updated transcriptions to warm up cache
      const recentTranscriptions = await VideoTranscription.find({
        status: 'completed',
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
      .select('courseId videoUrl')
      .limit(100)
      .lean()
      .exec();

      const warmUpPromises = recentTranscriptions.map(({ courseId, videoUrl }) =>
        this.getOrBuildContext(courseId.toString(), videoUrl).catch(error => {
          logger.warn(`Failed to warm up cache for ${courseId}/${videoUrl}:`, error);
        })
      );

      await Promise.allSettled(warmUpPromises);
      logger.info(`Cache warm-up completed for ${recentTranscriptions.length} entries`);
    } catch (error) {
      logger.error('Error during cache warm-up:', error);
    }
  }
} 