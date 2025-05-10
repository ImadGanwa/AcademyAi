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

/**
 * Service to interact with the Trainer Coach API
 */
export const trainerService = {
  /**
   * Chat with the Trainer Coach
   */
  async chat({ courseId, videoUrl, message, threadId }: ChatParams): Promise<ChatResponse> {
    try {
      const response = await axios.get(`${config.API_URL}/api/trainer/chat`, {
        params: {
          courseId,
          videoUrl,
          message,
          threadId,
        },
        headers: {
          // Ensure you have a robust way to get the token, localStorage might not be ideal for all auth flows
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Assuming the actual data is nested under response.data.data based on the example
      // Adjust if your backend structure is different
      return response.data.data; 
    } catch (error) {
      console.error('Error chatting with trainer:', error);
      // Consider more specific error handling or re-throwing a custom error
      throw error;
    }
  },
}; 