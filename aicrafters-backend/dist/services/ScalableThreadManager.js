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
exports.ScalableThreadManager = void 0;
const openai_1 = require("openai");
const redisClient_1 = __importStar(require("../utils/redisClient"));
const logger_1 = __importDefault(require("../config/logger"));
// Initialize OpenAI client
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
class ScalableThreadManager {
    /**
     * Get or create a conversation thread for a user and course combination
     * Uses Redis for distributed storage across multiple server instances
     */
    getOrCreateThread(userId, courseId, initialContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const threadKey = redisClient_1.generateKeys.thread(userId, courseId);
            try {
                // Try to get existing thread
                let threadId = yield redisClient_1.default.get(threadKey);
                if (!threadId) {
                    // Create new thread
                    const thread = yield openai.beta.threads.create();
                    threadId = thread.id;
                    // Store thread with TTL
                    yield redisClient_1.default.setex(threadKey, redisClient_1.TTL.THREAD, threadId);
                    // Store metadata
                    const metadata = {
                        userId,
                        courseId,
                        created: Date.now(),
                        lastAccessed: Date.now()
                    };
                    yield redisClient_1.default.setex(redisClient_1.generateKeys.threadMeta(threadId), redisClient_1.TTL.THREAD, JSON.stringify(metadata));
                    // Add initial context if provided
                    if (initialContext === null || initialContext === void 0 ? void 0 : initialContext.trim()) {
                        yield openai.beta.threads.messages.create(threadId, {
                            role: "user",
                            content: `Context for this course conversation:\n${initialContext}`
                        });
                    }
                    logger_1.default.info(`Created new thread ${threadId} for user ${userId} in course ${courseId}`);
                }
                else {
                    // Update last accessed time for existing thread
                    yield this.updateLastAccessed(threadId);
                    logger_1.default.debug(`Using existing thread ${threadId} for user ${userId} in course ${courseId}`);
                }
                return threadId;
            }
            catch (error) {
                logger_1.default.error('Error in getOrCreateThread:', error);
                throw new Error(`Failed to get or create thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Track video changes and return whether video has changed
     * This enables adding new video context to existing threads
     */
    trackVideoChange(threadId, videoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastVideoKey = redisClient_1.generateKeys.lastVideo(threadId);
            try {
                const lastVideo = yield redisClient_1.default.get(lastVideoKey);
                if (lastVideo && lastVideo !== videoUrl) {
                    // Video changed - update tracking
                    yield redisClient_1.default.setex(lastVideoKey, redisClient_1.TTL.VIDEO_TRACKING, videoUrl);
                    logger_1.default.info(`Video changed from ${lastVideo} to ${videoUrl} in thread ${threadId}`);
                    return true;
                }
                // Set current video (first time or same video)
                yield redisClient_1.default.setex(lastVideoKey, redisClient_1.TTL.VIDEO_TRACKING, videoUrl);
                return false;
            }
            catch (error) {
                logger_1.default.error('Error in trackVideoChange:', error);
                // Don't throw - video tracking is not critical
                return false;
            }
        });
    }
    /**
     * Add video context to an existing thread when video changes
     */
    addVideoContextToThread(threadId, videoContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(videoContext === null || videoContext === void 0 ? void 0 : videoContext.trim())) {
                return;
            }
            try {
                yield openai.beta.threads.messages.create(threadId, {
                    role: "user",
                    content: `New video context (video changed within course):\n${videoContext}`
                });
                logger_1.default.debug(`Added new video context to thread ${threadId}`);
            }
            catch (error) {
                logger_1.default.error('Error adding video context to thread:', error);
                throw new Error(`Failed to add video context: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Update last accessed time for thread metadata
     */
    updateLastAccessed(threadId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const metaKey = redisClient_1.generateKeys.threadMeta(threadId);
                const metadataStr = yield redisClient_1.default.get(metaKey);
                if (metadataStr) {
                    const metadata = JSON.parse(metadataStr);
                    metadata.lastAccessed = Date.now();
                    yield redisClient_1.default.setex(metaKey, redisClient_1.TTL.THREAD, JSON.stringify(metadata));
                }
            }
            catch (error) {
                logger_1.default.warn('Failed to update last accessed time:', error);
                // Don't throw - this is not critical
            }
        });
    }
    /**
     * Clear thread data for a specific user and course (useful for testing or manual cleanup)
     */
    clearThreadForUserAndCourse(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const threadKey = redisClient_1.generateKeys.thread(userId, courseId);
            try {
                const threadId = yield redisClient_1.default.get(threadKey);
                if (threadId) {
                    // Delete thread mapping
                    yield redisClient_1.default.del(threadKey);
                    // Delete video tracking
                    yield redisClient_1.default.del(redisClient_1.generateKeys.lastVideo(threadId));
                    // Delete metadata
                    yield redisClient_1.default.del(redisClient_1.generateKeys.threadMeta(threadId));
                    logger_1.default.info(`Cleared thread data for user ${userId} in course ${courseId}`);
                }
            }
            catch (error) {
                logger_1.default.error('Error clearing thread data:', error);
                throw new Error(`Failed to clear thread data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Get thread statistics (useful for monitoring)
     */
    getThreadStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Note: SCAN is expensive on large datasets, use sparingly
                const threadKeys = yield redisClient_1.default.keys(`${redisClient_1.generateKeys.thread('*', '*')}`);
                const stats = {
                    totalThreads: threadKeys.length,
                    threadsByPattern: {
                        active: threadKeys.length
                    }
                };
                return stats;
            }
            catch (error) {
                logger_1.default.error('Error getting thread stats:', error);
                return { totalThreads: 0, threadsByPattern: {} };
            }
        });
    }
    /**
     * Health check for Redis connection
     */
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield redisClient_1.default.ping();
                return true;
            }
            catch (error) {
                logger_1.default.error('Redis health check failed:', error);
                return false;
            }
        });
    }
}
exports.ScalableThreadManager = ScalableThreadManager;
