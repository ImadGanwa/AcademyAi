import React from 'react';
import styled from 'styled-components';
import { Box } from '@mui/material';
import AIChat from './AIChat';
import { useAIFeatures } from '../../hooks/useAIFeatures';

const AIChatContainer = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  background: ${props => props.theme.palette.background.paper};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
`;

const ChatContent = styled(Box)`
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

interface AICoachProps {
  courseId: string;
  videoUrl: string;
}

const AICoach: React.FC<AICoachProps> = ({ courseId, videoUrl }) => {
  const {
    messages,
    chatLoading,
    chatError,
    sendMessage,
  } = useAIFeatures({ courseId, videoUrl });

  return (
    <AIChatContainer>
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

export default AICoach; 