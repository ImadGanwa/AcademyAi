import { Request, Response } from 'express';
import { SummaryService } from '../services/summaryService';

export const summaryController = {
  async processCourseForSummaries(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const apiKey = req.headers['x-openai-api-key'] as string;

      if (!apiKey) {
        return res.status(401).json({ error: 'OpenAI API key is required' });
      }

      await SummaryService.processCourseForSummaries(courseId, apiKey);
      res.json({ message: 'Summary generation process started successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  },

  async getVideoSummary(req: Request, res: Response) {
    try {
      const { courseId, videoUrl } = req.params;
      
      const videoTranscription = await SummaryService.getVideoTranscriptionWithSummaries(courseId, videoUrl);
      
      if (!videoTranscription) {
        return res.status(404).json({ error: 'Video transcription not found' });
      }

      res.json({ 
        videoSummary: videoTranscription.videoSummary,
        sectionSummary: videoTranscription.sectionSummary,
        courseSummary: videoTranscription.courseSummary
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  }
}; 