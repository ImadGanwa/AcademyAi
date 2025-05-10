import { useState, useCallback } from 'react';
import { trainerService } from '../services/trainerService';

interface Message {
  content: string;
  sender: 'user' | 'trainer';
  timestamp: Date;
}

interface UseTrainerChatProps {
  courseId: string;
  videoUrl: string;
}

interface UseTrainerChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Custom hook for interacting with the Trainer Coach
 */
export const useTrainerChat = ({ courseId, videoUrl }: UseTrainerChatProps): UseTrainerChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to chat
      const userMessage: Message = {
        content,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Call trainer service
      const response = await trainerService.chat({
        courseId,
        videoUrl,
        message: content,
        threadId,
      });
      
      // Update thread ID for conversation continuity
      setThreadId(response.threadId);
      
      // Add trainer response to chat
      const trainerMessage: Message = {
        content: response.response,
        sender: 'trainer',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, trainerMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('Error in useTrainerChat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, videoUrl, threadId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(undefined);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}; 