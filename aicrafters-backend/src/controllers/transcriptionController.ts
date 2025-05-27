import { Request, Response } from 'express';
import { TranscriptionService } from '../services/transcriptionService';
import { invalidateVideoCache } from '../utils/cacheInvalidation';
import logger from '../config/logger';

export const transcriptionController = {
  async processCourseVideos(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const accessToken = req.headers.authorization;

      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      if (!accessToken) {
        return res.status(401).json({ error: 'Access token is required' });
      }

      logger.info(`Starting transcription process for course: ${courseId}`);
      await TranscriptionService.processCourseVideos(courseId, accessToken);
      res.json({ message: 'Transcription process started successfully' });
    } catch (error) {
      logger.error(`Error processing course videos:`, error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  },

  async getTranscription(req: Request, res: Response) {
    try {
      const { courseId, videoUrl } = req.params;
      
      if (!courseId || !videoUrl) {
        return res.status(400).json({ error: 'Course ID and Video URL are required' });
      }
      
      const decodedVideoUrl = decodeURIComponent(videoUrl);
      logger.info(`Fetching transcription for course: ${courseId}, video: ${decodedVideoUrl}`);
      
      // Try to get existing transcription
      let transcription = await TranscriptionService.getTranscription(courseId, decodedVideoUrl);
      
      // If transcription not found in database or cache
      if (!transcription) {
        logger.info(`Transcription not found in database, trying to fetch from Vimeo: ${decodedVideoUrl}`);
        
        // Use VIMEO_ACCESS_TOKEN from environment
        const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
        
        if (!vimeoToken) {
          logger.error('VIMEO_ACCESS_TOKEN not found in environment variables');
          return res.status(500).json({ 
            error: 'Server configuration error',
            message: 'Vimeo access token not configured on the server' 
          });
        }
        
        // Only try to process Vimeo videos
        if (decodedVideoUrl.includes('vimeo.com')) {
          try {
            // Process the video to fetch and save transcription
            await TranscriptionService.processVideo(courseId, decodedVideoUrl, `Bearer ${vimeoToken}`);
            
            // Try to get the transcription again after processing
            transcription = await TranscriptionService.getTranscription(courseId, decodedVideoUrl);
            
            // If still not found, return processing status
            if (!transcription) {
              return res.status(202).json({ 
                message: 'Transcription processing has started. Please try again in a few moments.',
                status: 'processing' 
              });
            }
          } catch (processError) {
            logger.error(`Error processing video for transcription:`, processError);
            return res.status(500).json({ 
              error: 'Failed to process video',
              message: 'An error occurred while fetching the transcription from Vimeo' 
            });
          }
        } else {
          return res.status(404).json({ 
            error: 'Transcription not found',
            message: 'This video URL is not supported for automatic transcription' 
          });
        }
      }
      
      // At this point, we either have a transcription or we've returned an error/status already
      res.json({ transcription });
      
    } catch (error) {
      logger.error(`Error getting transcription:`, error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  },
  
  async updateTranscription(req: Request, res: Response) {
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
      logger.info(`Updating transcription for course: ${courseId}, video: ${decodedVideoUrl}`);
      
      // Update the transcription in the database
      await TranscriptionService.updateTranscription(courseId, decodedVideoUrl, transcription);
      
      // Invalidate any cached data related to this video
      await invalidateVideoCache(courseId, decodedVideoUrl);
      
      res.json({ message: 'Transcription updated successfully' });
    } catch (error) {
      logger.error(`Error updating transcription:`, error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  }
}; 