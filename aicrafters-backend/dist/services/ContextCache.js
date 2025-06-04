"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ContextCache = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const redisClient_1 = __importStar(require("../utils/redisClient"));
const VideoTranscription_1 = require("../models/VideoTranscription");
const logger_1 = __importDefault(require("../config/logger"));
class ContextCache {
    /**
     * Get or build context with Redis caching
     * This dramatically reduces database load by caching context data
     */
    getOrBuildContext(courseId, videoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = redisClient_1.generateKeys.context(courseId, videoUrl);
            try {
                // Try cache first (fast)
                const cachedContext = yield redisClient_1.default.get(cacheKey);
                if (cachedContext) {
                    logger_1.default.debug(`Context cache hit for course ${courseId}, video ${videoUrl}`);
                    return cachedContext;
                }
                // Cache miss - build context from database (slow)
                logger_1.default.debug(`Context cache miss for course ${courseId}, video ${videoUrl} - building from DB`);
                const context = yield this.buildContextFromDB(courseId, videoUrl);
                // Cache for future requests
                yield redisClient_1.default.setex(cacheKey, redisClient_1.TTL.CONTEXT, context);
                return context;
            }
            catch (error) {
                logger_1.default.error('Error in getOrBuildContext:', error);
                // Fallback to building context without caching
                return yield this.buildContextFromDB(courseId, videoUrl);
            }
        });
    }
    /**
     * Build context from database with optimizations
     */
    buildContextFromDB(courseId, videoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseObjectId = new mongoose_1.default.Types.ObjectId(courseId);
                // Use lean() for better performance - returns plain objects instead of Mongoose documents
                const transcriptionData = yield VideoTranscription_1.VideoTranscription.findOne({
                    courseId: courseObjectId,
                    videoUrl
                }).lean().exec();
                if (!transcriptionData) {
                    return "No transcription data available for this video.";
                }
                return this.formatContext(transcriptionData);
            }
            catch (error) {
                logger_1.default.error('Error building context from DB:', error);
                return "Error loading transcription data for this video.";
            }
        });
    }
    /**
     * Format context data into a structured string
     */
    formatContext(transcriptionData) {
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
    preloadCourseContext(courseId, videoUrls) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Preloading context for ${videoUrls.length} videos in course ${courseId}`);
            const promises = videoUrls.map(videoUrl => this.getOrBuildContext(courseId, videoUrl).catch(error => {
                logger_1.default.warn(`Failed to preload context for video ${videoUrl}:`, error);
                return null;
            }));
            yield Promise.allSettled(promises);
            logger_1.default.info(`Completed preloading context for course ${courseId}`);
        });
    }
    /**
     * Invalidate cache for specific video (useful when transcription is updated)
     */
    invalidateContext(courseId, videoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = redisClient_1.generateKeys.context(courseId, videoUrl);
            try {
                yield redisClient_1.default.del(cacheKey);
                logger_1.default.info(`Invalidated context cache for course ${courseId}, video ${videoUrl}`);
            }
            catch (error) {
                logger_1.default.error('Error invalidating context cache:', error);
            }
        });
    }
    /**
     * Invalidate all context cache for a course (useful when course is updated)
     */
    invalidateCourseContext(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all cache keys for this course
                const pattern = redisClient_1.generateKeys.context(courseId, '*');
                const keys = yield redisClient_1.default.keys(pattern);
                if (keys.length > 0) {
                    yield redisClient_1.default.del(...keys);
                    logger_1.default.info(`Invalidated ${keys.length} context cache entries for course ${courseId}`);
                }
            }
            catch (error) {
                logger_1.default.error('Error invalidating course context cache:', error);
            }
        });
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contextKeys = yield redisClient_1.default.keys(`${redisClient_1.generateKeys.context('*', '*')}`);
                return {
                    totalCachedContexts: contextKeys.length,
                    cacheSize: `${contextKeys.length} entries`
                };
            }
            catch (error) {
                logger_1.default.error('Error getting cache stats:', error);
                return { totalCachedContexts: 0, cacheSize: '0 entries' };
            }
        });
    }
    /**
     * Warm up cache with most accessed content
     */
    warmUpCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info('Starting cache warm-up...');
                // Get recently updated transcriptions to warm up cache
                const recentTranscriptions = yield VideoTranscription_1.VideoTranscription.find({
                    status: 'completed',
                    updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
                })
                    .select('courseId videoUrl')
                    .limit(100)
                    .lean()
                    .exec();
                const warmUpPromises = recentTranscriptions.map(({ courseId, videoUrl }) => this.getOrBuildContext(courseId.toString(), videoUrl).catch(error => {
                    logger_1.default.warn(`Failed to warm up cache for ${courseId}/${videoUrl}:`, error);
                }));
                yield Promise.allSettled(warmUpPromises);
                logger_1.default.info(`Cache warm-up completed for ${recentTranscriptions.length} entries`);
            }
            catch (error) {
                logger_1.default.error('Error during cache warm-up:', error);
            }
        });
    }
}
exports.ContextCache = ContextCache;
