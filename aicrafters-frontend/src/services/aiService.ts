import { api } from './api';

export const aiService = {
  async getTranscription(courseId: string, videoUrl: string) {
    const encodedVideoUrl = encodeURIComponent(videoUrl);
    const response = await api.get(`/api/transcriptions/courses/${courseId}/videos/${encodedVideoUrl}`);
    return response.data;
  },

  async getVideoSummary(courseId: string, videoUrl: string) {
    const encodedVideoUrl = encodeURIComponent(videoUrl);
    const response = await api.get(`/api/summaries/courses/${courseId}/videos/${encodedVideoUrl}`);
    return response.data;
  },

  async getMindMap(courseId: string, videoUrl: string) {
    const encodedVideoUrl = encodeURIComponent(videoUrl);
    const response = await api.get(`/api/mindmaps/courses/${courseId}/videos/${encodedVideoUrl}`, {
      headers: {
        Accept: 'text/markdown',
      },
      responseType: 'text',
    });
    return response.data;
  },

  async chatWithTrainer(
    courseId: string, 
    videoUrl: string, 
    message: string, 
    threadId?: string | null
  ) {
    const encodedVideoUrl = encodeURIComponent(videoUrl);
    const response = await api.get('/api/trainer/chat', {
      params: {
        courseId,
        videoUrl: encodedVideoUrl,
        message,
        threadId
      }
    });
    return response.data;
  }
};

export default aiService; 