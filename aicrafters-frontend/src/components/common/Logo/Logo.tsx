import React from 'react';
import styled from 'styled-components';
import { ReactComponent as LogoSVG } from '../../../assets/images/logo.svg';

const StyledLogo = styled(LogoSVG)`
  height: 65px;
  width: auto;
`;

export const Logo: React.FC = () => {
  return <StyledLogo />;
}; 