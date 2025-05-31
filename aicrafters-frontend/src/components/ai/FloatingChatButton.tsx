import React from 'react';
import styled from 'styled-components';
import { IconButton, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

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
        <ChatIcon fontSize="medium" />
      </StyledIconButton>
    </Tooltip>
  );
};

export default FloatingChatButton; 