import axios from 'axios';
import config from '../config';

interface MentorChatParams {
  mentorId?: string;
  message: string;
  threadId?: string;
}

interface MentorChatResponse {
  response: string;
  threadId: string;
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  try {
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
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Service to interact with Mentor AI features API
 */
export const mentorAiService = {
  /**
   * Chat with the Adwina Mentor using the new scalable API
   */
  async chat({ mentorId, message, threadId }: MentorChatParams): Promise<MentorChatResponse> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Use the new POST endpoint with request body
      const response = await axios.post(`${config.API_URL}/api/mentor/ai/chat`, {
        message,
        threadId,
        mentorId,
        // Note: userId is now extracted from the auth token on the backend
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error chatting with Adwina Mentor:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to send message to Adwina Mentor');
    }
  },

  /**
   * Get mentor AI system statistics
   */
  async getStats(): Promise<any> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(`${config.API_URL}/api/mentor/ai/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Error getting mentor AI stats:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to get mentor AI stats');
    }
  },

  /**
   * Preload popular mentor content for better performance
   */
  async preloadContent(): Promise<void> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      await axios.post(`${config.API_URL}/api/mentor/ai/preload`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Error preloading mentor content:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to preload mentor content');
    }
  },

  /**
   * Clear mentor cache
   */
  async clearCache(pattern?: string): Promise<void> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const url = pattern 
        ? `${config.API_URL}/api/mentor/ai/cache?pattern=${encodeURIComponent(pattern)}`
        : `${config.API_URL}/api/mentor/ai/cache`;
      
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Error clearing mentor cache:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to clear mentor cache');
    }
  },

  /**
   * Clear mentor thread for user
   */
  async clearThread(userId: string, mentorId?: string): Promise<void> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const url = mentorId 
        ? `${config.API_URL}/api/mentor/ai/threads/${userId}?mentorId=${encodeURIComponent(mentorId)}`
        : `${config.API_URL}/api/mentor/ai/threads/${userId}`;
      
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      console.error('Error clearing mentor thread:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to clear mentor thread');
    }
  },
}; 