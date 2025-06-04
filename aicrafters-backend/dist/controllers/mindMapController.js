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
exports.MindMapController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mindMapService_1 = require("../services/mindMapService");
const transcriptionService_1 = require("../services/transcriptionService");
const VideoTranscription_1 = require("../models/VideoTranscription");
const AppError_1 = require("../utils/AppError");
const logger_1 = __importDefault(require("../config/logger"));
const redis_1 = __importDefault(require("../config/redis"));
// Cache TTL for the final markdown response
const MIND_MAP_RESPONSE_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
/**
 * Generate Mind Map for a specific video based on its transcription.
 */
const generateMindMapForVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, videoUrl } = req.params;
    if (!courseId || !videoUrl) {
        return next(new AppError_1.AppError('Course ID and Video URL are required', 400));
    }
    // Validate courseId format (optional but good practice)
    if (!mongoose_1.default.Types.ObjectId.isValid(courseId)) {
        return next(new AppError_1.AppError('Invalid Course ID format', 400));
    }
    const decodedVideoUrl = decodeURIComponent(videoUrl);
    // Log the received videoUrl for debugging
    logger_1.default.info(`Processing mind map request with URL: ${decodedVideoUrl}`);
    // Enhanced URL validation - be more flexible with URL formats
    // Some video platforms might use relative URLs or special formats
    // Accept any non-empty string as we'll let the transcription service validate more specifically
    if (!decodedVideoUrl || decodedVideoUrl.trim() === '') {
        return next(new AppError_1.AppError('Empty Video URL', 400));
    }
    // Add http prefix if missing but URL looks otherwise valid
    let processedVideoUrl = decodedVideoUrl;
    if (!processedVideoUrl.startsWith('http') && !processedVideoUrl.startsWith('//')) {
        // If it looks like a vimeo ID or URL without protocol
        if (processedVideoUrl.match(/^\d+$/) ||
            processedVideoUrl.match(/^vimeo\.com/) ||
            processedVideoUrl.match(/^player\.vimeo\.com/)) {
            processedVideoUrl = `https://${processedVideoUrl.startsWith('vimeo.com') || processedVideoUrl.startsWith('player.vimeo.com') ? '' : 'vimeo.com/'}${processedVideoUrl}`;
            logger_1.default.info(`Added https prefix to URL, now: ${processedVideoUrl}`);
        }
    }
    try {
        logger_1.default.info(`Mind map generation request received for course ${courseId}, video: ${processedVideoUrl}`);
        // Check if we have a cached final result first
        const cacheKey = `mindmap:response:${courseId}:${encodeURIComponent(processedVideoUrl)}`;
        const cachedResponse = yield redis_1.default.get(cacheKey);
        if (cachedResponse) {
            logger_1.default.info(`Retrieved mind map response from cache for key: ${cacheKey}`);
            return res.status(200).type('text/markdown').send(cachedResponse);
        }
        // First check if the transcription exists and is complete
        let transcriptionDoc = yield VideoTranscription_1.VideoTranscription.findOne({
            courseId: new mongoose_1.default.Types.ObjectId(courseId),
            videoUrl: processedVideoUrl
        });
        if (!transcriptionDoc) {
            // Try alternative URL formats in case of URL format differences
            const alternativeUrls = [
                decodedVideoUrl,
                processedVideoUrl,
                // Try without protocol
                decodedVideoUrl.replace(/^https?:\/\//, ''),
                // Try with vimeo.com prefix if it's just a number
                decodedVideoUrl.match(/^\d+$/) ? `vimeo.com/${decodedVideoUrl}` : null,
                // Try with https://vimeo.com prefix if it's just a number
                decodedVideoUrl.match(/^\d+$/) ? `https://vimeo.com/${decodedVideoUrl}` : null
            ].filter(Boolean); // Filter out null/undefined values
            logger_1.default.info(`Trying alternative URL formats: ${JSON.stringify(alternativeUrls)}`);
            // Try all alternative URLs
            for (const altUrl of alternativeUrls) {
                const altDoc = yield VideoTranscription_1.VideoTranscription.findOne({
                    courseId: new mongoose_1.default.Types.ObjectId(courseId),
                    videoUrl: altUrl
                });
                if (altDoc) {
                    logger_1.default.info(`Found transcription with alternative URL: ${altUrl}`);
                    // Use this document instead
                    transcriptionDoc = altDoc;
                    processedVideoUrl = altUrl; // Update the URL to use for getting transcription
                    break;
                }
            }
            // If still not found after trying alternatives
            if (!transcriptionDoc) {
                logger_1.default.warn(`Transcription not found for course ${courseId}, video: ${decodedVideoUrl}`);
                return next(new AppError_1.AppError('Transcription data not found for this video', 404));
            }
        }
        // MODIFIED: Check if status is completed OR if there's actual transcription content regardless of status
        if (transcriptionDoc.status !== 'completed' && (!transcriptionDoc.transcription || transcriptionDoc.transcription.trim() === '')) {
            logger_1.default.warn(`Transcription not ready for course ${courseId}, video: ${processedVideoUrl}. Status: ${transcriptionDoc.status}`);
            return next(new AppError_1.AppError(`Transcription is not yet complete (Status: ${transcriptionDoc.status})`, 409)); // 409 Conflict
        }
        // If we have transcription content but status is still pending, update it to completed
        if (transcriptionDoc.status === 'pending' && transcriptionDoc.transcription && transcriptionDoc.transcription.trim() !== '') {
            logger_1.default.info(`Found transcription with content but status is still pending. Updating status to completed.`);
            transcriptionDoc.status = 'completed';
            yield transcriptionDoc.save();
        }
        // Now get the transcription text using the service with the matched URL format
        const transcriptionText = yield transcriptionService_1.TranscriptionService.getTranscription(courseId, processedVideoUrl);
        if (!transcriptionText || typeof transcriptionText !== 'string' || transcriptionText.trim() === '') {
            logger_1.default.warn(`Transcription is empty for course ${courseId}, video: ${processedVideoUrl}`);
            return next(new AppError_1.AppError('Transcription text is empty', 404));
        }
        // 2. Structure the transcription using the service with caching
        // Pass courseId and videoUrl for cache key generation
        const structuredData = yield mindMapService_1.MindMapService.structureTranscription(transcriptionText, courseId, processedVideoUrl);
        // 3. Convert structured data to Markmap format with caching
        // Pass courseId and videoUrl for cache key generation
        const markmapMarkdown = yield mindMapService_1.MindMapService.convertToMarkmap(structuredData, courseId, processedVideoUrl);
        // Cache the final response
        yield redis_1.default.setEx(cacheKey, MIND_MAP_RESPONSE_CACHE_TTL, markmapMarkdown);
        logger_1.default.info(`Cached final mind map response with key: ${cacheKey}`);
        logger_1.default.info(`Successfully generated mind map for course ${courseId}, video: ${processedVideoUrl}`);
        // 4. Send the Markmap markdown as response
        res.status(200).type('text/markdown').send(markmapMarkdown);
    }
    catch (error) {
        logger_1.default.error(`Error generating mind map for course ${courseId}, video: ${decodedVideoUrl}`, { error });
        // Let the global error handler manage the response
        next(error);
    }
});
exports.MindMapController = {
    generateMindMapForVideo,
    // Potentially add controllers for generating based on section, course, etc. later
};
