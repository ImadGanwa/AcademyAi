import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Redis key prefixes for organization
export const REDIS_KEYS = {
  THREAD: 'thread',
  LAST_VIDEO: 'last_video',
  CONTEXT_CACHE: 'context',
  THREAD_META: 'thread_meta',
  CHAT_QUEUE: 'chat_queue'
} as const;

// Helper functions for key generation
export const generateKeys = {
  thread: (userId: string, courseId: string) => `${REDIS_KEYS.THREAD}:${userId}:${courseId}`,
  lastVideo: (threadId: string) => `${REDIS_KEYS.LAST_VIDEO}:${threadId}`,
  context: (courseId: string, videoUrl: string) => `${REDIS_KEYS.CONTEXT_CACHE}:${courseId}:${encodeURIComponent(videoUrl)}`,
  threadMeta: (threadId: string) => `${REDIS_KEYS.THREAD_META}:${threadId}`
};

// TTL constants (in seconds)
export const TTL = {
  THREAD: 7 * 24 * 60 * 60, // 7 days
  CONTEXT: 60 * 60, // 1 hour
  VIDEO_TRACKING: 7 * 24 * 60 * 60 // 7 days
} as const;

export default redis; 