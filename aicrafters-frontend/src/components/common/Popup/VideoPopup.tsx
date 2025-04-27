import React from 'react';
import styled from 'styled-components';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
  overflow: hidden;
`;

const PopupContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16/9;
  background: black;
  border-radius: 12px;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  
  svg {
    width: 24px;
    height: 24px;
    path {
      stroke: white;
    }
  }
`;

const IframeWrapper = styled.div`
  width: 100%;
  height: 100%;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

interface VideoPopupProps {
  videoUrl: string;
  onClose: () => void;
}

export const VideoPopup: React.FC<VideoPopupProps> = ({ videoUrl, onClose }) => {
  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Extract video ID from Vimeo URL
  const getVimeoVideoId = (url: string) => {
    const match = url.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/);
    return match ? match[1] : null;
  };

  // Get the appropriate embed URL based on the video platform
  const getEmbedUrl = () => {
    const youtubeId = getYouTubeVideoId(videoUrl);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
    }

    const vimeoId = getVimeoVideoId(videoUrl);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
    }

    return null;
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  const embedUrl = getEmbedUrl();
  if (!embedUrl) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupContent>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
        <IframeWrapper>
          <iframe
            src={embedUrl}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </IframeWrapper>
      </PopupContent>
    </Overlay>
  );
}; 