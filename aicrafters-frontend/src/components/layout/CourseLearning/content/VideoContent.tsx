import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 24px 24px;
`;

const VideoWrapper = styled.div`
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
}

export const VideoContent: React.FC<VideoContentProps> = ({
  title,
  lessonNumber,
  videoUrl,
  status,
  onComplete,
  hideCompleteButton
}) => {
  const [formattedUrl, setFormattedUrl] = useState('');
  const [key, setKey] = useState(0);
  const lastTimeRef = useRef<number>(0);
  const hasStartedWatchingRef = useRef(false);
  const currentVideoUrlRef = useRef(videoUrl);
  const { t } = useTranslation();

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
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
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
    // Only save progress if we actually started watching the previous video
    if (lastTimeRef.current > 0 && hasStartedWatchingRef.current) {
      saveVideoProgress(currentVideoUrlRef.current, lastTimeRef.current);
    }

    // Reset state for new video
    setFormattedUrl('');
    setKey(prev => prev + 1);
    lastTimeRef.current = 0;
    hasStartedWatchingRef.current = false;
    currentVideoUrlRef.current = videoUrl;
    
    // Set the new URL after a minimal delay to ensure old video is cleared
    const newUrl = formatVideoUrl(videoUrl);
    if (newUrl) {
      requestAnimationFrame(() => {
        setFormattedUrl(newUrl);
      });
    }
  }, [videoUrl]);

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

  if (!formattedUrl) {
    return <Container>No video URL provided</Container>;
  }

  return (
    <Container>
      <VideoWrapper>
        {formattedUrl && (
          <StyledIframe
            key={key}
            src={formattedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="origin"
          />
        )}
      </VideoWrapper>
    </Container>
  );
}; 