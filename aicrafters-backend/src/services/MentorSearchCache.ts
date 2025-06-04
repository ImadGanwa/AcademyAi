import redis, { TTL } from '../utils/redisClient';
import { searchMentors } from './mentorSearchService';
import logger from '../config/logger';

export class MentorSearchCache {
  private readonly SEARCH_CACHE_TTL = 30 * 60; // 30 minutes cache for mentor searches

  /**
   * Generate cache key for mentor search parameters
   */
  private generateSearchKey(searchParams: any): string {
    // Create a consistent key based on search parameters
    const keyComponents = [
      searchParams.skills || '',
      searchParams.languages || '',
      searchParams.countries || '',
      searchParams.query || '',
      searchParams.limit || 10
    ];
    
    // Create a hash-like key from the parameters
    const paramsString = keyComponents.join('|');
    const encodedParams = Buffer.from(paramsString).toString('base64');
    
    return `mentor_search:${encodedParams}`;
  }

  /**
   * Get cached mentor search results or perform new search
   */
  async getCachedSearch(searchParams: any): Promise<any[]> {
    const cacheKey = this.generateSearchKey(searchParams);
    
    try {
      // Try cache first
      const cachedResults = await redis.get(cacheKey) as string | null;
      if (cachedResults) {
        logger.debug(`Mentor search cache hit for params: ${JSON.stringify(searchParams)}`);
        return JSON.parse(cachedResults);
      }
      
      // Cache miss - perform actual search
      logger.debug(`Mentor search cache miss for params: ${JSON.stringify(searchParams)}`);
      const searchResults = await searchMentors(searchParams);
      
      // Cache the results
      await redis.setex(cacheKey, this.SEARCH_CACHE_TTL, JSON.stringify(searchResults));
      
      return searchResults;
    } catch (error) {
      logger.error('Error in getCachedSearch:', error);
      // Fallback to direct search without caching
      return await searchMentors(searchParams);
    }
  }

  /**
   * Invalidate mentor search cache (useful when mentor data is updated)
   */
  async invalidateSearchCache(): Promise<void> {
    try {
      const searchKeys = await redis.keys('mentor_search:*');
      
      if (searchKeys.length > 0) {
        await redis.del(...searchKeys);
        logger.info(`Invalidated ${searchKeys.length} mentor search cache entries`);
      }
    } catch (error) {
      logger.error('Error invalidating mentor search cache:', error);
    }
  }

  /**
   * Invalidate specific search pattern (useful for partial cache invalidation)
   */
  async invalidateSearchPattern(pattern: string): Promise<void> {
    try {
      const encodedPattern = Buffer.from(pattern).toString('base64');
      const searchKeys = await redis.keys(`mentor_search:*${encodedPattern}*`);
      
      if (searchKeys.length > 0) {
        await redis.del(...searchKeys);
        logger.info(`Invalidated ${searchKeys.length} mentor search cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Error invalidating mentor search pattern:', error);
    }
  }

  /**
   * Preload popular mentor searches (useful for performance optimization)
   */
  async preloadPopularSearches(): Promise<void> {
    const popularSearches = [
      { skills: 'javascript', limit: 10 },
      { skills: 'python', limit: 10 },
      { skills: 'react', limit: 10 },
      { skills: 'machine learning', limit: 10 },
      { skills: 'web development', limit: 10 },
      { languages: 'English', limit: 10 },
      { languages: 'Spanish', limit: 10 },
      { countries: 'USA', limit: 10 },
      { countries: 'Canada', limit: 10 },
      { query: 'startup', limit: 10 },
      { query: 'leadership', limit: 10 }
    ];

    logger.info('Starting mentor search cache preload...');

    const preloadPromises = popularSearches.map(searchParams =>
      this.getCachedSearch(searchParams).catch(error => {
        logger.warn(`Failed to preload search for ${JSON.stringify(searchParams)}:`, error);
      })
    );

    await Promise.allSettled(preloadPromises);
    logger.info(`Mentor search cache preload completed for ${popularSearches.length} searches`);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ 
    totalCachedSearches: number; 
    cacheSize: string;
    oldestEntry?: string;
    newestEntry?: string;
  }> {
    try {
      const searchKeys = await redis.keys('mentor_search:*');
      
      let oldestTtl = Infinity;
      let newestTtl = 0;
      
      // Check TTL for a few random keys to estimate age
      const sampleKeys = searchKeys.slice(0, Math.min(5, searchKeys.length));
      for (const key of sampleKeys) {
        const ttl = await redis.ttl(key);
        if (ttl > 0) {
          oldestTtl = Math.min(oldestTtl, ttl);
          newestTtl = Math.max(newestTtl, ttl);
        }
      }
      
      return {
        totalCachedSearches: searchKeys.length,
        cacheSize: `${searchKeys.length} entries`,
        oldestEntry: oldestTtl !== Infinity ? `${Math.round((this.SEARCH_CACHE_TTL - oldestTtl) / 60)}min ago` : undefined,
        newestEntry: newestTtl > 0 ? `${Math.round((this.SEARCH_CACHE_TTL - newestTtl) / 60)}min ago` : undefined
      };
    } catch (error) {
      logger.error('Error getting mentor search cache stats:', error);
      return { totalCachedSearches: 0, cacheSize: '0 entries' };
    }
  }

  /**
   * Clean up expired search cache entries
   */
  async cleanupExpiredSearches(): Promise<number> {
    try {
      const searchKeys = await redis.keys('mentor_search:*');
      let cleanedCount = 0;

      for (const key of searchKeys) {
        const ttl = await redis.ttl(key);
        if (ttl === -2) { // Key doesn't exist (expired)
          cleanedCount++;
        } else if (ttl === -1) { // Key exists but has no TTL
          await redis.expire(key, this.SEARCH_CACHE_TTL);
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired mentor search cache entries`);
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up expired mentor searches:', error);
      return 0;
    }
  }

  /**
   * Health check for mentor search cache
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'mentor_search_health_check';
      await redis.setex(testKey, 60, 'test');
      const result = await redis.get(testKey);
      await redis.del(testKey);
      
      return result === 'test';
    } catch (error) {
      logger.error('Mentor search cache health check failed:', error);
      return false;
    }
  }
} 