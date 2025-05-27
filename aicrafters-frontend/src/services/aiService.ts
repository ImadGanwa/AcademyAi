import axios from 'axios';
import config from '../config';

interface ChatParams {
  courseId: string;
  videoUrl: string;
  message: string;
  threadId?: string;
}

interface ChatResponse {
  response: string;
  threadId: string;
}

// Helper function to get the auth token
const getAuthToken = () => {
  // Try different possible token keys used in the application
  const token = localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('auth_token') || 
         sessionStorage.getItem('token') || 
         sessionStorage.getItem('authToken');

  // Log token status for debugging (remove in production)
  if (!token) {
    console.warn('No auth token found in storage');
  }
  
  return token;
};

/**
 * Service to interact with AI features API
 */
export const aiService = {
  /**
   * Chat with the AI Coach
   */
  async chat({ courseId, videoUrl, message, threadId }: ChatParams): Promise<ChatResponse> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(`${config.API_URL}/api/trainer/chat`, {
        params: {
          courseId,
          videoUrl,
          message,
          threadId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error chatting with AI coach:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to send message to AI coach');
    }
  },

  /**
   * Get video transcript
   */
  async getTranscript(courseId: string, videoUrl: string): Promise<string> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create request with timeout to prevent hanging requests
      const response = await axios.get(
        `${config.API_URL}/api/transcriptions/courses/${courseId}/videos/${encodeURIComponent(videoUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      // Handle empty response
      if (!response.data || !response.data.transcription) {
        throw new Error('No transcription data received from server');
      }

      return response.data.transcription;
    } catch (error: any) {
      console.error('Error fetching transcript:', error);
      
      // More descriptive error messages based on error type
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        throw new Error('Transcript not found for this video.');
      } else if (error.response?.status === 202) {
        // Handle processing status (202 Accepted)
        throw new Error('Transcription is being processed. Please check back in a few moments.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again later.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch transcript');
    }
  },

  /**
   * Get video summaries
   */
  async getSummaries(courseId: string, videoUrl: string): Promise<{
    videoSummary: string | null;
    sectionSummary: string;
    courseSummary: string;
  }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(
        `${config.API_URL}/api/summaries/courses/${courseId}/videos/${encodeURIComponent(videoUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle the case where videoSummary might be null
      return {
        videoSummary: response.data.videoSummary,
        sectionSummary: response.data.sectionSummary || '',
        courseSummary: response.data.courseSummary || '',
      };
    } catch (error: any) {
      console.error('Error fetching summaries:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch summaries');
    }
  },

  /**
   * Get mind map for video
   */
  async getMindMap(courseId: string, videoUrl: string): Promise<string> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(
        `${config.API_URL}/api/mindmaps/courses/${courseId}/videos/${encodeURIComponent(videoUrl)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'text',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching mind map:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch mind map');
    }
  },
}; 