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
exports.transcriptionController = void 0;
const transcriptionService_1 = require("../services/transcriptionService");
const cacheInvalidation_1 = require("../utils/cacheInvalidation");
const logger_1 = __importDefault(require("../config/logger"));
exports.transcriptionController = {
    processCourseVideos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                const accessToken = req.headers.authorization;
                if (!courseId) {
                    return res.status(400).json({ error: 'Course ID is required' });
                }
                if (!accessToken) {
                    return res.status(401).json({ error: 'Access token is required' });
                }
                logger_1.default.info(`Starting transcription process for course: ${courseId}`);
                yield transcriptionService_1.TranscriptionService.processCourseVideos(courseId, accessToken);
                res.json({ message: 'Transcription process started successfully' });
            }
            catch (error) {
                logger_1.default.error(`Error processing course videos:`, error);
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'An unknown error occurred' });
                }
            }
        });
    },
    getTranscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId, videoUrl } = req.params;
                if (!courseId || !videoUrl) {
                    return res.status(400).json({ error: 'Course ID and Video URL are required' });
                }
                const decodedVideoUrl = decodeURIComponent(videoUrl);
                logger_1.default.info(`Fetching transcription for course: ${courseId}, video: ${decodedVideoUrl}`);
                // Try to get existing transcription
                let transcription = yield transcriptionService_1.TranscriptionService.getTranscription(courseId, decodedVideoUrl);
                // If transcription not found in database or cache
                if (!transcription) {
                    logger_1.default.info(`Transcription not found in database, trying to fetch from Vimeo: ${decodedVideoUrl}`);
                    // Use VIMEO_ACCESS_TOKEN from environment
                    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
                    if (!vimeoToken) {
                        logger_1.default.error('VIMEO_ACCESS_TOKEN not found in environment variables');
                        return res.status(500).json({
                            error: 'Server configuration error',
                            message: 'Vimeo access token not configured on the server'
                        });
                    }
                    // Only try to process Vimeo videos
                    if (decodedVideoUrl.includes('vimeo.com')) {
                        try {
                            // Process the video to fetch and save transcription
                            yield transcriptionService_1.TranscriptionService.processVideo(courseId, decodedVideoUrl, `Bearer ${vimeoToken}`);
                            // Try to get the transcription again after processing
                            transcription = yield transcriptionService_1.TranscriptionService.getTranscription(courseId, decodedVideoUrl);
                            // If still not found, return processing status
                            if (!transcription) {
                                return res.status(202).json({
                                    message: 'Transcription processing has started. Please try again in a few moments.',
                                    status: 'processing'
                                });
                            }
                        }
                        catch (processError) {
                            logger_1.default.error(`Error processing video for transcription:`, processError);
                            return res.status(500).json({
                                error: 'Failed to process video',
                                message: 'An error occurred while fetching the transcription from Vimeo'
                            });
                        }
                    }
                    else {
                        return res.status(404).json({
                            error: 'Transcription not found',
                            message: 'This video URL is not supported for automatic transcription'
                        });
                    }
                }
                // At this point, we either have a transcription or we've returned an error/status already
                res.json({ transcription });
            }
            catch (error) {
                logger_1.default.error(`Error getting transcription:`, error);
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'An unknown error occurred' });
                }
            }
        });
    },
    updateTranscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId, videoUrl } = req.params;
                const { transcription } = req.body;
                if (!courseId || !videoUrl) {
                    return res.status(400).json({ error: 'Course ID and Video URL are required' });
                }
                if (!transcription || typeof transcription !== 'string') {
                    return res.status(400).json({ error: 'Transcription content is required and must be a string' });
                }
                const decodedVideoUrl = decodeURIComponent(videoUrl);
                logger_1.default.info(`Updating transcription for course: ${courseId}, video: ${decodedVideoUrl}`);
                // Update the transcription in the database
                yield transcriptionService_1.TranscriptionService.updateTranscription(courseId, decodedVideoUrl, transcription);
                // Invalidate any cached data related to this video
                yield (0, cacheInvalidation_1.invalidateVideoCache)(courseId, decodedVideoUrl);
                res.json({ message: 'Transcription updated successfully' });
            }
            catch (error) {
                logger_1.default.error(`Error updating transcription:`, error);
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'An unknown error occurred' });
                }
            }
        });
    }
};
