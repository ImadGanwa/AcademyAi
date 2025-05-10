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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionService = void 0;
const Course_1 = require("../models/Course");
const VideoTranscription_1 = require("../models/VideoTranscription");
const transcriptionApi_1 = require("../utils/transcriptionApi");
const summaryService_1 = require("./summaryService");
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
                for (const videoUrl of videoUrls) {
                    yield this.processVideo(courseId, videoUrl, accessToken);
                }
                // After all transcriptions are processed, trigger summary generation if OPENAI_API_KEY is set
                if (process.env.OPENAI_API_KEY) {
                    try {
                        yield summaryService_1.SummaryService.processCourseForSummaries(courseId, process.env.OPENAI_API_KEY);
                    }
                    catch (error) {
                        console.error('Error generating summaries:', error);
                        // Don't throw here, as we don't want to fail the transcription process if summary generation fails
                    }
                }
            }
            catch (error) {
                console.error('Error processing course videos:', error);
                throw error;
            }
        });
    }
    static extractVideoUrls(course) {
        const videoUrls = [];
        // Extract video URLs from course content
        course.courseContent.sections.forEach((section) => {
            section.contents.forEach((content) => {
                if (content.type === 'lesson' && content.content.contentItems) {
                    content.content.contentItems.forEach((item) => {
                        if (item.type === 'media' && item.content.includes('vimeo.com')) {
                            videoUrls.push(item.content);
                        }
                    });
                }
            });
        });
        return videoUrls;
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
                    console.log(`Max retries (${this.MAX_RETRIES}) reached for video ${videoUrl}. Skipping.`);
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
            }
            catch (error) {
                console.error(`Error processing video ${videoUrl}:`, error);
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
            const transcription = yield VideoTranscription_1.VideoTranscription.findOne({ courseId, videoUrl });
            return (transcription === null || transcription === void 0 ? void 0 : transcription.transcription) || null;
        });
    }
}
exports.TranscriptionService = TranscriptionService;
TranscriptionService.RETRY_DELAY = 10 * 60 * 1000; // 10 minutes in milliseconds
TranscriptionService.MAX_RETRIES = 3; // Maximum number of retry attempts
