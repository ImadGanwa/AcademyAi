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
exports.TranscriptionService = void 0;
const Course_1 = require("../models/Course");
const VideoTranscription_1 = require("../models/VideoTranscription");
const transcriptionApi_1 = require("../utils/transcriptionApi");
const summaryService_1 = require("./summaryService");
const redis_1 = __importDefault(require("../config/redis"));
const logger_1 = __importDefault(require("../config/logger"));
// Cache TTL settings
// TODO: Move hardcoded cache TTL to environment variables or configuration
const TRANSCRIPTION_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days in seconds
class TranscriptionService {
    static processCourseVideos(courseId, accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const course = yield Course_1.Course.findById(courseId);
                if (!course) {
                    throw new Error('Course not found');
                }
                // Extract all video URLs from course content
                const videoUrls = this.extractVideoUrls(course);
                // Process videos in chunks to avoid overwhelming the system
                const chunkSize = 3; // Process 3 videos at a time
                for (let i = 0; i < videoUrls.length; i += chunkSize) {
                    const chunk = videoUrls.slice(i, i + chunkSize);
                    yield Promise.all(chunk.map(url => this.processVideo(courseId, url, accessToken)));
                    // Add a small delay between chunks
                    if (i + chunkSize < videoUrls.length) {
                        yield new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                // After all transcriptions are processed, trigger summary generation if OPENAI_API_KEY is set
                if (process.env.OPENAI_API_KEY) {
                    try {
                        yield summaryService_1.SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY);
                    }
                    catch (error) {
                        logger_1.default.error('Error generating summaries:', error);
                        // Don't throw here, as we don't want to fail the transcription process if summary generation fails
                    }
                }
            }
            catch (error) {
                logger_1.default.error('Error processing course videos:', error);
                throw error;
            }
        });
    }
    static extractVideoUrls(course) {
        const videoUrls = [];
        const content = course.content || [];
        // Helper function to recursively extract video URLs from content blocks
        const extractFromContent = (blocks) => {
            var _a, _b, _c;
            for (const block of blocks) {
                if (block.type === 'video' && ((_a = block.data) === null || _a === void 0 ? void 0 : _a.url)) {
                    videoUrls.push(block.data.url);
                }
                else if (block.type === 'section' && Array.isArray((_b = block.data) === null || _b === void 0 ? void 0 : _b.content)) {
                    extractFromContent(block.data.content);
                }
                else if (block.type === 'subsection' && Array.isArray((_c = block.data) === null || _c === void 0 ? void 0 : _c.content)) {
                    extractFromContent(block.data.content);
                }
                // Add more block types as needed
            }
        };
        extractFromContent(content);
        return [...new Set(videoUrls)]; // Remove duplicates
    }
    static processVideo(courseId, videoUrl, accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if transcription already exists
                let transcription = yield VideoTranscription_1.VideoTranscription.findOne({ courseId, videoUrl });
                if (!transcription) {
                    transcription = new VideoTranscription_1.VideoTranscription({
                        courseId,
                        videoUrl,
                        retryCount: 0 // Initialize retry count
                    });
                }
                // Skip if already completed
                if (transcription.status === 'completed') {
                    return;
                }
                // Skip if max retries reached
                if (transcription.retryCount >= this.MAX_RETRIES) {
                    logger_1.default.info(`Max retries (${this.MAX_RETRIES}) reached for video ${videoUrl}. Skipping.`);
                    return;
                }
                // Check if we should retry (if last attempt was more than 10 minutes ago)
                const timeSinceLastAttempt = Date.now() - transcription.lastAttempt.getTime();
                if (transcription.status === 'failed' && timeSinceLastAttempt < this.RETRY_DELAY) {
                    return;
                }
                // Update status and attempt time
                transcription.status = 'pending';
                transcription.lastAttempt = new Date();
                transcription.retryCount = (transcription.retryCount || 0) + 1;
                yield transcription.save();
                // Get transcription from Vimeo
                const transcript = yield (0, transcriptionApi_1.getTranscription)(videoUrl, accessToken);
                // Update transcription record
                transcription.transcription = transcript;
                transcription.status = 'completed';
                transcription.error = undefined;
                yield transcription.save();
                // Cache the transcription in Redis for fast access
                const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
                yield redis_1.default.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcript);
                logger_1.default.info(`Cached transcription for ${videoUrl} with key: ${cacheKey}`);
            }
            catch (error) {
                logger_1.default.error(`Error processing video ${videoUrl}:`, error);
                // Update transcription record with error
                yield VideoTranscription_1.VideoTranscription.findOneAndUpdate({ courseId, videoUrl }, {
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error occurred',
                    lastAttempt: new Date(),
                    $inc: { retryCount: 1 } // Increment retry count
                }, { upsert: true });
            }
        });
    }
    static getTranscription(courseId, videoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Try to get from Redis cache first
                const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
                const cachedTranscription = yield redis_1.default.get(cacheKey);
                if (cachedTranscription) {
                    logger_1.default.info(`Retrieved transcription from cache for key: ${cacheKey}`);
                    return cachedTranscription;
                }
                // If not in cache, get from database
                const transcription = yield VideoTranscription_1.VideoTranscription.findOne({ courseId, videoUrl });
                const transcriptionText = (transcription === null || transcription === void 0 ? void 0 : transcription.transcription) || null;
                // Cache the result if found
                if (transcriptionText) {
                    yield redis_1.default.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcriptionText);
                    logger_1.default.info(`Cached transcription from database with key: ${cacheKey}`);
                }
                return transcriptionText;
            }
            catch (error) {
                logger_1.default.error(`Error retrieving transcription for ${videoUrl}:`, error);
                return null;
            }
        });
    }
    /**
     * Updates a transcription in the database
     *
     * @param courseId - The ID of the course
     * @param videoUrl - The URL of the video
     * @param transcriptionText - The new transcription text
     * @returns Promise<void>
     */
    static updateTranscription(courseId, videoUrl, transcriptionText) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find the existing transcription
                let transcription = yield VideoTranscription_1.VideoTranscription.findOne({ courseId, videoUrl });
                if (!transcription) {
                    // Create a new transcription if it doesn't exist
                    transcription = new VideoTranscription_1.VideoTranscription({
                        courseId,
                        videoUrl,
                        transcription: transcriptionText,
                        status: 'completed',
                        lastAttempt: new Date(),
                        retryCount: 0
                    });
                }
                else {
                    // Update the existing transcription
                    transcription.transcription = transcriptionText;
                    transcription.status = 'completed';
                    transcription.error = undefined;
                    transcription.lastAttempt = new Date();
                }
                // Save to database
                yield transcription.save();
                // Update the cache
                const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
                yield redis_1.default.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcriptionText);
                logger_1.default.info(`Updated transcription in cache for key: ${cacheKey}`);
            }
            catch (error) {
                logger_1.default.error(`Error updating transcription for ${videoUrl}:`, error);
                throw error;
            }
        });
    }
}
exports.TranscriptionService = TranscriptionService;
// TODO: Move hardcoded retry values to environment variables or configuration
TranscriptionService.RETRY_DELAY = 10 * 60 * 1000; // 10 minutes in milliseconds
TranscriptionService.MAX_RETRIES = 3; // Maximum number of retry attempts
