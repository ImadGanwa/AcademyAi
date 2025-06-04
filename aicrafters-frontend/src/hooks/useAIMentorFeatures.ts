import { useState, useCallback, useEffect } from 'react';
import { mentorAiService } from '../services/mentorAiService';

interface MentorMessage {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface UseAIMentorFeaturesProps {
  mentorId?: string;
}

// Helper functions for message persistence
const STORAGE_KEY = 'adwina_mentor_chat_state';
const REFRESH_COUNT_KEY = 'adwina_mentor_refresh_count';
// const LAST_VISIT_KEY = 'adwina_mentor_last_visit'; // No longer needed for refresh detection

const saveToStorage = (messages: MentorMessage[], threadId: string | undefined) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      messages,
      threadId,
      timestamp: new Date().getTime() // Keep for data expiry, not refresh detection
    }));
  } catch (err) {
    console.error('Error saving chat state to localStorage:', err);
  }
};

const loadFromStorage = (): { messages: MentorMessage[], threadId?: string } | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    if (parsed.messages && Array.isArray(parsed.messages)) {
      parsed.messages = parsed.messages.map((msg: { content: string; sender: 'user' | 'ai'; timestamp: string }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    
    const now = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    if (parsed.timestamp && (now - parsed.timestamp > dayInMs)) { // Check if parsed.timestamp exists
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REFRESH_COUNT_KEY); // Also clear refresh count if data expired
      return null;
    }
    
    return {
      messages: parsed.messages || [],
      threadId: parsed.threadId
    };
  } catch (err) {
    console.error('Error loading chat state from localStorage:', err);
    return null;
  }
};

// Updated refresh detection: Counts consecutive mounts/refreshes
const checkAndHandleRefresh = (): boolean => {
  try {
    const refreshCount = parseInt(localStorage.getItem(REFRESH_COUNT_KEY) || '0', 10);
    const newCount = refreshCount + 1;
    localStorage.setItem(REFRESH_COUNT_KEY, newCount.toString());
    
    console.log('🔄 Page refresh/mount detected. Refresh count:', newCount);
    
    // Clear messages after 2 or more consecutive refreshes
    if (newCount >= 2) {
      console.log('🧹 Clearing messages after 2+ consecutive refreshes. Resetting count to 0.');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(REFRESH_COUNT_KEY, '0'); // Reset count immediately after clearing
      return true; // Indicate messages were cleared
    }
    return false; // Messages not cleared
  } catch (err) {
    console.error('Error checking refresh:', err);
    return false;
  }
};

// Export resetRefreshCount to be used by other components for UI interactions
export const resetRefreshCount = () => {
  try {
    console.log('🔄 Resetting refresh count to 0 due to user interaction.');
    localStorage.setItem(REFRESH_COUNT_KEY, '0');
    // localStorage.setItem(LAST_VISIT_KEY, Date.now().toString()); // No longer needed
  } catch (err) {
    console.error('Error resetting refresh count:', err);
  }
};

export const useAIMentorFeatures = ({ mentorId }: UseAIMentorFeaturesProps) => {
  const savedState = loadFromStorage();
  
  const [messages, setMessages] = useState<MentorMessage[]>(savedState?.messages || []);
  const [threadId, setThreadId] = useState<string | undefined>(savedState?.threadId);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 useAIMentorFeatures mounted/mentorId changed');
    
    const wasClearedByRefreshLogic = checkAndHandleRefresh();
    
    // When mentor context changes, we might want to maintain separate thread contexts
    // but for now, we'll use a simpler approach where the backend handles user context
    if (wasClearedByRefreshLogic) {
      // If refresh logic cleared messages
      console.log('🧹 Messages were cleared by refresh logic, resetting UI state.');
      setMessages([]);
      setThreadId(undefined);
      setChatError(null);
    }

  }, [mentorId]);
  
  useEffect(() => {
    // Save messages to localStorage whenever they change, if there are messages.
    // If messages array becomes empty, it implies they were cleared.
    // `clearMessages` and refresh logic already handle removing from localStorage.
    if (messages.length > 0) {
      saveToStorage(messages, threadId);
    } else {
      // If messages are empty, ensure storage is also cleared,
      // unless it was just cleared by loadFromStorage (e.g. expired)
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
          localStorage.removeItem(STORAGE_KEY);
          console.log('🧹 Cleared storage because messages array is empty.');
      }
    }
  }, [messages, threadId]);

  const sendMessage = useCallback(async (content: string) => {
    resetRefreshCount(); // User is interacting, reset refresh counter.
    
    try {
      setChatLoading(true);
      setChatError(null);
      
      const userMessage: MentorMessage = {
        content,
        sender: 'user',
        timestamp: new Date(),
      };
      
      // Use functional update to ensure we're working with the latest messages state
      setMessages(prev => [...prev, userMessage]);
      
      const response = await mentorAiService.chat({
        mentorId,
        message: content,
        threadId,
      });
      
      setThreadId(response.threadId);
      
      const aiMessage: MentorMessage = {
        content: response.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      // Saving is handled by the useEffect listening to [messages, threadId]
      
      return true;
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message. Please try again.');
      console.error('Error in useAIMentorFeatures.sendMessage:', err);
      return false;
    } finally {
      setChatLoading(false);
    }
  }, [mentorId, threadId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(undefined);
    setChatError(null);
    localStorage.removeItem(STORAGE_KEY);
    resetRefreshCount(); // Also reset refresh counter on manual clear
    console.log('💬 Chat messages cleared manually.');
  }, []);

  return {
    messages,
    chatLoading,
    chatError,
    sendMessage,
    clearMessages,
    // resetRefreshCount is exported from the file directly, no need to return from hook instance
  };
};