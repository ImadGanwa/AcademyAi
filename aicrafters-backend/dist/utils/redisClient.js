"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL = exports.generateKeys = exports.REDIS_KEYS = void 0;
const redis_1 = require("@upstash/redis");
// Initialize Upstash Redis client
const redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
// Redis key prefixes for organization
exports.REDIS_KEYS = {
    THREAD: 'thread',
    LAST_VIDEO: 'last_video',
    CONTEXT_CACHE: 'context',
    THREAD_META: 'thread_meta',
    CHAT_QUEUE: 'chat_queue'
};
// Helper functions for key generation
exports.generateKeys = {
    thread: (userId, courseId) => `${exports.REDIS_KEYS.THREAD}:${userId}:${courseId}`,
    lastVideo: (threadId) => `${exports.REDIS_KEYS.LAST_VIDEO}:${threadId}`,
    context: (courseId, videoUrl) => `${exports.REDIS_KEYS.CONTEXT_CACHE}:${courseId}:${encodeURIComponent(videoUrl)}`,
    threadMeta: (threadId) => `${exports.REDIS_KEYS.THREAD_META}:${threadId}`
};
// TTL constants (in seconds)
exports.TTL = {
    THREAD: 7 * 24 * 60 * 60, // 7 days
    CONTEXT: 60 * 60, // 1 hour
    VIDEO_TRACKING: 7 * 24 * 60 * 60 // 7 days
};
exports.default = redis;
