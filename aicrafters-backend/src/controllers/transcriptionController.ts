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
      
      const transcription = await TranscriptionService.getTranscription(courseId, decodedVideoUrl);
      
      if (!transcription) {
        return res.status(404).json({ error: 'Transcription not found' });
      }

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