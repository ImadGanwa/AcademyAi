import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { IconButton, Tooltip, Zoom } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(156, 39, 176, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(156, 39, 176, 0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const StyledIconButton = styled(IconButton)<{ $pulsing: boolean }>`
  background-color: ${props => props.theme.palette.secondary.main} !important;
  color: white !important;
  width: 60px;
  height: 60px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${css`${float}`} 3s infinite ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: ${props => props.$pulsing ? css`${pulse}` : 'none'} 2s infinite;
  }
  
  &:hover {
    background-color: ${props => props.theme.palette.secondary.dark} !important;
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    font-size: 28px;
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: scale(1.1);
  }
`;

interface FloatingMentorChatButtonProps {
  onClick: () => void;
}

const FloatingMentorChatButton: React.FC<FloatingMentorChatButtonProps> = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Tooltip 
      title="Chat with Adwina Mentor" 
      placement="left"
      TransitionComponent={Zoom}
      arrow
    >
      <StyledIconButton
        onClick={onClick}
        size="large"
        aria-label="Adwina Mentor"
        $pulsing={!hovered}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <SchoolIcon />
      </StyledIconButton>
    </Tooltip>
  );
};

export default FloatingMentorChatButton; 