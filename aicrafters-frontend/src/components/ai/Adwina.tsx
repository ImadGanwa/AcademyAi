import React from 'react';
import styled from 'styled-components';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AIChat from './AIChat';
import { useAIFeatures } from '../../hooks/useAIFeatures';

const AIChatContainer = styled(Box)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  background: ${props => props.theme.palette.background.paper};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  border: 1px solid rgb(155, 153, 153);
  position: relative;
  
  @media (max-width: 1200px) {
    max-width: none;
    margin: 0;
    border-radius: 12px;
    box-shadow: none;
    border: none;
  }
`;

const CloseButtonContainer = styled(Box)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
`;

const ChatContent = styled(Box)`
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

interface AdwinaProps {
  courseId: string;
  videoUrl: string;
  onClose?: () => void;
}

const Adwina: React.FC<AdwinaProps> = ({ courseId, videoUrl, onClose }) => {
  const {
    messages,
    chatLoading,
    chatError,
    sendMessage,
  } = useAIFeatures({ courseId, videoUrl });

  return (
    <AIChatContainer>
      {onClose && (
        <CloseButtonContainer>
          <IconButton onClick={onClose} size="small" aria-label="close chat">
            <CloseIcon />
          </IconButton>
        </CloseButtonContainer>
      )}
      <ChatContent>
        <AIChat
          messages={messages}
          loading={chatLoading}
          error={chatError}
          onSendMessage={sendMessage}
        />
      </ChatContent>
    </AIChatContainer>
  );
};

export default Adwina; 