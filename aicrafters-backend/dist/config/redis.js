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
const redis_1 = require("@upstash/redis");
const dotenv_1 = __importDefault(require("dotenv"));
// Ensure environment variables are loaded
dotenv_1.default.config();
let redisClient = null;
let hasLoggedConnectionError = false;
const initRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Wait a bit to ensure environment variables are loaded
        yield new Promise(resolve => setTimeout(resolve, 100));
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
        const client = new redis_1.Redis({
            url,
            token,
        });
        // Test the connection
        yield client.ping();
        redisClient = client;
        console.log('[Upstash Redis] Client Connected Successfully');
        return client;
    }
    catch (error) {
        if (!hasLoggedConnectionError) {
            console.error('[Upstash Redis] Connection error:', error);
            hasLoggedConnectionError = true;
        }
        return null;
    }
});
// Try to connect with retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const connectWithRetry = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (retryCount = 0) {
    const client = yield initRedis();
    if (!client && retryCount < MAX_RETRIES) {
        console.log(`[Upstash Redis] Retrying connection in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`);
        yield new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return connectWithRetry(retryCount + 1);
    }
    return client;
});
// Initialize connection
connectWithRetry().catch((error) => {
    console.error('[Upstash Redis] Failed to connect after retries:', error);
    redisClient = null;
});
exports.default = {
    get: (key) => __awaiter(void 0, void 0, void 0, function* () {
        if (!redisClient)
            return null;
        try {
            const value = yield redisClient.get(key);
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                }
                catch (_a) {
                    return value;
                }
            }
            return value;
        }
        catch (error) {
            console.error('[Upstash Redis] Get error:', error);
            return null;
        }
    }),
    setEx: (key, seconds, value) => __awaiter(void 0, void 0, void 0, function* () {
        if (!redisClient)
            return;
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            yield redisClient.set(key, stringValue, { ex: seconds });
        }
        catch (error) {
            console.error('[Upstash Redis] SetEx error:', error);
        }
    })
};
