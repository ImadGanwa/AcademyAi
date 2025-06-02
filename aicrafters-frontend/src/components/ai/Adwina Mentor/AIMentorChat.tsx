import React, { useRef, useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  CircularProgress, 
  Avatar, 
  Button,
  useTheme,
  Zoom
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import SendIcon from '@mui/icons-material/Send';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import MarkdownRenderer from '../../common/MarkdownRenderer';
import { ReactComponent as UserIcon } from '../../../assets/icons/user.svg';
import adwinaImage from '../../../assets/images/adwina.png';
import { useTranslation } from 'react-i18next';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInRight = keyframes`
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const ChatContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-radius: 0;
  overflow: hidden;
`;

const ChatHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

const ChatBody = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px; /* Increased spacing between messages */
  scroll-behavior: smooth;
  
  /* Improved scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #bdbdbd;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
`;

const ChatInputContainer = styled(Box)`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
  box-shadow: 0 -1px 2px rgba(0,0,0,0.03);
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 24px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    padding-right: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: #bdbdbd;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    &.Mui-focused {
      border-color: ${props => props.theme.palette.primary.main};
      box-shadow: 0 0 0 3px ${props => props.theme.palette.primary.main + '20'};
    }
    
    .MuiOutlinedInput-notchedOutline {
      border: none;
    }
  }
  
  .MuiInputBase-input {
    padding: 12px 16px;
  }
`;

const MessageBubble = styled(Box)<{ isUser: boolean }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: ${props => props.isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.isUser 
    ? props.theme.palette.primary.main 
    : '#f0f2f5'};
  color: ${props => props.isUser ? props.theme.palette.primary.contrastText : props.theme.palette.text.primary};
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  font-size: 0.95rem;
  animation: ${props => props.isUser ? 
    css`${slideInRight} 0.3s ease forwards` : 
    css`${slideInLeft} 0.3s ease forwards`};
  position: relative;
  
  /* Small triangle effect for bubbles */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    ${props => props.isUser ? 'right: -8px' : 'left: -8px'};
    width: 15px;
    height: 15px;
    background: ${props => props.isUser 
      ? props.theme.palette.primary.main 
      : '#f0f2f5'};
    clip-path: ${props => props.isUser 
      ? 'polygon(0 0, 0% 100%, 100% 100%)' 
      : 'polygon(100% 0, 0% 100%, 100% 100%)'};
    display: ${props => props.isUser ? 'none' : 'none'}; /* Disabled for now, enable if desired */
  }
`;

const MessageTimestamp = styled(Typography)`
  font-size: 0.7rem !important;
  color: #8a8a8a;
  margin-top: 4px;
  text-align: ${props => (props.align === 'right' ? 'right' : 'left')};
  opacity: 0.8;
`;

const SuggestionButton = styled(Button)`
  text-transform: none;
  border-radius: 20px;
  padding: 8px 16px;
  margin: 5px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #f0f2f5;
  border: 1px solid #e0e0e0;
  color: #333333;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  
  &:hover {
    background: #e8eaed;
    border-color: #bdbdbd;
    transform: translateY(-1px);
    box-shadow: 0 3px 5px rgba(0,0,0,0.08);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  animation: ${css`${fadeIn} 0.4s ease forwards`};
`;

const WelcomeContainer = styled(Box)`
  padding: 18px;
  background: linear-gradient(to bottom right, #f9f9f9, #f4f4f4);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #eeeeee;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  animation: ${css`${fadeIn} 0.4s ease forwards`};
`;

const AdwinaMentorAvatar = styled(Avatar)`
  width: 38px;
  height: 38px;
  background-color: #ffffff ; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 2px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.theme.palette.secondary.main};
    border-radius: 50%;
    z-index: -1;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    position: relative;
    z-index: 1;
  }
`;

const UserAvatar = styled(Avatar)`
  width: 38px;
  height: 38px;
  background-color: ${props => props.theme.palette.grey[300]};
  color: ${props => props.theme.palette.text.primary};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  svg {
    width: 22px;
    height: 22px;
    fill: ${props => props.theme.palette.text.secondary};
  }
`;

const MessageContainer = styled(Box)<{ isUser: boolean; isNew?: boolean }>`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  width: 100%;
  align-items: flex-start;
  animation: ${css`${fadeIn} 0.4s ease forwards`};
  ${props => props.isNew ? css`animation: ${fadeIn} 0.4s ease forwards;` : ''}
`;

const SendButton = styled(IconButton)`
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
  margin-left: 8px;
  width: 44px;
  height: 44px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    background-color: ${props => props.theme.palette.primary.dark};
    transform: translateY(-2px);
    box-shadow: 0 3px 5px rgba(0,0,0,0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #e0e0e0;
    color: #9e9e9e;
  }
`;

// New typing indicator
const TypingIndicator = styled(Box)`
  display: flex;
  align-items: center;
  margin-top: 4px;
  margin-left: 12px;
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  margin: 0 1px;
  background-color: ${props => props.theme.palette.secondary.main};
  border-radius: 50%;
  opacity: 0.7;
  
  &:nth-child(1) {
    animation: ${css`${pulseAnimation} 1s infinite 0.1s`};
  }
  
  &:nth-child(2) {
    animation: ${css`${pulseAnimation} 1s infinite 0.3s`};
  }
  
  &:nth-child(3) {
    animation: ${css`${pulseAnimation} 1s infinite 0.5s`};
  }
`;

// Add this styled component for error messages
const ErrorMessageBox = styled(Box)`
  background-color: ${props => props.theme.palette.error.light};
  color: ${props => props.theme.palette.error.dark};
  padding: 16px;
  border-radius: 10px;
  margin-top: 8px;
  margin-bottom: 8px;
  border: 1px solid ${props => props.theme.palette.error.light};
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  animation: ${css`${fadeIn} 0.3s ease forwards`};
`;

interface AIMentorMessage {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIMentorChatProps {
  messages: AIMentorMessage[];
  loading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

export const AIMentorChat: React.FC<AIMentorChatProps> = ({ 
  messages, 
  loading, 
  error, 
  onSendMessage 
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [lastMessageIndex, setLastMessageIndex] = useState(-1);

  // Detect when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageIndex) {
      setLastMessageIndex(messages.length);
    }
  }, [messages, lastMessageIndex]);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Detect scroll position to show/hide scroll button
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!chatBody) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatBody;
      // Show button if not at bottom
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    chatBody.addEventListener('scroll', handleScroll);
    return () => chatBody.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AdwinaMentorAvatar>
            <img src={adwinaImage} alt="Adwina" />
          </AdwinaMentorAvatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="textPrimary">
              Adwina Mentor
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{fontSize: '0.8rem'}}>
              Your AI Career Guide
            </Typography>
          </Box>
        </Box>
      </ChatHeader>
      
      <ChatBody ref={chatBodyRef}>
        <WelcomeContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AdwinaMentorAvatar>
              <img src={adwinaImage} alt="Adwina" />
            </AdwinaMentorAvatar>
            <Box>
              <Typography variant="h6" component="div" fontWeight={600} sx={{fontSize: '1.1rem'}} color="textPrimary">
                {t('AIMentor.chat.welcome')}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.25, fontSize: '0.85rem'}}>
                {t('AIMentor.chat.welcomeDescription')}
              </Typography>
            </Box>
          </Box>
          
          {messages.length === 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'flex-start', pt: 1.5}}>
                <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                  <SuggestionButton
                    startIcon={<SchoolOutlinedIcon sx={{fontSize: '1rem'}}/>}
                    onClick={() => handleSuggestionClick('How do I find the right mentor?')}
                  >
                    {t('AIMentor.chat.findAMentor')}
                  </SuggestionButton>
                </Zoom>
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <SuggestionButton
                    startIcon={<QuestionAnswerOutlinedIcon sx={{fontSize: '1rem'}}/>}
                    onClick={() => handleSuggestionClick('Mentorship session tips?')}
                  >
                    {t('AIMentor.chat.mentorshipTips')}
                  </SuggestionButton>
                </Zoom>
                <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                  <SuggestionButton
                    startIcon={<TipsAndUpdatesOutlinedIcon sx={{fontSize: '1rem'}}/>}
                    onClick={() => handleSuggestionClick('Prepare for first meeting?')}
                  >
                    {t('AIMentor.chat.preparationAdvice')}
                  </SuggestionButton>
                </Zoom>
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <SuggestionButton
                    startIcon={<PsychologyOutlinedIcon sx={{fontSize: '1rem'}}/>}
                    onClick={() => handleSuggestionClick('Different mentorship styles?')}
                  >
                    {t('AIMentor.chat.mentorshipStyles')}
                  </SuggestionButton>
                </Zoom>
            </Box>
          )}
        </WelcomeContainer>
        
        {messages.map((msg, index) => (
          <MessageContainer 
            key={index} 
            isUser={msg.sender === 'user'}
            isNew={index === messages.length - 1 && index === lastMessageIndex - 1}
          >
            {msg.sender === 'user' ? (
              user?.profileImage ? (
                <UserAvatar src={user.profileImage} alt="User" />
              ) : (
                <UserAvatar>
                  <UserIcon />
                </UserAvatar>
              )
            ) : (
              <AdwinaMentorAvatar>
                <img src={adwinaImage} alt="Adwina" />
              </AdwinaMentorAvatar>
            )}
            
            <Box sx={{ 
              maxWidth: '85%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' 
            }}>
              <MessageBubble isUser={msg.sender === 'user'}>
                {msg.sender === 'user' ? (
                  <Typography variant="body2" sx={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: 0.5, mb: 2 }}>
            <AdwinaMentorAvatar>
              <img src={adwinaImage} alt="Adwina" />
            </AdwinaMentorAvatar>
            <TypingIndicator>
              <TypingDot />
              <TypingDot />
              <TypingDot />
            </TypingIndicator>
          </Box>
        )}
        
        {error && (
          <ErrorMessageBox>
            <Typography variant="body2">
              {error.includes('Authentication') 
                ? 'Authentication error. Please refresh or log in again.' 
                : error}
            </Typography>
          </ErrorMessageBox>
        )}
        
        <div ref={messagesEndRef} />
      </ChatBody>
      
      <ChatInputContainer>
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder="Ask about mentorship or career advice..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          multiline
          maxRows={3}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={loading || !message.trim()}
          size="medium"
          aria-label="send message"
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : <SendIcon />}
        </SendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default AIMentorChat; 