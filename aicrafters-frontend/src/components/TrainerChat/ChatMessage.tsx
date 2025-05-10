import React from 'react';
import { Box, Typography, Paper, Avatar, useTheme } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { format } from 'date-fns';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'trainer';
  timestamp: Date | number; // timestamp can be Date object or number from Date.now()
}

/**
 * Individual chat message component with better styling and animations
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ content, sender, timestamp }) => {
  const theme = useTheme();
  const isTrainer = sender === 'trainer';
  
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 3,
        alignItems: 'flex-start',
        opacity: 1,
        animation: 'fadeIn 0.5s ease-out',
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: isTrainer ? 'translateX(-10px)' : 'translateX(10px)'
          },
          to: {
            opacity: 1,
            transform: 'translateX(0)'
          }
        }
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          mr: 2,
          bgcolor: isTrainer ? theme.palette.primary.main : theme.palette.grey[200],
          color: isTrainer ? '#fff' : theme.palette.text.primary,
          boxShadow: isTrainer ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        {isTrainer ? <SmartToyOutlinedIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
      </Avatar>
      
      <Box sx={{ maxWidth: '80%' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: isTrainer ? 'rgba(25, 118, 210, 0.05)' : '#fff',
            border: '1px solid',
            borderColor: isTrainer ? 'rgba(25, 118, 210, 0.1)' : theme.palette.grey[200],
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-2px)'
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 10,
              height: 10,
              backgroundColor: isTrainer ? 'rgba(25, 118, 210, 0.05)' : '#fff',
              borderLeft: isTrainer ? '1px solid rgba(25, 118, 210, 0.1)' : `1px solid ${theme.palette.grey[200]}`,
              borderBottom: isTrainer ? '1px solid rgba(25, 118, 210, 0.1)' : `1px solid ${theme.palette.grey[200]}`,
              top: 16,
              left: -6,
              transform: 'rotate(45deg)'
            }
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              color: theme.palette.text.primary,
              lineHeight: 1.6,
              '& p': { marginTop: 0 }
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Paper>
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 0.5, 
            color: theme.palette.text.secondary,
            opacity: 0.7,
            transition: 'opacity 0.2s',
            '&:hover': {
              opacity: 1
            }
          }}
        >
          {format(new Date(timestamp), 'h:mm a')}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage; 