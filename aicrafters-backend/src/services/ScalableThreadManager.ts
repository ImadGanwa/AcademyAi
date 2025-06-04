import { OpenAI } from 'openai';
import redis, { generateKeys, TTL } from '../utils/redisClient';
import logger from '../config/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ThreadMetadata {
  userId: string;
  courseId: string;
  created: number;
  lastAccessed: number;
}

export class ScalableThreadManager {
  /**
   * Get or create a conversation thread for a user and course combination
   * Uses Redis for distributed storage across multiple server instances
   */
  async getOrCreateThread(userId: string, courseId: string, initialContext?: string): Promise<string> {
    const threadKey = generateKeys.thread(userId, courseId);
    
    try {
      // Try to get existing thread
      let threadId = await redis.get(threadKey) as string | null;
      
      if (!threadId) {
        // Create new thread
        const thread = await openai.beta.threads.create();
        threadId = thread.id;
        
        // Store thread with TTL
        await redis.setex(threadKey, TTL.THREAD, threadId);
        
        // Store metadata
        const metadata: ThreadMetadata = {
          userId,
          courseId,
          created: Date.now(),
          lastAccessed: Date.now()
        };
        
        await redis.setex(
          generateKeys.threadMeta(threadId),
          TTL.THREAD,
          JSON.stringify(metadata)
        );
        
        // Add initial context if provided
        if (initialContext?.trim()) {
          await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: `Context for this course conversation:\n${initialContext}`
          });
        }
        
        logger.info(`Created new thread ${threadId} for user ${userId} in course ${courseId}`);
      } else {
        // Update last accessed time for existing thread
        await this.updateLastAccessed(threadId);
        logger.debug(`Using existing thread ${threadId} for user ${userId} in course ${courseId}`);
      }
      
      return threadId;
    } catch (error) {
      logger.error('Error in getOrCreateThread:', error);
      throw new Error(`Failed to get or create thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Track video changes and return whether video has changed
   * This enables adding new video context to existing threads
   */
  async trackVideoChange(threadId: string, videoUrl: string): Promise<boolean> {
    const lastVideoKey = generateKeys.lastVideo(threadId);
    
    try {
      const lastVideo = await redis.get(lastVideoKey) as string | null;
      
      if (lastVideo && lastVideo !== videoUrl) {
        // Video changed - update tracking
        await redis.setex(lastVideoKey, TTL.VIDEO_TRACKING, videoUrl);
        logger.info(`Video changed from ${lastVideo} to ${videoUrl} in thread ${threadId}`);
        return true;
      }
      
      // Set current video (first time or same video)
      await redis.setex(lastVideoKey, TTL.VIDEO_TRACKING, videoUrl);
      return false;
    } catch (error) {
      logger.error('Error in trackVideoChange:', error);
      // Don't throw - video tracking is not critical
      return false;
    }
  }

  /**
   * Add video context to an existing thread when video changes
   */
  async addVideoContextToThread(threadId: string, videoContext: string): Promise<void> {
    if (!videoContext?.trim()) {
      return;
    }

    try {
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: `New video context (video changed within course):\n${videoContext}`
      });
      
      logger.debug(`Added new video context to thread ${threadId}`);
    } catch (error) {
      logger.error('Error adding video context to thread:', error);
      throw new Error(`Failed to add video context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update last accessed time for thread metadata
   */
  private async updateLastAccessed(threadId: string): Promise<void> {
    try {
      const metaKey = generateKeys.threadMeta(threadId);
      const metadataStr = await redis.get(metaKey) as string | null;
      
      if (metadataStr) {
        const metadata: ThreadMetadata = JSON.parse(metadataStr);
        metadata.lastAccessed = Date.now();
        
        await redis.setex(metaKey, TTL.THREAD, JSON.stringify(metadata));
      }
    } catch (error) {
      logger.warn('Failed to update last accessed time:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Clear thread data for a specific user and course (useful for testing or manual cleanup)
   */
  async clearThreadForUserAndCourse(userId: string, courseId: string): Promise<void> {
    const threadKey = generateKeys.thread(userId, courseId);
    
    try {
      const threadId = await redis.get(threadKey) as string | null;
      
      if (threadId) {
        // Delete thread mapping
        await redis.del(threadKey);
        
        // Delete video tracking
        await redis.del(generateKeys.lastVideo(threadId));
        
        // Delete metadata
        await redis.del(generateKeys.threadMeta(threadId));
        
        logger.info(`Cleared thread data for user ${userId} in course ${courseId}`);
      }
    } catch (error) {
      logger.error('Error clearing thread data:', error);
      throw new Error(`Failed to clear thread data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get thread statistics (useful for monitoring)
   */
  async getThreadStats(): Promise<{ totalThreads: number; threadsByPattern: Record<string, number> }> {
    try {
      // Note: SCAN is expensive on large datasets, use sparingly
      const threadKeys = await redis.keys(`${generateKeys.thread('*', '*')}`);
      
      const stats = {
        totalThreads: threadKeys.length,
        threadsByPattern: {
          active: threadKeys.length
        }
      };
      
      return stats;
    } catch (error) {
      logger.error('Error getting thread stats:', error);
      return { totalThreads: 0, threadsByPattern: {} };
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
} 