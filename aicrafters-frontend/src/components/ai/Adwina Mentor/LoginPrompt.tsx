import React from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { ReactComponent as ChatIcon } from '../../../assets/icons/Chat.svg';

const LoginPromptContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  position: relative;
  padding: 16px;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Header = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 0 12px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

const CloseButtonContainer = styled(Box)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
`;

const PromptIconAvatar = styled(Avatar)`
  width: 50px;
  height: 50px;
  background-color: ${props => props.theme.palette.secondary.light};
  margin-bottom: 16px;
  svg {
    width: 28px;
    height: 28px;
    fill: ${props => props.theme.palette.secondary.contrastText};
  }
`;

const LoginButton = styled(Button)`
  border-radius: 20px !important;
  padding: 10px 24px !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  text-transform: none !important;
  background-color: ${props => props.theme.palette.primary.main} !important;
  color: ${props => props.theme.palette.primary.contrastText} !important;
  margin-top: 16px !important;
  
  &:hover {
    background-color: ${props => props.theme.palette.primary.dark} !important;
  }
`;

interface LoginPromptProps {
  onClose: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onClose }) => {
  const localizedNavigate = useLocalizedNavigate();

  const handleLogin = () => {
    onClose();
    localizedNavigate('/login');
  };

  return (
    <LoginPromptContainer>
      <CloseButtonContainer>
        <IconButton onClick={onClose} size="small" aria-label="close login prompt">
          <CloseIcon fontSize="small" />
        </IconButton>
      </CloseButtonContainer>
      
      <PromptIconAvatar>
        <ChatIcon />
      </PromptIconAvatar>
      
      <Typography variant="h6" fontWeight={500} color="text.primary" sx={{ mb: 1 }}>
        Chat with Adwina Mentor
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: '350px' }}>
        Please log in to access personalized mentorship guidance and career advice.
      </Typography>
      
      <LoginButton
        variant="contained"
        startIcon={<LoginIcon />}
        onClick={handleLogin}
        size="medium"
      >
        Login to Chat
      </LoginButton>
    </LoginPromptContainer>
  );
};

export default LoginPrompt; 