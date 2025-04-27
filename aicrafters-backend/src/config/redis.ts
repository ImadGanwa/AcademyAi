import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

let redisClient: Redis | null = null;
let hasLoggedConnectionError = false;

const initRedis = async () => {
  try {
    // Wait a bit to ensure environment variables are loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.error('[Upstash Redis] Missing configuration:', {
        hasUrl: !!url,
        hasToken: !!token,
        envKeys: Object.keys(process.env).filter(key => key.includes('UPSTASH'))
      });
      return null;
    }

    console.log('[Upstash Redis] Attempting connection with:', {
      url: url.substring(0, 30) + '...',
      hasToken: !!token
    });

    const client = new Redis({
      url,
      token,
    });

    // Test the connection
    await client.ping();
    redisClient = client;
    console.log('[Upstash Redis] Client Connected Successfully');
    return client;
  } catch (error) {
    if (!hasLoggedConnectionError) {
      console.error('[Upstash Redis] Connection error:', error);
      hasLoggedConnectionError = true;
    }
    return null;
  }
};

// Try to connect with retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const connectWithRetry = async (retryCount = 0) => {
  const client = await initRedis();
  if (!client && retryCount < MAX_RETRIES) {
    console.log(`[Upstash Redis] Retrying connection in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return connectWithRetry(retryCount + 1);
  }
  return client;
};

// Initialize connection
connectWithRetry().catch((error) => {
  console.error('[Upstash Redis] Failed to connect after retries:', error);
  redisClient = null;
});

export default {
  get: async <T>(key: string): Promise<T | null> => {
    if (!redisClient) return null;
    try {
      const value = await redisClient.get<T>(key);
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value as unknown as T;
        }
      }
      return value;
    } catch (error) {
      console.error('[Upstash Redis] Get error:', error);
      return null;
    }
  },
  setEx: async (key: string, seconds: number, value: any): Promise<void> => {
    if (!redisClient) return;
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.set(key, stringValue, { ex: seconds });
    } catch (error) {
      console.error('[Upstash Redis] SetEx error:', error);
    }
  }
}; 
