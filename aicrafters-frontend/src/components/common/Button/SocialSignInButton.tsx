import React from 'react';
import { IconButton } from './IconButton';
import styled from 'styled-components';

interface SocialSignInButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  provider?: 'google' | 'linkedin';
  sx?: any;
}

const StyledIconButton = styled(IconButton)<{ $provider?: 'google' | 'linkedin' }>`
  && {
    color: ${props => {
      switch (props.$provider) {
        case 'google':
          return '#081D3F';
        case 'linkedin':
          return '#081D3F';
        default:
          return 'inherit';
      }
    }};
    border-color: ${props => {
      switch (props.$provider) {
        case 'google':
          return '#D6D9DD';
        case 'linkedin':
          return '#D6D9DD';
        default:
          return 'inherit';
      }
    }};

    &:hover {
      border-color: ${props => {
        switch (props.$provider) {
          case 'google':
            return '#4285F4';
          case 'linkedin':
            return '#0A66C2';
          default:
            return 'inherit';
        }
      }};
      background-color: ${props => {
        switch (props.$provider) {
          case 'google':
            return 'rgba(66, 133, 244, 0.04)';
          case 'linkedin':
            return 'rgba(10, 102, 194, 0.04)';
          default:
            return 'inherit';
        }
      }};
    }
  }
`;

export const SocialSignInButton: React.FC<SocialSignInButtonProps> = ({
  icon,
  text,
  onClick,
  provider
}) => {
  return (
    <StyledIconButton
      icon={icon}
      variant="outlined"
      onClick={onClick}
      fullWidth
      $provider={provider}
    >
      {text}
    </StyledIconButton>
  );
}; 