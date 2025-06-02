import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper, 
  CircularProgress, 
  Avatar, 
  Button,
  useTheme
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import SendIcon from '@mui/icons-material/Send';
// import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { ReactComponent as UserIcon } from '../../assets/icons/user.svg';
import AdwinaImage from '../../assets/images/adwina.png';
import { useTranslation } from 'react-i18next';

const ChatContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 2px solidrgb(155, 153, 153);
  
  @media (max-width: 1200px) {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
  }
`;

const ChatHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background-color: #FAFBFC;
  color: ${props => props.theme.palette.text.primary};
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  border-radius: 0px 10px 0 0;
  height: 47px;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const ChatBody = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9fafc;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChatInputContainer = styled(Box)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid ${props => props.theme.palette.divider};
  flex-shrink: 0;
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 20px;
    background-color: #f5f7fa;
    
    &:hover {
      background-color: #f0f2f5;
    }
    
    &.Mui-focused {
      background-color: #fff;
    }
  }
`;

const MessageBubble = styled(Box)<{ isUser: boolean }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isUser ? props.theme.palette.primary.main : '#fff'};
  color: ${props => props.isUser ? '#fff' : props.theme.palette.text.primary};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  position: relative;
  text-align: ${props => props.isUser ? 'left' : 'left'};
  font-size: 0.9rem;
`;

const MessageTimestamp = styled(Typography)`
  font-size: 0.75rem !important;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 2px;
`;

// const MessageContent = styled(Typography)<{ isUser: boolean }>`
//   white-space: pre-wrap;
//   word-break: break-word;
//   line-height: 1.6;
  
//   a {
//     color: ${props => props.isUser ? '#fff' : props.theme.palette.primary.main};
//     text-decoration: underline;
//   }
  
//   b, strong {
//     font-weight: 600;
//   }
// `;

const SuggestionButton = styled(Button)`
  text-transform: none;
  border-radius: 20px;
  padding: 8px 16px;
  margin: 4px;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
`;

const WelcomeContainer = styled(Box)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// const StyledAvatar = styled(Avatar)`
//   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//   background-color: ${props => props.theme.palette.primary.main};
// `;

const AdwinaAvatar = styled(Avatar)`
  width: 40px;
  height: 40px;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #e0e0e0;
  padding: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserAvatar = styled(Avatar)`
  width: 40px;
  height: 40px;
  background-color: ${props => props.theme.palette.secondary.light};
  display: flex;
  justify-content: center;
  align-items: center;
  
  svg {
    width: 24px;
    height: 24px;
    fill: white;
  }
`;

interface AIMessage {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  messages: AIMessage[];
  loading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ 
  messages, 
  loading, 
  error, 
  onSendMessage 
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const { t, i18n } = useTranslation();

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && !loading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ChatContainer elevation={0}>
      <ChatHeader className="ai-chat-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AdwinaAvatar>
            <img src={AdwinaImage} alt="Adwina" />
          </AdwinaAvatar>
          <Typography variant="subtitle1" fontWeight={600}>
            Adwina
          </Typography>
        </Box>
      </ChatHeader>
      
      <ChatBody>
        {/* Static welcome message always shown */}
        <WelcomeContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AdwinaAvatar>
              <img src={AdwinaImage} alt="Adwina" />
            </AdwinaAvatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {t('AILearning.chat.welcome')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('AILearning.chat.welcomeDescription')}
              </Typography>
            </Box>
          </Box>
        </WelcomeContainer>
        
        {/* Suggestion buttons only shown when no messages */}
        {messages.length === 0 && (
          <Box sx={{ mx: 3, my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
              {t('AILearning.chat.tryAskingMe')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <SuggestionButton
                variant="outlined"
                startIcon={<QuizOutlinedIcon />}
                onClick={() => handleSuggestionClick('Give me practice questions about this topic')}
              >
                {t('AILearning.chat.giveMePracticeQuestions')}
              </SuggestionButton>
              
              <SuggestionButton
                variant="outlined"
                startIcon={<LightbulbOutlinedIcon />}
                onClick={() => handleSuggestionClick('Explain this concept in simple terms')}
              >
                {t('AILearning.chat.explainThisConcept')}
              </SuggestionButton>
              
              <SuggestionButton
                variant="outlined"
                startIcon={<SummarizeOutlinedIcon />}
                onClick={() => handleSuggestionClick('Summarize the key points')}
              >
                {t('AILearning.chat.summarizeKeyPoints')}
              </SuggestionButton>
            </Box>
          </Box>
        )}
        
        {/* User and AI messages */}
        {messages.map((msg, index) => (
          <MessageContainer key={index} isUser={msg.sender === 'user'}>
            {msg.sender === 'user' ? (
              user?.profileImage ? (
                <UserAvatar src={user.profileImage} alt="User" />
              ) : (
                <UserAvatar>
                  <UserIcon />
                </UserAvatar>
              )
            ) : (
              <AdwinaAvatar>
                <img src={AdwinaImage} alt="Adwina" />
              </AdwinaAvatar>
            )}
            
            <Box sx={{ maxWidth: '85%', display: 'flex', flexDirection: 'column' }}>
              <MessageBubble isUser={msg.sender === 'user'}>
                {msg.sender === 'user' ? (
                  <Typography variant="body2" sx={{ fontSize: '0.9rem !important', fontWeight: 'normal' }}>
                    {msg.content}
                  </Typography>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </MessageBubble>
              <MessageTimestamp align={msg.sender === 'user' ? 'right' : 'left'}>
                {formatTimestamp(msg.timestamp)}
              </MessageTimestamp>
            </Box>
          </MessageContainer>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            bgcolor: 'error.light', 
            color: 'error.contrastText', 
            p: 2, 
            borderRadius: 1,
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="body2">
              {error.includes('Authentication') 
                ? 'Authentication error: Please try refreshing the page or logging in again.' 
                : error}
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </ChatBody>
      
      <ChatInputContainer>
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          InputProps={{
            endAdornment: (
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={loading || !message.trim()}
                size="small"
              >
                {loading ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            )
          }}
        />
      </ChatInputContainer>
    </ChatContainer>
  );
};

const MessageContainer = styled(Box)<{ isUser: boolean }>`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  width: 100%;
  align-items: flex-start;
`;

export default AIChat; 