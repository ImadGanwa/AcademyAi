import { useState, useCallback, useEffect, useRef } from 'react';
import { aiService } from '../services/aiService';

interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface UseAIFeaturesProps {
  courseId: string;
  videoUrl: string;
}

// Create a cache for mind maps
const mindMapCache: Record<string, string> = {};

export const useAIFeatures = ({ courseId, videoUrl }: UseAIFeaturesProps) => {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Transcript state
  const [transcript, setTranscript] = useState<string>('');
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  // Summary state
  const [summaries, setSummaries] = useState<{
    videoSummary: string;
    sectionSummary: string;
    courseSummary: string;
  }>({
    videoSummary: '',
    sectionSummary: '',
    courseSummary: '',
  });
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [summariesError, setSummariesError] = useState<string | null>(null);

  // Mind map state
  const [mindMap, setMindMap] = useState<string>('');
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [mindMapError, setMindMapError] = useState<string | null>(null);

  // Add retry tracking
  const [hasFailedTranscriptFetch, setHasFailedTranscriptFetch] = useState(false);
  const transcriptRetryCount = useRef(0);
  const MAX_RETRY_ATTEMPTS = 2; // Maximum number of retry attempts

  // Check if we have a cached mind map for this video when video URL changes
  useEffect(() => {
    const cacheKey = `${courseId}:${videoUrl}`;
    if (mindMapCache[cacheKey]) {
      setMindMap(mindMapCache[cacheKey]);
    } else {
      // Reset mind map if not cached
      setMindMap('');
    }
  }, [courseId, videoUrl]);

  // Reset transcript and summaries state when video URL changes
  useEffect(() => {
    // Don't clear chat history or mind map, only other features
    setTranscript('');
    setSummaries({
      videoSummary: '',
      sectionSummary: '',
      courseSummary: '',
    });
    
    // Reset errors
    setTranscriptError(null);
    setSummariesError(null);
    setMindMapError(null);
    setChatError(null);
    
    // Reset retry tracking
    setHasFailedTranscriptFetch(false);
    transcriptRetryCount.current = 0;
  }, [videoUrl]);

  // Send message to AI coach
  const sendMessage = useCallback(async (content: string) => {
    try {
      setChatLoading(true);
      setChatError(null);
      
      // Add user message to chat
      const userMessage: Message = {
        content,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Call AI service
      const response = await aiService.chat({
        courseId,
        videoUrl,
        message: content,
        threadId,
      });
      
      // Update thread ID for conversation continuity
      setThreadId(response.threadId);
      
      // Add AI response to chat
      const aiMessage: Message = {
        content: response.response,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      return true;
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message. Please try again.');
      console.error('Error in useAIFeatures.sendMessage:', err);
      return false;
    } finally {
      setChatLoading(false);
    }
  }, [courseId, videoUrl, threadId]);

  // Clear chat messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setThreadId(undefined);
    setChatError(null);
  }, []);

  // Fetch transcript
  const fetchTranscript = useCallback(async () => {
    if (!courseId || !videoUrl) return;
    
    // Skip if already failed and exceeded retry attempts
    if (hasFailedTranscriptFetch && transcriptRetryCount.current >= MAX_RETRY_ATTEMPTS) {
      console.warn(`Skipping transcript fetch after ${MAX_RETRY_ATTEMPTS} failed attempts`);
      return false;
    }
    
    try {
      setTranscriptLoading(true);
      setTranscriptError(null);
      
      const data = await aiService.getTranscript(courseId, videoUrl);
      setTranscript(data);
      
      // Reset failure tracking on success
      setHasFailedTranscriptFetch(false);
      transcriptRetryCount.current = 0;
      
      return true;
    } catch (err: any) {
      // Track failure
      setHasFailedTranscriptFetch(true);
      transcriptRetryCount.current += 1;
      
      const errorMessage = err.message || 'Failed to fetch transcript';
      setTranscriptError(errorMessage);
      console.error(`Error in useAIFeatures.fetchTranscript (attempt ${transcriptRetryCount.current}):`, err);
      
      return false;
    } finally {
      setTranscriptLoading(false);
    }
  }, [courseId, videoUrl, hasFailedTranscriptFetch]);

  // Fetch summaries
  const fetchSummaries = useCallback(async () => {
    if (!courseId || !videoUrl) return;
    
    try {
      setSummariesLoading(true);
      setSummariesError(null);
      
      const data = await aiService.getSummaries(courseId, videoUrl);
      setSummaries(data);
      return true;
    } catch (err: any) {
      setSummariesError(err.message || 'Failed to fetch summaries');
      console.error('Error in useAIFeatures.fetchSummaries:', err);
      return false;
    } finally {
      setSummariesLoading(false);
    }
  }, [courseId, videoUrl]);

  // Fetch mind map - now with caching
  const fetchMindMap = useCallback(async () => {
    if (!courseId || !videoUrl) return;
    
    // Return immediately if we already have the mind map cached
    const cacheKey = `${courseId}:${videoUrl}`;
    if (mindMapCache[cacheKey] && mindMap) {
      return true;
    }
    
    try {
      setMindMapLoading(true);
      setMindMapError(null);
      
      const data = await aiService.getMindMap(courseId, videoUrl);
      
      // Store in both state and cache
      setMindMap(data);
      mindMapCache[cacheKey] = data;
      
      return true;
    } catch (err: any) {
      setMindMapError(err.message || 'Failed to fetch mind map');
      console.error('Error in useAIFeatures.fetchMindMap:', err);
      return false;
    } finally {
      setMindMapLoading(false);
    }
  }, [courseId, videoUrl, mindMap]);

  return {
    // Chat
    messages,
    chatLoading,
    chatError,
    sendMessage,
    clearMessages,
    
    // Transcript
    transcript,
    transcriptLoading,
    transcriptError,
    fetchTranscript,
    
    // Summaries
    summaries,
    summariesLoading, 
    summariesError,
    fetchSummaries,
    
    // Mind Map
    mindMap,
    mindMapLoading,
    mindMapError,
    fetchMindMap,
  };
}; 