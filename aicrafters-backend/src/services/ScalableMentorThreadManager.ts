import { OpenAI } from 'openai';
import redis, { generateKeys, TTL } from '../utils/redisClient';
import logger from '../config/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface MentorThreadMetadata {
  userId: string;
  mentorId?: string;
  created: number;
  lastAccessed: number;
  type: 'general' | 'specific_mentor';
}

export class ScalableMentorThreadManager {
  /**
   * Get or create a conversation thread for a user (mentor-specific or general)
   * Uses Redis for distributed storage across multiple server instances
   */
  async getOrCreateMentorThread(userId: string, mentorId?: string, initialContext?: string): Promise<string> {
    // Generate thread key - if mentorId provided, create mentor-specific thread
    const threadKey = mentorId 
      ? `mentor_thread:${userId}:${mentorId}`
      : `mentor_thread:${userId}:general`;
    
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
        const metadata: MentorThreadMetadata = {
          userId,
          mentorId,
          created: Date.now(),
          lastAccessed: Date.now(),
          type: mentorId ? 'specific_mentor' : 'general'
        };
        
        await redis.setex(
          `mentor_thread_meta:${threadId}`,
          TTL.THREAD,
          JSON.stringify(metadata)
        );
        
        // Add initial context if provided
        if (initialContext?.trim()) {
          await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: initialContext
          });
        }
        
        logger.info(`Created new mentor thread ${threadId} for user ${userId}${mentorId ? ` with mentor ${mentorId}` : ' (general)'}`);
      } else {
        // Update last accessed time for existing thread
        await this.updateLastAccessed(threadId);
        logger.debug(`Using existing mentor thread ${threadId} for user ${userId}${mentorId ? ` with mentor ${mentorId}` : ' (general)'}`);
      }
      
      return threadId;
    } catch (error) {
      logger.error('Error in getOrCreateMentorThread:', error);
      throw new Error(`Failed to get or create mentor thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch context when user starts talking to a specific mentor
   */
  async switchToMentorContext(threadId: string, mentorId: string, mentorInfo?: any): Promise<void> {
    if (!mentorInfo || !mentorId) {
      return;
    }

    try {
      const contextMessage = `You are now in a conversation context with a specific mentor: ${mentorInfo.fullName || 'Mentor'}.
      
      Mentor Details:
      - Name: ${mentorInfo.fullName || 'Not specified'}
      - Skills: ${mentorInfo.skills?.join(', ') || 'Not specified'}
      - Languages: ${mentorInfo.languages?.join(', ') || 'Not specified'}
      - Countries: ${mentorInfo.countries?.join(', ') || 'Not specified'}
      - Bio: ${mentorInfo.bio || 'Not provided'}
      - Professional Info: ${mentorInfo.professionalInfo ? JSON.stringify(mentorInfo.professionalInfo) : 'Not provided'}
      
      Please adjust your responses to be more personalized and reference this mentor's specific expertise when relevant.
      Help the user understand how this mentor's background aligns with their needs and prepare them for mentorship sessions.`;

      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: contextMessage
      });
      
      logger.debug(`Added mentor context for ${mentorId} to thread ${threadId}`);
    } catch (error) {
      logger.error('Error adding mentor context to thread:', error);
      throw new Error(`Failed to add mentor context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update last accessed time for thread metadata
   */
  private async updateLastAccessed(threadId: string): Promise<void> {
    try {
      const metaKey = `mentor_thread_meta:${threadId}`;
      const metadataStr = await redis.get(metaKey) as string | null;
      
      if (metadataStr) {
        const metadata: MentorThreadMetadata = JSON.parse(metadataStr);
        metadata.lastAccessed = Date.now();
        
        await redis.setex(metaKey, TTL.THREAD, JSON.stringify(metadata));
      }
    } catch (error) {
      logger.warn('Failed to update last accessed time for mentor thread:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Clear mentor thread data for a specific user (useful for testing or manual cleanup)
   */
  async clearMentorThreadForUser(userId: string, mentorId?: string): Promise<void> {
    const threadKey = mentorId 
      ? `mentor_thread:${userId}:${mentorId}`
      : `mentor_thread:${userId}:general`;
    
    try {
      const threadId = await redis.get(threadKey) as string | null;
      
      if (threadId) {
        // Delete thread mapping
        await redis.del(threadKey);
        
        // Delete metadata
        await redis.del(`mentor_thread_meta:${threadId}`);
        
        logger.info(`Cleared mentor thread data for user ${userId}${mentorId ? ` with mentor ${mentorId}` : ' (general)'}`);
      }
    } catch (error) {
      logger.error('Error clearing mentor thread data:', error);
      throw new Error(`Failed to clear mentor thread data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all mentor threads for a user
   */
  async getUserMentorThreads(userId: string): Promise<Array<{threadId: string, type: string, mentorId?: string}>> {
    try {
      // Get all thread keys for this user
      const generalKey = `mentor_thread:${userId}:general`;
      const mentorKeys = await redis.keys(`mentor_thread:${userId}:*`);
      
      const threads = [];
      
      for (const key of mentorKeys) {
        const threadId = await redis.get(key) as string | null;
        if (threadId) {
          const isGeneral = key === generalKey;
          const mentorId = isGeneral ? undefined : key.split(':')[2];
          
          threads.push({
            threadId,
            type: isGeneral ? 'general' : 'specific_mentor',
            mentorId
          });
        }
      }
      
      return threads;
    } catch (error) {
      logger.error('Error getting user mentor threads:', error);
      return [];
    }
  }

  /**
   * Get mentor thread statistics (useful for monitoring)
   */
  async getMentorThreadStats(): Promise<{ 
    totalThreads: number; 
    generalThreads: number; 
    mentorSpecificThreads: number; 
  }> {
    try {
      const allThreadKeys = await redis.keys('mentor_thread:*');
      const generalThreads = allThreadKeys.filter(key => key.endsWith(':general')).length;
      const mentorSpecificThreads = allThreadKeys.length - generalThreads;
      
      return {
        totalThreads: allThreadKeys.length,
        generalThreads,
        mentorSpecificThreads
      };
    } catch (error) {
      logger.error('Error getting mentor thread stats:', error);
      return { totalThreads: 0, generalThreads: 0, mentorSpecificThreads: 0 };
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
      logger.error('Mentor service Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Clean up expired threads (utility function)
   */
  async cleanupExpiredThreads(): Promise<number> {
    try {
      const allThreadKeys = await redis.keys('mentor_thread:*');
      let cleanedCount = 0;

      for (const key of allThreadKeys) {
        const ttl = await redis.ttl(key);
        if (ttl === -1) { // Key exists but has no TTL
          await redis.expire(key, TTL.THREAD);
        } else if (ttl === -2) { // Key doesn't exist
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired mentor threads`);
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up expired mentor threads:', error);
      return 0;
    }
  }
} 