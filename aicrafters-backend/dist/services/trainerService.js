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
exports.contextCache = exports.threadManager = void 0;
exports.chatWithTrainer = chatWithTrainer;
exports.clearThreadForUserAndCourse = clearThreadForUserAndCourse;
exports.getSystemStats = getSystemStats;
exports.preloadPopularContent = preloadPopularContent;
exports.invalidateContextCache = invalidateContextCache;
const openai_1 = require("openai");
const ScalableThreadManager_1 = require("./ScalableThreadManager");
const ContextCache_1 = require("./ContextCache");
const logger_1 = __importDefault(require("../config/logger"));
// Initialize OpenAI client
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
// Initialize scalable components
const threadManager = new ScalableThreadManager_1.ScalableThreadManager();
exports.threadManager = threadManager;
const contextCache = new ContextCache_1.ContextCache();
exports.contextCache = contextCache;
// Type guard to check if content is text
function isTextContent(content) {
    return content.type === 'text' && content.text && typeof content.text.value === 'string';
}
/**
 * Chat with the trainer coach - Now scalable for 1000+ concurrent users
 */
function chatWithTrainer(userId, courseId, videoUrl, message, threadId) {
    return __awaiter(this, void 0, void 0, function* () {
        const startTime = Date.now();
        try {
            logger_1.default.info(`Chat request from user ${userId} in course ${courseId}`);
            // Build context using Redis cache (dramatically reduces DB load)
            const currentVideoContext = yield contextCache.getOrBuildContext(courseId, videoUrl);
            // Get or create thread using Redis storage (scales across multiple instances)
            const actualThreadId = threadId || (yield threadManager.getOrCreateThread(userId, courseId, currentVideoContext));
            // Check if video changed within the same course (Redis-based tracking)
            const videoChanged = yield threadManager.trackVideoChange(actualThreadId, videoUrl);
            if (videoChanged) {
                // Video changed within the same course - add new video context
                yield threadManager.addVideoContextToThread(actualThreadId, currentVideoContext);
            }
            // Add the user message to the thread
            yield openai.beta.threads.messages.create(actualThreadId, {
                role: "user",
                content: message
            });
            // Run the assistant on the thread with retry logic
            const response = yield runAssistantWithRetry(actualThreadId);
            const duration = Date.now() - startTime;
            logger_1.default.info(`Chat request completed in ${duration}ms for user ${userId}`);
            return {
                response,
                threadId: actualThreadId
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.default.error(`Chat request failed after ${duration}ms for user ${userId}:`, error);
            throw new Error(`Failed to chat with trainer: ${error.message}`);
        }
    });
}
/**
 * Run OpenAI assistant with retry logic and better error handling
 */
function runAssistantWithRetry(threadId_1) {
    return __awaiter(this, arguments, void 0, function* (threadId, maxRetries = 3) {
        var _a;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Run the assistant on the thread
                const run = yield openai.beta.threads.runs.create(threadId, {
                    assistant_id: process.env.OPENAI_ASSISTANT_ID
                });
                // Poll for completion with exponential backoff
                let runStatus = yield openai.beta.threads.runs.retrieve(threadId, run.id);
                let pollCount = 0;
                const maxPolls = 60; // 60 seconds timeout
                while (runStatus.status !== "completed" && runStatus.status !== "failed" && pollCount < maxPolls) {
                    // Exponential backoff: 1s, 2s, 4s, then 1s intervals
                    const delay = pollCount < 3 ? Math.pow(2, pollCount) * 1000 : 1000;
                    yield new Promise(resolve => setTimeout(resolve, delay));
                    runStatus = yield openai.beta.threads.runs.retrieve(threadId, run.id);
                    pollCount++;
                }
                if (runStatus.status !== "completed") {
                    throw new Error(`Assistant run failed with status: ${runStatus.status}`);
                }
                // Get the assistant's response
                const messages = yield openai.beta.threads.messages.list(threadId);
                const assistantMessages = messages.data.filter(msg => msg.role === "assistant" && msg.run_id === run.id);
                const assistantResponse = ((_a = assistantMessages[0]) === null || _a === void 0 ? void 0 : _a.content.filter(part => isTextContent(part)).map(part => isTextContent(part) ? part.text.value : '').join("\n")) || "No response generated.";
                return assistantResponse;
            }
            catch (error) {
                logger_1.default.warn(`Assistant run attempt ${attempt} failed:`, error);
                if (attempt === maxRetries) {
                    throw error;
                }
                // Wait before retry with exponential backoff
                const retryDelay = Math.pow(2, attempt) * 1000;
                yield new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        throw new Error("Maximum retries exceeded");
    });
}
/**
 * Clear thread data for a specific user and course (useful for testing or manual cleanup)
 */
function clearThreadForUserAndCourse(userId, courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield threadManager.clearThreadForUserAndCourse(userId, courseId);
    });
}
/**
 * Get system statistics for monitoring
 */
function getSystemStats() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [threadStats, cacheStats, redisHealth] = yield Promise.all([
                threadManager.getThreadStats(),
                contextCache.getCacheStats(),
                threadManager.healthCheck()
            ]);
            return {
                threads: threadStats,
                cache: cacheStats,
                health: { redis: redisHealth }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting system stats:', error);
            return {
                threads: { totalThreads: 0, threadsByPattern: {} },
                cache: { totalCachedContexts: 0, cacheSize: '0 entries' },
                health: { redis: false }
            };
        }
    });
}
/**
 * Preload cache for popular content (useful for performance optimization)
 */
function preloadPopularContent() {
    return __awaiter(this, void 0, void 0, function* () {
        yield contextCache.warmUpCache();
    });
}
/**
 * Invalidate cache when content is updated
 */
function invalidateContextCache(courseId, videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (videoUrl) {
            yield contextCache.invalidateContext(courseId, videoUrl);
        }
        else {
            yield contextCache.invalidateCourseContext(courseId);
        }
    });
}
