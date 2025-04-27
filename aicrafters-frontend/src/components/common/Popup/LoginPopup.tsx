import React from 'react';
import styled from 'styled-components';
import { Typography, Button } from '@mui/material';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
`;

const PopupContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
`;

const PopupTitle = styled(Typography)`
  font-weight: bold !important;
  font-size: 1.2rem !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PopupBody = styled.div`
  padding: 24px;
  text-align: center;
`;

const Message = styled(Typography)`
  margin-bottom: 24px !important;
  color: ${props => props.theme.palette.text.secondary} !important;
`;

const LoginButton = styled(Button)`
  width: 100% !important;
  padding: 12px !important;
  font-size: 1rem !important;
  background: ${props => props.theme.palette.secondary.main} !important;
  color: white !important;
  margin-bottom: 12px !important;
`;

interface LoginPopupProps {
  onClose: () => void;
  message?: string;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({ onClose, message = 'Please login to continue' }) => {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLogin = () => {
    onClose();
    navigate('login');
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupContent>
        <PopupHeader>
          <PopupTitle>Login</PopupTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </PopupHeader>
        <PopupBody>
          <Message variant="body1">
            {message}
          </Message>
          <LoginButton 
            variant="contained"
            onClick={handleLogin}
          >
            Login
          </LoginButton>
        </PopupBody>
      </PopupContent>
    </Overlay>
  );
}; 