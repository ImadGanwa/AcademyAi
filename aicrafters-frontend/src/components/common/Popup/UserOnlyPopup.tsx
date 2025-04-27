import React from 'react';
import styled from 'styled-components';
import { Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
    width: 24px;
    height: 24px;
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const PopupBody = styled.div`
  padding: 24px;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: ${props => props.theme.palette.warning.light};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;

  svg {
    width: 32px;
    height: 32px;
    color: ${props => props.theme.palette.warning.main};
  }
`;

const Message = styled(Typography)`
  margin-bottom: 24px !important;
  color: ${props => props.theme.palette.text.secondary} !important;
`;

const ClosePopupButton = styled(Button)`
  width: 100% !important;
  padding: 12px !important;
  font-size: 1rem !important;
  background: ${props => props.theme.palette.secondary.main} !important;
  color: white !important;
  margin-bottom: 12px !important;
`;

interface UserOnlyPopupProps {
  onClose: () => void;
}

export const UserOnlyPopup: React.FC<UserOnlyPopupProps> = ({ onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupContent>
        <PopupHeader>
          <PopupTitle>Users Only</PopupTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </PopupHeader>
        <PopupBody>
          <IconWrapper>
            <WarningAmberIcon />
          </IconWrapper>
          <Message variant="body1">
            Only users can purchase courses. Please switch to a user account to continue with your purchase.
          </Message>
          <ClosePopupButton 
            variant="contained"
            onClick={onClose}
          >
            Close
          </ClosePopupButton>
        </PopupBody>
      </PopupContent>
    </Overlay>
  );
}; 