import React from 'react';
import styled from 'styled-components';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AIMentorChat from './AIMentorChat';
import { useAIMentorFeatures } from '../../../hooks/useAIMentorFeatures';

// Simplified container, most styling is now in IntegratedChatContainer
const AIMentorChatWrapper = styled(Box)`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff; // Plain background
  position: relative; 
`;

const CloseButtonContainer = styled(Box)`
  position: absolute;
  top: 8px; // Adjusted for a more integrated look
  right: 8px;
  z-index: 10;
  
  .MuiIconButton-root {
    background: transparent; // Simpler close button
    color: #757575; // Standard icon color
    width: 32px;
    height: 32px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #000000;
    }
  }
`;

const ChatContent = styled(Box)`
  flex: 1;
  // height: 100%; // Height will be managed by AIMentorChatWrapper or parent
  overflow: hidden; // Important for scroll within AIMentorChat
  display: flex;
  flex-direction: column;
`;

interface AdwinaMentorProps {
  mentorId?: string;
  userId?: string;
  onClose?: () => void;
}

const AdwinaMentor: React.FC<AdwinaMentorProps> = ({ mentorId, userId, onClose }) => {
  const {
    messages,
    chatLoading,
    chatError,
    sendMessage,
  } = useAIMentorFeatures({ mentorId, userId });

  return (
    <AIMentorChatWrapper>
      {onClose && (
        <CloseButtonContainer>
          <IconButton onClick={onClose} size="small" aria-label="close mentor chat">
            <CloseIcon fontSize="small" />
          </IconButton>
        </CloseButtonContainer>
      )}
      <ChatContent>
        <AIMentorChat // AIMentorChat will now need to manage its own height or be flexible
          messages={messages}
          loading={chatLoading}
          error={chatError}
          onSendMessage={sendMessage}
        />
      </ChatContent>
    </AIMentorChatWrapper>
  );
};

export default AdwinaMentor; 