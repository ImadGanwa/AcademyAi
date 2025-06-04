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
exports.invalidateCourseCache = exports.invalidateVideoCache = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Invalidates the cache related to a specific video's transcription and mind map
 *
 * @param courseId - The ID of the course
 * @param videoUrl - The URL of the video
 * @returns Promise<void>
 */
const invalidateVideoCache = (courseId, videoUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!courseId || !videoUrl) {
            logger_1.default.warn('Cannot invalidate cache: Missing courseId or videoUrl');
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
        logger_1.default.info(`Invalidating cache for video: ${videoUrl} in course: ${courseId}`);
        // Delete all matching cache entries
        for (const pattern of patterns) {
            yield redis_1.default.get(pattern).then((exists) => __awaiter(void 0, void 0, void 0, function* () {
                if (exists !== null) {
                    // The key exists, delete it
                    // Note: We can't use normal Redis DEL through REST API; using SET with expiration 1s
                    yield redis_1.default.setEx(pattern, 1, 'INVALIDATED');
                    logger_1.default.info(`Invalidated cache entry: ${pattern}`);
                }
            })).catch(error => {
                logger_1.default.error(`Error checking cache key ${pattern}:`, error);
            });
        }
        logger_1.default.info(`Cache invalidation completed for video: ${videoUrl}`);
    }
    catch (error) {
        logger_1.default.error('Error invalidating cache:', error);
    }
});
exports.invalidateVideoCache = invalidateVideoCache;
/**
 * Invalidates all cache entries related to a specific course
 *
 * @param courseId - The ID of the course
 * @returns Promise<void>
 */
const invalidateCourseCache = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!courseId) {
            logger_1.default.warn('Cannot invalidate course cache: Missing courseId');
            return;
        }
        logger_1.default.info(`Invalidating all cache for course: ${courseId}`);
        // Unfortunately, Upstash Redis REST API doesn't support pattern matching (KEYS/SCAN commands)
        // So we need to use a different approach, like maintaining a list of keys for each course
        // For now, we'll implement a basic solution that requires manual management
        // If we have a list of videos for this course, we could iterate through them
        // This would be more efficient with a Redis SCAN operation, but it's not available via REST API
        // Just log the operation for now
        logger_1.default.info(`Full course cache invalidation for ${courseId} is not supported via REST API`);
        logger_1.default.info(`Consider implementing a key tracking mechanism for more efficient invalidation`);
    }
    catch (error) {
        logger_1.default.error('Error invalidating course cache:', error);
    }
});
exports.invalidateCourseCache = invalidateCourseCache;
