import { Request, Response } from 'express';
import { TranscriptionService } from '../services/transcriptionService';

export const transcriptionController = {
  async processCourseVideos(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const accessToken = req.headers.authorization;

      if (!accessToken) {
        return res.status(401).json({ error: 'Access token is required' });
      }

      await TranscriptionService.processCourseVideos(courseId, accessToken);
      res.json({ message: 'Transcription process started successfully' });
    } catch (error) {
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
      const transcription = await TranscriptionService.getTranscription(courseId, videoUrl);
      
      if (!transcription) {
        return res.status(404).json({ error: 'Transcription not found' });
      }

      res.json({ transcription });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  }
}; 