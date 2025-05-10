import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { CircularProgress, Box, Grid, IconButton, useMediaQuery, useTheme, Fab, Slide, Paper, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ScienceIcon from '@mui/icons-material/Science';
import DescriptionIcon from '@mui/icons-material/Description';

import { TrainerChat } from '../../../../components/TrainerChat';
import { useTrainerChat } from '../../../../hooks/useTrainerChat';
import MindMapModal from '../../../../components/common/MindMap/MindMapModal';
import VideoTranscriptDisplay from './VideoTranscriptDisplay';
import { api } from '../../../../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 24px 24px;
  position: relative;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px; // Or an appropriate height for the video area
`;

const VideoWrapper = styled(Box)`
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.palette.background.default};
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
`;

const ProgressWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const ProgressLabel = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
    color: ${props => props.theme.palette.success.main};
  font-size: 0.875rem;
  font-weight: 600;
`;

const MobileChatContainer = styled(Box)`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 75vh;
  z-index: 1050;
  background-color: ${props => props.theme.palette.background.paper};
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.12);
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ChatBar = styled(Paper)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.theme.palette.mode === 'dark' ? props.theme.palette.grey[800] : '#f5f9ff'};
  border: 1px solid ${props => props.theme.palette.divider};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background-color: ${props => props.theme.palette.mode === 'dark' ? props.theme.palette.grey[700] : '#e8f1ff'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const QuickActionButton = styled(Button)`
  transition: all 0.3s ease;
  border-radius: 8px;
  text-transform: none;
  padding: 6px 12px;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureControlsContainer = styled(Box)`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

// Cache for formatted URLs
const urlCache = new Map<string, string>();

interface VideoProgress {
  timestamp: number;
  lastUpdated: number;
}

// Function to get stored video progress
const getStoredProgress = (videoUrl: string): number | null => {
  try {
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const match = videoUrl.match(vimeoRegex);
    const videoId = match ? match[1] : null;
    
    if (!videoId) return null;
    
    const stored = localStorage.getItem(`video_progress_${videoId}`);
    if (stored) {
      const progress: VideoProgress = JSON.parse(stored);
      // Check if the progress is less than 30 days old
      if (Date.now() - progress.lastUpdated < 30 * 24 * 60 * 60 * 1000) {
        return progress.timestamp;
      }
    }
  } catch (error) {
    console.error('Error reading video progress:', error);
  }
  return null;
};

// Function to save video progress
const saveVideoProgress = (videoUrl: string, timestamp: number) => {
  try {
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const match = videoUrl.match(vimeoRegex);
    const videoId = match ? match[1] : null;
    
    if (!videoId) return;
    
    const progress: VideoProgress = {
      timestamp,
      lastUpdated: Date.now()
    };
    localStorage.setItem(`video_progress_${videoId}`, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving video progress:', error);
  }
};

interface VideoContentProps {
  title: string;
  lessonNumber: string;
  videoUrl: string;
  status: 'completed' | 'in_progress' | 'not_started';
  onComplete?: () => void;
  hideCompleteButton?: boolean;
  courseId: string;
}

export const VideoContent: React.FC<VideoContentProps> = ({
  title,
  lessonNumber,
  videoUrl,
  status,
  onComplete,
  hideCompleteButton,
  courseId
}) => {
  const [formattedUrl, setFormattedUrl] = useState('');
  const [key, setKey] = useState(0);
  const lastTimeRef = useRef<number>(0);
  const hasStartedWatchingRef = useRef(false);
  const currentVideoUrlRef = useRef(videoUrl);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // AI Feature States
  const [showChat, setShowChat] = useState(false);
  const [showMindMapModal, setShowMindMapModal] = useState(false);
  const [mindMapMarkdown, setMindMapMarkdown] = useState<string>('');
  const [loadingMindMap, setLoadingMindMap] = useState(false);
  const [mindMapError, setMindMapError] = useState<string | null>(null);
  
  const [showTranscript, setShowTranscript] = useState(false);

  // useTrainerChat hook
  const { messages: chatMessages, isLoading: chatIsLoading, error: chatError, sendMessage: sendChatMessage, clearMessages: clearChatMessages } = useTrainerChat({ courseId, videoUrl });

  // Function to get video ID from URL
  const getVideoId = (url: string): string | null => {
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const match = url.match(vimeoRegex);
    return match ? match[1] : null;
  };

  // Function to format video URL with necessary parameters
  const formatVideoUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // Check cache first
    if (urlCache.has(url)) {
      return urlCache.get(url)!;
    }
    
    let formattedUrl = '';
    
    // Handle Vimeo URLs
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      formattedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0&api=1&player_id=vimeo_player_${videoId}&autopause=0&controls=1&transparent=0&dnt=1`;
    } else {
      // Handle YouTube URLs if needed
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const youtubeMatch = url.match(youtubeRegex);
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        formattedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&enablejsapi=1`;
      } else {
        formattedUrl = url;
      }
    }
    
    // Cache the formatted URL
    urlCache.set(url, formattedUrl);
    return formattedUrl;
  };

  // Update video URL when it changes
  useEffect(() => {
    if (lastTimeRef.current > 0 && hasStartedWatchingRef.current) {
      saveVideoProgress(currentVideoUrlRef.current, lastTimeRef.current);
    }
    setFormattedUrl('');
    setKey(prev => prev + 1);
    lastTimeRef.current = 0;
    hasStartedWatchingRef.current = false;
    currentVideoUrlRef.current = videoUrl;
    
    // Clear chat messages when video changes
    clearChatMessages();
    // Close transcript and reset mindmap states when video changes
    setShowTranscript(false);
    setShowMindMapModal(false);
    setMindMapMarkdown('');
    setMindMapError(null);

    const newUrl = formatVideoUrl(videoUrl);
    if (newUrl) {
      requestAnimationFrame(() => setFormattedUrl(newUrl));
    }
  }, [videoUrl, clearChatMessages]);

  // Handle video player events
  useEffect(() => {
    if (!formattedUrl) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.origin !== "https://player.vimeo.com") return;
        
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        switch (data.event) {
          case 'ready':
            const iframe = document.querySelector('iframe');
            if (iframe?.contentWindow) {
              ['play', 'pause', 'timeupdate'].forEach(event => {
                iframe.contentWindow?.postMessage({
                  method: 'addEventListener',
                  value: event
                }, 'https://player.vimeo.com');
              });

              // Set the stored time if available
              const storedTime = getStoredProgress(videoUrl);
              if (storedTime !== null) {
                iframe.contentWindow.postMessage({
                  method: 'setCurrentTime',
                  value: storedTime
                }, 'https://player.vimeo.com');
              }
            }
            break;

          case 'play':
            hasStartedWatchingRef.current = true;
            break;

          case 'timeupdate':
            const percentage = Math.floor(data.data.percent * 100);
            const currentTime = data.data.seconds;
            
            // Only update progress if we've started watching
            if (hasStartedWatchingRef.current) {
              lastTimeRef.current = currentTime;
              
              // Save progress every 2 seconds
              if (Math.floor(currentTime) % 2 === 0) {
                saveVideoProgress(videoUrl, currentTime);
              }
            }
            
            if (percentage >= 80 && status !== 'completed' && onComplete) {
              onComplete();
            }
            break;
        }
      } catch (error) {
        console.error('Error handling Vimeo player message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      // Save progress when unmounting only if we've started watching
      if (lastTimeRef.current > 0 && hasStartedWatchingRef.current) {
        saveVideoProgress(videoUrl, lastTimeRef.current);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [formattedUrl, onComplete, status, videoUrl]);

  // --- AI Feature Handlers ---
  const toggleChat = () => {
    setShowChat(prev => !prev);
  };

  const toggleTranscriptPanel = () => {
    setShowTranscript(prev => !prev);
  };

  const handleGenerateMindMap = async () => {
    if (!courseId || !videoUrl) {
      setMindMapError('Course ID or Video URL is missing.');
      return;
    }
    setLoadingMindMap(true);
    setMindMapError(null);
    setMindMapMarkdown(''); 
    try {
      const encodedVideoUrl = encodeURIComponent(videoUrl);
      const response = await api.get(`/mindmaps/courses/${courseId}/videos/${encodedVideoUrl}`, {
        responseType: 'text', // Explicitly request text response
        headers: {
          'Accept': 'text/markdown', // Specify we accept markdown
        }
      });
      
      if (typeof response.data === 'string' && response.data.trim() !== '' && !response.data.toLowerCase().includes('transcription is still being processed') && !response.data.toLowerCase().includes('no transcription found')) {
        setMindMapMarkdown(response.data);
        setShowMindMapModal(true); 
      } else {
        let detailedError = 'Mind map data is empty, in an unexpected format, or transcription is not ready.';
        if (typeof response.data === 'string') { // If it's a string, it might be a specific error message from backend
            if (response.data.toLowerCase().includes('transcription is still being processed')) {
                detailedError = 'Video transcription is still being processed. Please try again later.';
            } else if (response.data.toLowerCase().includes('no transcription found')) {
                detailedError = 'No transcription found for this video, which is needed for the mind map.';
            } else if (response.data.trim() !== '') {
                 detailedError = response.data; // Use the string response as error if it's not a success
            }
        } else if(response.data && typeof response.data === 'object' && (response.data as any).message) {
            detailedError = (response.data as any).message;
        }
        setMindMapError(detailedError);
      }
    } catch (err: any) {
      console.error('Mind map generation error:', err);
      let errorDetail = 'Something went wrong while generating the mind map.';
      if (err.response?.status === 409) {
        errorDetail = 'Video transcription is still being processed. Please try again later.';
      } else if (err.response?.status === 404) {
        errorDetail = 'No transcription found for this video, which is needed for the mind map.';
      } else if (err.message) {
        errorDetail = err.message;
      }
      setMindMapError(errorDetail);
      // sendChatMessage(`System: I couldn't generate a mind map: ${errorDetail}`); // Sending to chat might be too noisy
    } finally {
      setLoadingMindMap(false);
    }
  };

  if (!formattedUrl && !videoUrl) {
    return <Container><Typography color="error">No video URL provided</Typography></Container>;
  }
  if (!formattedUrl && videoUrl) {
    return <Container><LoadingContainer><CircularProgress /></LoadingContainer></Container>;
  }

  return (
    <Container>
      {/* Mobile First Approach: Default layout is for mobile, then use Grid for desktop */}
      {isMobile ? (
        <>
          <VideoWrapper>
            {formattedUrl && (
              <StyledIframe
                key={key}
                src={formattedUrl}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={title}
                loading="lazy"
              />
            )}
          </VideoWrapper>

          {/* Feature Controls for Mobile */}
          <FeatureControlsContainer sx={{ justifyContent: 'space-around', mt: 2, mb: 1 }}>
            <QuickActionButton variant="contained" startIcon={<ChatIcon />} onClick={toggleChat} size="small">
              AI Coach
            </QuickActionButton>
            <QuickActionButton variant="outlined" startIcon={<ScienceIcon />} onClick={handleGenerateMindMap} disabled={loadingMindMap} size="small">
              {loadingMindMap ? 'Generating Map...' : 'Mind Map'}
            </QuickActionButton>
            <QuickActionButton variant="outlined" startIcon={<DescriptionIcon />} onClick={toggleTranscriptPanel} size="small">
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </QuickActionButton>
          </FeatureControlsContainer>

          {/* Transcript Display for Mobile (Below controls) */}
          {showTranscript && videoUrl && (
            <VideoTranscriptDisplay courseId={courseId} videoUrl={videoUrl} isOpen={showTranscript} />
          )}
          
          {/* Mobile Chat Container (Slide up) */}
          <Slide direction="up" in={showChat} mountOnEnter unmountOnExit timeout={{ enter: 400, exit: 200 }}>
            <MobileChatContainer>
              {courseId && videoUrl && (
                <TrainerChat 
                  courseId={courseId} 
                  videoUrl={videoUrl} 
                  onClose={toggleChat} 
                />
              )}
            </MobileChatContainer>
          </Slide>
        </>
      ) : (
        // Desktop Layout: Video on left/center, AI tools (chat/transcript) on right or below
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={showChat || showTranscript ? 8 : 12} sx={{ transition: 'all 0.4s ease-in-out' }}>
            <VideoWrapper sx={{ mb: 2, boxShadow: theme.shadows[3] }}>
              {formattedUrl && (
                <StyledIframe
                  key={key}
                  src={formattedUrl}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={title}
                  loading="lazy"
                />
              )}
            </VideoWrapper>

            {/* Feature Controls for Desktop (Below Video) */}
            <FeatureControlsContainer sx={{ justifyContent: 'flex-start', mt: 1, mb: 2 }}>
              <QuickActionButton variant="contained" startIcon={<ChatIcon />} onClick={toggleChat} sx={{ mr: 1.5 }}>
                {showChat ? 'Close AI Coach' : 'Open AI Coach'}
              </QuickActionButton>
              <QuickActionButton variant="outlined" startIcon={<ScienceIcon />} onClick={handleGenerateMindMap} disabled={loadingMindMap} sx={{ mr: 1.5 }}>
                {loadingMindMap ? 'Generating Mind Map...' : 'Generate Mind Map'}
              </QuickActionButton>
              <QuickActionButton variant="outlined" startIcon={<DescriptionIcon />} onClick={toggleTranscriptPanel}>
                {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
              </QuickActionButton>
            </FeatureControlsContainer>

            {/* Transcript Display for Desktop (Below Video, if not shown in sidebar) */}
            {showTranscript && !showChat && videoUrl && (
                <Box sx={{ maxHeight: '400px', overflowY: 'auto', mt: 1 }}>
                    <VideoTranscriptDisplay courseId={courseId} videoUrl={videoUrl} isOpen={showTranscript} />
                </Box>
            )}
          </Grid>

          {/* Right Sidebar for Chat or Transcript on Desktop */}
          {(showChat || showTranscript) && (
            <Grid item xs={12} md={4} sx={{ transition: 'all 0.4s ease-in-out' }}>
              {showChat && courseId && videoUrl && (
                <Paper elevation={2} sx={{ height: 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '650px', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow:'hidden' }}>
                  <TrainerChat courseId={courseId} videoUrl={videoUrl} onClose={toggleChat} />
                </Paper>
              )}
              {showTranscript && !showChat && videoUrl && ( // Only show transcript here if chat is closed
                <Box sx={{ maxHeight: 'calc(100vh - 200px)', minHeight: '500px', overflowY: 'auto' }}>
                    <VideoTranscriptDisplay courseId={courseId} videoUrl={videoUrl} isOpen={showTranscript} />
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      )}

      {/* Mind Map Modal (works for both mobile and desktop) */}
      {courseId && videoUrl && (
        <MindMapModal 
          open={showMindMapModal} 
          onClose={() => setShowMindMapModal(false)} 
          markdown={mindMapMarkdown} 
          title={`Mind Map: ${title}`}
        />
      )}

      {/* Mind Map Error Display (Snackbar-like) */}
      {mindMapError && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: isMobile ? '70px' : '20px', // Adjust based on mobile chat bar
            left: '50%', 
            transform: 'translateX(-50%)',
            bgcolor: 'error.main',
            color: 'white',
            p: '10px 20px',
            borderRadius: '8px',
            zIndex: 1300, // Above modals
            boxShadow: theme.shadows[6],
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" sx={{ mr: 1.5 }}>{mindMapError}</Typography>
          <IconButton size="small" onClick={() => setMindMapError(null)} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Container>
  );
}; 