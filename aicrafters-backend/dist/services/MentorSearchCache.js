"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorSearchCache = void 0;
const redisClient_1 = __importDefault(require("../utils/redisClient"));
const mentorSearchService_1 = require("./mentorSearchService");
const logger_1 = __importDefault(require("../config/logger"));
class MentorSearchCache {
    constructor() {
        this.SEARCH_CACHE_TTL = 30 * 60; // 30 minutes cache for mentor searches
    }
    /**
     * Generate cache key for mentor search parameters
     */
    generateSearchKey(searchParams) {
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
    getCachedSearch(searchParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = this.generateSearchKey(searchParams);
            try {
                // Try cache first
                const cachedResults = yield redisClient_1.default.get(cacheKey);
                if (cachedResults) {
                    logger_1.default.debug(`Mentor search cache hit for params: ${JSON.stringify(searchParams)}`);
                    return JSON.parse(cachedResults);
                }
                // Cache miss - perform actual search
                logger_1.default.debug(`Mentor search cache miss for params: ${JSON.stringify(searchParams)}`);
                const searchResults = yield (0, mentorSearchService_1.searchMentors)(searchParams);
                // Cache the results
                yield redisClient_1.default.setex(cacheKey, this.SEARCH_CACHE_TTL, JSON.stringify(searchResults));
                return searchResults;
            }
            catch (error) {
                logger_1.default.error('Error in getCachedSearch:', error);
                // Fallback to direct search without caching
                return yield (0, mentorSearchService_1.searchMentors)(searchParams);
            }
        });
    }
    /**
     * Invalidate mentor search cache (useful when mentor data is updated)
     */
    invalidateSearchCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchKeys = yield redisClient_1.default.keys('mentor_search:*');
                if (searchKeys.length > 0) {
                    yield redisClient_1.default.del(...searchKeys);
                    logger_1.default.info(`Invalidated ${searchKeys.length} mentor search cache entries`);
                }
            }
            catch (error) {
                logger_1.default.error('Error invalidating mentor search cache:', error);
            }
        });
    }
    /**
     * Invalidate specific search pattern (useful for partial cache invalidation)
     */
    invalidateSearchPattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const encodedPattern = Buffer.from(pattern).toString('base64');
                const searchKeys = yield redisClient_1.default.keys(`mentor_search:*${encodedPattern}*`);
                if (searchKeys.length > 0) {
                    yield redisClient_1.default.del(...searchKeys);
                    logger_1.default.info(`Invalidated ${searchKeys.length} mentor search cache entries matching pattern: ${pattern}`);
                }
            }
            catch (error) {
                logger_1.default.error('Error invalidating mentor search pattern:', error);
            }
        });
    }
    /**
     * Preload popular mentor searches (useful for performance optimization)
     */
    preloadPopularSearches() {
        return __awaiter(this, void 0, void 0, function* () {
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
            logger_1.default.info('Starting mentor search cache preload...');
            const preloadPromises = popularSearches.map(searchParams => this.getCachedSearch(searchParams).catch(error => {
                logger_1.default.warn(`Failed to preload search for ${JSON.stringify(searchParams)}:`, error);
            }));
            yield Promise.allSettled(preloadPromises);
            logger_1.default.info(`Mentor search cache preload completed for ${popularSearches.length} searches`);
        });
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchKeys = yield redisClient_1.default.keys('mentor_search:*');
                let oldestTtl = Infinity;
                let newestTtl = 0;
                // Check TTL for a few random keys to estimate age
                const sampleKeys = searchKeys.slice(0, Math.min(5, searchKeys.length));
                for (const key of sampleKeys) {
                    const ttl = yield redisClient_1.default.ttl(key);
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
            }
            catch (error) {
                logger_1.default.error('Error getting mentor search cache stats:', error);
                return { totalCachedSearches: 0, cacheSize: '0 entries' };
            }
        });
    }
    /**
     * Clean up expired search cache entries
     */
    cleanupExpiredSearches() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchKeys = yield redisClient_1.default.keys('mentor_search:*');
                let cleanedCount = 0;
                for (const key of searchKeys) {
                    const ttl = yield redisClient_1.default.ttl(key);
                    if (ttl === -2) { // Key doesn't exist (expired)
                        cleanedCount++;
                    }
                    else if (ttl === -1) { // Key exists but has no TTL
                        yield redisClient_1.default.expire(key, this.SEARCH_CACHE_TTL);
                    }
                }
                if (cleanedCount > 0) {
                    logger_1.default.info(`Cleaned up ${cleanedCount} expired mentor search cache entries`);
                }
                return cleanedCount;
            }
            catch (error) {
                logger_1.default.error('Error cleaning up expired mentor searches:', error);
                return 0;
            }
        });
    }
    /**
     * Health check for mentor search cache
     */
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const testKey = 'mentor_search_health_check';
                yield redisClient_1.default.setex(testKey, 60, 'test');
                const result = yield redisClient_1.default.get(testKey);
                yield redisClient_1.default.del(testKey);
                return result === 'test';
            }
            catch (error) {
                logger_1.default.error('Mentor search cache health check failed:', error);
                return false;
            }
        });
    }
}
exports.MentorSearchCache = MentorSearchCache;
