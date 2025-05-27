import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MindMapService } from '../services/mindMapService';
import { TranscriptionService } from '../services/transcriptionService';
import { VideoTranscription } from '../models/VideoTranscription';
import { AppError } from '../utils/AppError';
import logger from '../config/logger';
import redis from '../config/redis';

// Cache TTL for the final markdown response
const MIND_MAP_RESPONSE_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Generate Mind Map for a specific video based on its transcription.
 */
const generateMindMapForVideo = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, videoUrl } = req.params;

    if (!courseId || !videoUrl) {
        return next(new AppError('Course ID and Video URL are required', 400));
    }

    // Validate courseId format (optional but good practice)
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError('Invalid Course ID format', 400));
    }

    const decodedVideoUrl = decodeURIComponent(videoUrl);
    
    // Log the received videoUrl for debugging
    logger.info(`Processing mind map request with URL: ${decodedVideoUrl}`);
    
    // Enhanced URL validation - be more flexible with URL formats
    // Some video platforms might use relative URLs or special formats
    // Accept any non-empty string as we'll let the transcription service validate more specifically
    if (!decodedVideoUrl || decodedVideoUrl.trim() === '') {
        return next(new AppError('Empty Video URL', 400));
    }
    
    // Add http prefix if missing but URL looks otherwise valid
    let processedVideoUrl = decodedVideoUrl;
    if (!processedVideoUrl.startsWith('http') && !processedVideoUrl.startsWith('//')) {
        // If it looks like a vimeo ID or URL without protocol
        if (processedVideoUrl.match(/^\d+$/) || 
            processedVideoUrl.match(/^vimeo\.com/) ||
            processedVideoUrl.match(/^player\.vimeo\.com/)) {
            processedVideoUrl = `https://${processedVideoUrl.startsWith('vimeo.com') || processedVideoUrl.startsWith('player.vimeo.com') ? '' : 'vimeo.com/'}${processedVideoUrl}`;
            logger.info(`Added https prefix to URL, now: ${processedVideoUrl}`);
        }
    }

    try {
        logger.info(`Mind map generation request received for course ${courseId}, video: ${processedVideoUrl}`);

        // Check if we have a cached final result first
        const cacheKey = `mindmap:response:${courseId}:${encodeURIComponent(processedVideoUrl)}`;
        const cachedResponse = await redis.get<string>(cacheKey);
        
        if (cachedResponse) {
            logger.info(`Retrieved mind map response from cache for key: ${cacheKey}`);
            return res.status(200).type('text/markdown').send(cachedResponse);
        }

        // First check if the transcription exists and is complete
        let transcriptionDoc = await VideoTranscription.findOne({
            courseId: new mongoose.Types.ObjectId(courseId),
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
            
            logger.info(`Trying alternative URL formats: ${JSON.stringify(alternativeUrls)}`);
            
            // Try all alternative URLs
            for (const altUrl of alternativeUrls) {
                const altDoc = await VideoTranscription.findOne({
                    courseId: new mongoose.Types.ObjectId(courseId),
                    videoUrl: altUrl
                });
                
                if (altDoc) {
                    logger.info(`Found transcription with alternative URL: ${altUrl}`);
                    // Use this document instead
                    transcriptionDoc = altDoc;
                    processedVideoUrl = altUrl as string; // Update the URL to use for getting transcription
                    break;
                }
            }
            
            // If still not found after trying alternatives
            if (!transcriptionDoc) {
                logger.warn(`Transcription not found for course ${courseId}, video: ${decodedVideoUrl}`);
                return next(new AppError('Transcription data not found for this video', 404));
            }
        }

        // MODIFIED: Check if status is completed OR if there's actual transcription content regardless of status
        if (transcriptionDoc.status !== 'completed' && (!transcriptionDoc.transcription || transcriptionDoc.transcription.trim() === '')) {
            logger.warn(`Transcription not ready for course ${courseId}, video: ${processedVideoUrl}. Status: ${transcriptionDoc.status}`);
            return next(new AppError(`Transcription is not yet complete (Status: ${transcriptionDoc.status})`, 409)); // 409 Conflict
        }

        // If we have transcription content but status is still pending, update it to completed
        if (transcriptionDoc.status === 'pending' && transcriptionDoc.transcription && transcriptionDoc.transcription.trim() !== '') {
            logger.info(`Found transcription with content but status is still pending. Updating status to completed.`);
            transcriptionDoc.status = 'completed';
            await transcriptionDoc.save();
        }

        // Now get the transcription text using the service with the matched URL format
        const transcriptionText = await TranscriptionService.getTranscription(courseId, processedVideoUrl);

        if (!transcriptionText || typeof transcriptionText !== 'string' || transcriptionText.trim() === '') {
            logger.warn(`Transcription is empty for course ${courseId}, video: ${processedVideoUrl}`);
            return next(new AppError('Transcription text is empty', 404));
        }

        // 2. Structure the transcription using the service with caching
        // Pass courseId and videoUrl for cache key generation
        const structuredData = await MindMapService.structureTranscription(transcriptionText, courseId, processedVideoUrl);

        // 3. Convert structured data to Markmap format with caching
        // Pass courseId and videoUrl for cache key generation
        const markmapMarkdown = await MindMapService.convertToMarkmap(structuredData, courseId, processedVideoUrl);

        // Cache the final response
        await redis.setEx(cacheKey, MIND_MAP_RESPONSE_CACHE_TTL, markmapMarkdown);
        logger.info(`Cached final mind map response with key: ${cacheKey}`);

        logger.info(`Successfully generated mind map for course ${courseId}, video: ${processedVideoUrl}`);

        // 4. Send the Markmap markdown as response
        res.status(200).type('text/markdown').send(markmapMarkdown);

    } catch (error) {
        logger.error(`Error generating mind map for course ${courseId}, video: ${decodedVideoUrl}`, { error });
        // Let the global error handler manage the response
        next(error); 
    }
};

export const MindMapController = {
    generateMindMapForVideo,
    // Potentially add controllers for generating based on section, course, etc. later
}; 