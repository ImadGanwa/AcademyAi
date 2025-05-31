import axios from 'axios';
import config from '../config';

interface MentorChatParams {
  mentorId?: string;
  userId?: string;
  message: string;
  threadId?: string;
}

interface MentorChatResponse {
  response: string;
  threadId: string;
}

// Helper function to get the auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('auth_token') || 
         sessionStorage.getItem('token') || 
         sessionStorage.getItem('authToken');

  if (!token) {
    console.warn('No auth token found in storage');
  }
  
  return token;
};

/**
 * Service to interact with Mentor AI features API
 */
export const mentorAiService = {
  /**
   * Chat with the Adwina Mentor
   */
  async chat({ mentorId, userId, message, threadId }: MentorChatParams): Promise<MentorChatResponse> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(`${config.API_URL}/api/mentor/chat`, {
        params: {
          mentorId,
          userId,
          message,
          threadId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error chatting with Adwina Mentor:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to send message to Adwina Mentor');
    }
  },
}; 