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
const mongoose_1 = __importDefault(require("mongoose"));
const VideoTranscription_1 = require("../models/VideoTranscription");
const transcriptionApi_1 = require("../utils/transcriptionApi");
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = __importDefault(require("../config/redis"));
dotenv_1.default.config();
// Cache TTL setting
const TRANSCRIPTION_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days in seconds
function processVideoDirectly() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(process.env.MONGODB_URI || '');
            console.log('Connected to MongoDB');
            const courseId = '67c3e57e754c83ca019ea97e';
            const accessToken = process.env.VIMEO_ACCESS_TOKEN;
            if (!accessToken) {
                throw new Error('VIMEO_ACCESS_TOKEN is not set in environment variables');
            }
            // Process specific videos
            const videoUrls = [
                'https://vimeo.com/1017725861/c2cd4540a2',
                'https://vimeo.com/1017726547'
            ];
            console.log('Starting direct video processing...');
            // Process videos one by one
            for (const videoUrl of videoUrls) {
                console.log(`\nProcessing video: ${videoUrl}`);
                try {
                    // Get transcription directly
                    const transcript = yield (0, transcriptionApi_1.getTranscription)(videoUrl, accessToken);
                    console.log(`Transcription received with length: ${transcript.length}`);
                    // Update or create transcription record
                    yield VideoTranscription_1.VideoTranscription.findOneAndUpdate({ courseId, videoUrl }, {
                        transcription: transcript,
                        status: 'completed',
                        error: undefined,
                        lastAttempt: new Date()
                    }, { upsert: true });
                    // Cache the transcription in Redis for fast access
                    const cacheKey = `transcription:${courseId}:${encodeURIComponent(videoUrl)}`;
                    yield redis_1.default.setEx(cacheKey, TRANSCRIPTION_CACHE_TTL, transcript);
                    console.log(`Cached transcription with key: ${cacheKey}`);
                    console.log(`Completed processing for ${videoUrl}`);
                }
                catch (error) {
                    console.error(`Error processing ${videoUrl}:`, error);
                    // Update transcription record with error
                    yield VideoTranscription_1.VideoTranscription.findOneAndUpdate({ courseId, videoUrl }, {
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                        lastAttempt: new Date()
                    }, { upsert: true });
                }
            }
            console.log('\nAll videos processed.');
        }
        catch (error) {
            console.error('Error:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('\nDisconnected from MongoDB');
        }
    });
}
processVideoDirectly();
