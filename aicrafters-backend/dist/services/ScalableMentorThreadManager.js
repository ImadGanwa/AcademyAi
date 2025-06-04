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
exports.ScalableMentorThreadManager = void 0;
const openai_1 = require("openai");
const redisClient_1 = __importStar(require("../utils/redisClient"));
const logger_1 = __importDefault(require("../config/logger"));
// Initialize OpenAI client
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
class ScalableMentorThreadManager {
    /**
     * Get or create a conversation thread for a user (mentor-specific or general)
     * Uses Redis for distributed storage across multiple server instances
     */
    getOrCreateMentorThread(userId, mentorId, initialContext) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate thread key - if mentorId provided, create mentor-specific thread
            const threadKey = mentorId
                ? `mentor_thread:${userId}:${mentorId}`
                : `mentor_thread:${userId}:general`;
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
                        mentorId,
                        created: Date.now(),
                        lastAccessed: Date.now(),
                        type: mentorId ? 'specific_mentor' : 'general'
                    };
                    yield redisClient_1.default.setex(`mentor_thread_meta:${threadId}`, redisClient_1.TTL.THREAD, JSON.stringify(metadata));
                    // Add initial context if provided
                    if (initialContext === null || initialContext === void 0 ? void 0 : initialContext.trim()) {
                        yield openai.beta.threads.messages.create(threadId, {
                            role: "user",
                            content: initialContext
                        });
                    }
                    logger_1.default.info(`Created new mentor thread ${threadId} for user ${userId}${mentorId ? ` with mentor ${mentorId}` : ' (general)'}`);
                }
                else {
                    // Update last accessed time for existing thread
                    yield this.updateLastAccessed(threadId);
                    logger_1.default.debug(`Using existing mentor thread ${threadId} for user ${userId}${mentorId ? ` with mentor ${mentorId}` : ' (general)'}`);
                }
                return threadId;
            }
            catch (error) {
                logger_1.default.error('Error in getOrCreateMentorThread:', error);
                throw new Error(`Failed to get or create mentor thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Switch context when user starts talking to a specific mentor
     */
    switchToMentorContext(threadId, mentorId, mentorInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!mentorInfo || !mentorId) {
                return;
            }
            try {
                const contextMessage = `You are now in a conversation context with a specific mentor: ${mentorInfo.fullName || 'Mentor'}.
      
      Mentor Details:
      - Name: ${mentorInfo.fullName || 'Not specified'}
      - Skills: ${((_a = mentorInfo.skills) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'Not specified'}
      - Languages: ${((_b = mentorInfo.languages) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'Not specified'}
      - Countries: ${((_c = mentorInfo.countries) === null || _c === void 0 ? void 0 : _c.join(', ')) || 'Not specified'}
      - Bio: ${mentorInfo.bio || 'Not provided'}
      - Professional Info: ${mentorInfo.professionalInfo ? JSON.stringify(mentorInfo.professionalInfo) : 'Not provided'}
      
      Please adjust your responses to be more personalized and reference this mentor's specific expertise when relevant.
      Help the user understand how this mentor's background aligns with their needs and prepare them for mentorship sessions.`;
                yield openai.beta.threads.messages.create(threadId, {
                    role: "user",
                    content: contextMessage
                });
                logger_1.default.debug(`Added mentor context for ${mentorId} to thread ${threadId}`);
            }
            catch (error) {
                logger_1.default.error('Error adding mentor context to thread:', error);
                throw new Error(`Failed to add mentor context: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Update last accessed time for thread metadata
     */
    updateLastAccessed(threadId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const metaKey = `mentor_thread_meta:${threadId}`;
                const metadataStr = yield redisClient_1.default.get(metaKey);
                if (metadataStr) {
                    const metadata = JSON.parse(metadataStr);
                    metadata.lastAccessed = Date.now();
                    yield redisClient_1.default.setex(metaKey, redisClient_1.TTL.THREAD, JSON.stringify(metadata));
                }
            }
            catch (error) {
                logger_1.default.warn('Failed to update last accessed time for mentor thread:', error);
                // Don't throw - this is not critical
            }
        });
    }
    /**
     * Clear mentor thread data for a specific user (useful for testing or manual cleanup)
     */
    clearMentorThreadForUser(userId, mentorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const threadKey = mentorId
                ? `mentor_thread:${userId}:${mentorId}`
                : `mentor_thread:${userId}:general`;
            try {
                const threadId = yield redisClient_1.default.get(threadKey);
                if (threadId) {
                    // Delete thread mapping
                    yield redisClient_1.default.del(threadKey);
                    // Delete metadata
                    yield redisClient_1.default.del(`mentor_thread_meta:${threadId}`);
                    logger_1.default.info(`Cleared mentor thread data for user ${userId}${mentorId ? ` with mentor ${mentorId}` : ' (general)'}`);
                }
            }
            catch (error) {
                logger_1.default.error('Error clearing mentor thread data:', error);
                throw new Error(`Failed to clear mentor thread data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    /**
     * Get all mentor threads for a user
     */
    getUserMentorThreads(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all thread keys for this user
                const generalKey = `mentor_thread:${userId}:general`;
                const mentorKeys = yield redisClient_1.default.keys(`mentor_thread:${userId}:*`);
                const threads = [];
                for (const key of mentorKeys) {
                    const threadId = yield redisClient_1.default.get(key);
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
            }
            catch (error) {
                logger_1.default.error('Error getting user mentor threads:', error);
                return [];
            }
        });
    }
    /**
     * Get mentor thread statistics (useful for monitoring)
     */
    getMentorThreadStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allThreadKeys = yield redisClient_1.default.keys('mentor_thread:*');
                const generalThreads = allThreadKeys.filter(key => key.endsWith(':general')).length;
                const mentorSpecificThreads = allThreadKeys.length - generalThreads;
                return {
                    totalThreads: allThreadKeys.length,
                    generalThreads,
                    mentorSpecificThreads
                };
            }
            catch (error) {
                logger_1.default.error('Error getting mentor thread stats:', error);
                return { totalThreads: 0, generalThreads: 0, mentorSpecificThreads: 0 };
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
                logger_1.default.error('Mentor service Redis health check failed:', error);
                return false;
            }
        });
    }
    /**
     * Clean up expired threads (utility function)
     */
    cleanupExpiredThreads() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allThreadKeys = yield redisClient_1.default.keys('mentor_thread:*');
                let cleanedCount = 0;
                for (const key of allThreadKeys) {
                    const ttl = yield redisClient_1.default.ttl(key);
                    if (ttl === -1) { // Key exists but has no TTL
                        yield redisClient_1.default.expire(key, redisClient_1.TTL.THREAD);
                    }
                    else if (ttl === -2) { // Key doesn't exist
                        cleanedCount++;
                    }
                }
                if (cleanedCount > 0) {
                    logger_1.default.info(`Cleaned up ${cleanedCount} expired mentor threads`);
                }
                return cleanedCount;
            }
            catch (error) {
                logger_1.default.error('Error cleaning up expired mentor threads:', error);
                return 0;
            }
        });
    }
}
exports.ScalableMentorThreadManager = ScalableMentorThreadManager;
