import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Paper, 
  Typography, 
  IconButton, 
  TextField, 
  Button, 
  Avatar, 
  CircularProgress,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChatIcon from '@mui/icons-material/Chat';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { api } from '../../../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

const ChatContainer = styled(Paper)<{ isFullscreen: boolean }>`
  display: flex;
  flex-direction: column;
  height: ${props => props.isFullscreen ? '100%' : '100%'};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: ${props => props.isFullscreen ? 'fixed' : 'relative'};
  top: ${props => props.isFullscreen ? '0' : 'auto'};
  left: ${props => props.isFullscreen ? '0' : 'auto'};
  right: ${props => props.isFullscreen ? '0' : 'auto'};
  bottom: ${props => props.isFullscreen ? '0' : 'auto'};
  z-index: ${props => props.isFullscreen ? '9999' : '1'};
  background-color: white;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
  border-radius: 12px 12px 0 0;
`;

const HeaderTitle = styled(Typography)`
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f8f9fa;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${props => props.isUser ? props.theme.palette.primary.main : 'white'};
  color: ${props => props.isUser ? 'white' : props.theme.palette.text.primary};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    ${props => props.isUser ? 'right: -8px;' : 'left: -8px;'}
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-top-color: ${props => props.isUser ? props.theme.palette.primary.main : 'white'};
    border-bottom: 0;
    margin-bottom: -8px;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const MessageSender = styled(Typography)`
  font-weight: 600;
  font-size: 0.9rem;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid ${props => props.theme.palette.divider};
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 20px;
    background-color: #f5f5f5;
    
    &.Mui-focused fieldset {
      border-color: ${props => props.theme.palette.primary.main};
    }
  }
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledAvatar = styled(Avatar)<{ isUser?: boolean }>`
  && {
    background-color: ${props => props.isUser ? props.theme.palette.secondary.main : props.theme.palette.primary.main};
  }
`;

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface TrainerChatProps {
  courseId: string;
  videoUrl: string;
  onClose?: () => void;
}

const TrainerChat: React.FC<TrainerChatProps> = ({ courseId, videoUrl, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setHasStarted(true);
    
    try {
      const encodedVideoUrl = encodeURIComponent(videoUrl);
      const response = await api.get('/api/trainer/chat', {
        params: {
          courseId,
          videoUrl: encodedVideoUrl,
          message: userMessage.content,
          threadId
        }
      });
      
      if (response.data?.data) {
        setThreadId(response.data.data.threadId);
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: response.data.data.response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError('Failed to get response from assistant');
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again later.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatName = (name: string) => {
    return name.split(' ')[0] || 'You';
  };

  const renderWelcomeMessage = () => {
    return (
      <WelcomeContainer>
        <Avatar sx={{ width: 60, height: 60, mb: 2, bgcolor: 'primary.main' }}>
          <SmartToyIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          AI Course Assistant
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Ask me any questions about this course or the current video!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ChatIcon />}
          onClick={() => setInputValue('Could you explain the main points of this video?')}
        >
          Start a conversation
        </Button>
      </WelcomeContainer>
    );
  };

  return (
    <ChatContainer isFullscreen={isFullscreen}>
      <Header>
        <HeaderTitle variant="h6">
          <SmartToyIcon />
          AI Course Assistant
        </HeaderTitle>
        <Controls>
          <IconButton onClick={toggleFullscreen} size="small" color="inherit">
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          {onClose && (
            <IconButton onClick={onClose} size="small" color="inherit">
              <CloseIcon />
            </IconButton>
          )}
        </Controls>
      </Header>
      
      {hasStarted ? (
        <MessagesContainer>
          {messages.map(message => (
            <div key={message.id}>
              <AvatarContainer>
                {message.isUser ? (
                  <StyledAvatar isUser>{user?.fullName?.charAt(0) || 'U'}</StyledAvatar>
                ) : (
                  <StyledAvatar>AI</StyledAvatar>
                )}
                <MessageSender>
                  {message.isUser ? formatName(user?.fullName || 'You') : 'AI Assistant'}
                </MessageSender>
              </AvatarContainer>
              <MessageBubble isUser={message.isUser}>
                {message.content}
              </MessageBubble>
            </div>
          ))}
          
          {loading && (
            <div>
              <AvatarContainer>
                <StyledAvatar>AI</StyledAvatar>
                <MessageSender>AI Assistant</MessageSender>
              </AvatarContainer>
              <MessageBubble isUser={false}>
                <CircularProgress size={20} sx={{ color: 'primary.main' }} />
              </MessageBubble>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>
      ) : (
        renderWelcomeMessage()
      )}
      
      <InputContainer>
        <StyledTextField
          fullWidth
          placeholder="Ask a question..."
          variant="outlined"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          size="small"
          disabled={loading}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend} 
          disabled={loading || !inputValue.trim()}
          sx={{ bgcolor: theme => theme.palette.primary.main, color: 'white', '&:hover': { bgcolor: theme => theme.palette.primary.dark } }}
        >
          <SendIcon />
        </IconButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default TrainerChat; 