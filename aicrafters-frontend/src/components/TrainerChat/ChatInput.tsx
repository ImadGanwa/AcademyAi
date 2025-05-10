import React, { useState, FormEvent, useEffect } from 'react';
import { TextField, IconButton, Box, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic'; // MicIcon is imported but not used, can be removed if not planned for voice input

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

/**
 * Enhanced chat input component with better UI and animations
 */
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mount animation
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        opacity: isMounted ? 1 : 0,
        transform: isMounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <TextField
        className="trainer-chat-input" // Added class for potential global styling or querySelector access
        fullWidth
        placeholder="Ask me anything"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={isLoading || disabled}
        variant="outlined"
        size="small"
        sx={{ 
          mr: 1,
          transition: 'all 0.3s ease',
          '& .MuiOutlinedInput-root': {
            borderRadius: '9999px', // For a pill-shaped input
            backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.97)' : 'rgba(0, 0, 0, 0.04)',
            boxShadow: isFocused ? '0 4px 10px rgba(0, 0, 0, 0.1)' : 'none',
            transition: 'all 0.3s ease',
            transform: isFocused ? 'translateY(-2px)' : 'translateY(0)',
            '& fieldset': {
              borderColor: isFocused ? 'rgba(25, 118, 210, 0.4)' : 'transparent',
              transition: 'border-color 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(25, 118, 210, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
              borderWidth: 1,
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
          },
        }}
      />
      <IconButton 
        className="trainer-chat-send" // Added class for potential global styling or querySelector access
        color="primary" 
        size="medium"
        type="submit" 
        disabled={!message.trim() || isLoading || disabled}
        aria-label="Send message"
        sx={{ 
          color: message.trim() ? 'primary.main' : 'rgba(0, 0, 0, 0.26)',
          p: 1.2,
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          transform: message.trim() ? 'scale(1.1)' : 'scale(1)',
          background: message.trim() ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          '&:hover': {
            background: message.trim() ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
            transform: message.trim() ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
          },
          animation: isLoading ? 'pulse 1.5s infinite' : 'none',
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
        {isLoading ? 
          <CircularProgress size={24} thickness={4} /> : 
          <SendIcon style={{ transition: 'transform 0.3s ease', transform: message.trim() ? 'translateX(2px)' : 'translateX(0)' }} />
        }
      </IconButton>
      {/* Voice input can be added here if MicIcon is to be used
      <IconButton color="secondary" size="medium" disabled={isLoading || disabled} sx={{ ml: 0.5 }}>
        <MicIcon />
      </IconButton>
      */}
    </Box>
  );
};

export default ChatInput; 