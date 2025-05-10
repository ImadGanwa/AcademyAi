import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Alert,
  Stack,
  useTheme,
  Avatar,
  Divider,
  Chip,
  Button,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatMessage from './ChatMessage' 
import ChatInput from './ChatInput';
import { useTrainerChat } from '../../hooks/useTrainerChat';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';

// Define Message type (can be moved to a types file later)
interface Message {
  content: string;
  sender: 'user' | 'trainer';
  timestamp: Date;
}

interface TrainerChatProps {
  courseId: string;
  videoUrl: string;
  onClose?: () => void;
}

/**
 * Trainer chat component styled to match Coursera's interface
 */
const TrainerChat: React.FC<TrainerChatProps> = ({ courseId, videoUrl, onClose }) => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useTrainerChat({ courseId, videoUrl });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clear messages when video changes
  useEffect(() => {
    clearMessages();
  }, [videoUrl, clearMessages]);

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        bgcolor: '#fff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.primary.main,
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToyOutlinedIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          <Typography variant="h6" sx={{ 
            fontSize: '1.125rem', 
            fontWeight: 600,
            background: 'linear-gradient(90deg, #fff 30%, rgba(255,255,255,0.8) 100%)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
            coach
          </Typography>
        </Box>
        <Box>
          {onClose && (
            <IconButton 
              onClick={onClose} 
              size="small" 
              sx={{ 
                color: '#fff',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'rotate(90deg)',
                  background: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fcfcfc',
          background: 'linear-gradient(180deg, #f8f9ff 0%, #fcfcfc 100%)',
        }}
      >
        {messages.length === 0 ? (
          <Fade in={true} timeout={800}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                pb: 10,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '1rem',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)'
                      },
                      '70%': {
                        boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)'
                      },
                      '100%': {
                        boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
                      }
                    }
                  }}
                >
                  <SmartToyOutlinedIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                    Hey there! 👋
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }}>
                    Let me know if you have any questions about this material. I'm here to help!
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                    Try asking me:
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ ml: 7 }}>
                <Stack spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="medium" 
                    startIcon={<QuizOutlinedIcon />}
                    sx={{
                      borderRadius: '8px',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 400,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => sendMessage('Give me practice questions')}
                  >
                    Give me practice questions
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    size="medium"
                    startIcon={<LightbulbOutlinedIcon />}
                    sx={{
                      borderRadius: '8px',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 400,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => sendMessage('Explain this topic in simple terms')}
                  >
                    Explain this topic in simple terms
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    size="medium"
                    startIcon={<SummarizeOutlinedIcon />}
                    sx={{
                      borderRadius: '8px',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 400,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => sendMessage('Give me a summary')}
                  >
                    Give me a summary
                  </Button>

                  <Button
                    variant="outlined"
                    color="primary"
                    size="medium"
                    startIcon={<EmojiObjectsOutlinedIcon />}
                    sx={{
                      borderRadius: '8px',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 400,
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => sendMessage('Give me real-life examples')}
                  >
                    Give me real-life examples
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Fade>
        ) : (
          messages.map((msg: Message, index: number) => (
            <ChatMessage key={index} {...msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)', bgcolor: '#f9f9f9' }}>
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </Box>

      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            m: 2, 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onClose={() => { /* Allow closing the error? Needs error state update in hook */ }}
        >
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default TrainerChat; 