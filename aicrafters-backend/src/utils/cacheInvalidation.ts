import redis from '../config/redis';
import logger from '../config/logger';

/**
 * Invalidates the cache related to a specific video's transcription and mind map
 * 
 * @param courseId - The ID of the course
 * @param videoUrl - The URL of the video
 * @returns Promise<void>
 */
export const invalidateVideoCache = async (courseId: string, videoUrl: string): Promise<void> => {
  try {
    if (!courseId || !videoUrl) {
      logger.warn('Cannot invalidate cache: Missing courseId or videoUrl');
      return;
    }
    
    const encodedUrl = encodeURIComponent(videoUrl);
    
    // Create cache key patterns to match all related cache entries
    const patterns = [
      `transcription:${courseId}:${encodedUrl}`,
      `mindmap:structure:${courseId}:${encodedUrl}`,
      `mindmap:markdown:${courseId}:${encodedUrl}`,
      `mindmap:response:${courseId}:${encodedUrl}`
    ];
    
    logger.info(`Invalidating cache for video: ${videoUrl} in course: ${courseId}`);
    
    // Delete all matching cache entries
    for (const pattern of patterns) {
      await redis.get(pattern).then(async (exists) => {
        if (exists !== null) {
          // The key exists, delete it
          // Note: We can't use normal Redis DEL through REST API; using SET with expiration 1s
          await redis.setEx(pattern, 1, 'INVALIDATED');
          logger.info(`Invalidated cache entry: ${pattern}`);
        }
      }).catch(error => {
        logger.error(`Error checking cache key ${pattern}:`, error);
      });
    }
    
    logger.info(`Cache invalidation completed for video: ${videoUrl}`);
  } catch (error) {
    logger.error('Error invalidating cache:', error);
  }
};

/**
 * Invalidates all cache entries related to a specific course
 * 
 * @param courseId - The ID of the course
 * @returns Promise<void>
 */
export const invalidateCourseCache = async (courseId: string): Promise<void> => {
  try {
    if (!courseId) {
      logger.warn('Cannot invalidate course cache: Missing courseId');
      return;
    }
    
    logger.info(`Invalidating all cache for course: ${courseId}`);
    
    // Unfortunately, Upstash Redis REST API doesn't support pattern matching (KEYS/SCAN commands)
    // So we need to use a different approach, like maintaining a list of keys for each course
    // For now, we'll implement a basic solution that requires manual management
    
    // If we have a list of videos for this course, we could iterate through them
    // This would be more efficient with a Redis SCAN operation, but it's not available via REST API
    
    // Just log the operation for now
    logger.info(`Full course cache invalidation for ${courseId} is not supported via REST API`);
    logger.info(`Consider implementing a key tracking mechanism for more efficient invalidation`);
    
  } catch (error) {
    logger.error('Error invalidating course cache:', error);
  }
}; 