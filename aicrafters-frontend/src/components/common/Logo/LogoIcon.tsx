import React from 'react';
import styled from 'styled-components';
import { ReactComponent as LogoIconSVG } from '../../../assets/icons/logo-icon.svg';

interface LogoIconProps {
  size?: number;
}

const StyledLogoIcon = styled(LogoIconSVG)<LogoIconProps>`
  height: ${props => props.size || 32}px;
  width: ${props => props.size || 32}px;

  path {
    fill: ${props => props.theme.palette.background.secondary};
  }
`;

export const LogoIcon: React.FC<LogoIconProps> = ({ size }) => {
  return <StyledLogoIcon size={size} />;
}; 