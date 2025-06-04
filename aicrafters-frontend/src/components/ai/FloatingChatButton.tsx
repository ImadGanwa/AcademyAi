import React from 'react';
import styled from 'styled-components';
import { IconButton, Tooltip } from '@mui/material';
import AdwinaImage from '../../assets/images/adwina.png';

const StyledIconButton = styled(IconButton)`
  background-color: ${props => props.theme.palette.primary.main} !important;
  color: white !important;
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background-color: ${props => props.theme.palette.primary.dark} !important;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

interface FloatingChatButtonProps {
  onClick: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
  return (
    <Tooltip title="Adwina" placement="left">
      <StyledIconButton
        onClick={onClick}
        size="large"
        aria-label="Adwina"
      >
        <img src={AdwinaImage} alt="Adwina" style={{ width: '100%', height: '100%' }} />
      </StyledIconButton>
    </Tooltip>
  );
};

export default FloatingChatButton; 