import styled, { keyframes } from 'styled-components';
import { Card, Button, Typography } from '@mui/material';

// Subtle animations - reduced from previous over-animated versions
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const gentleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const subtleGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(215, 16, 193, 0.1), 0 0 25px rgba(255, 111, 0, 0.05);
  }
  50% {
    box-shadow: 0 0 20px rgba(215, 16, 193, 0.15), 0 0 30px rgba(255, 111, 0, 0.08);
  }
`;

const particleFloat = keyframes`
  0% {
    transform: translateY(100vh) translateX(0px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) translateX(50px) rotate(180deg);
    opacity: 0;
  }
`;

// Main container with subtle background
export const ChoicePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing(4)};
  background: 
    radial-gradient(circle at 25% 75%, rgba(15, 15, 35, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 75% 25%, rgba(26, 26, 46, 0.8) 0%, transparent 50%),
    linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #2d1b4e 75%, #1e1e3f 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(215, 16, 193, 0.04) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 111, 0, 0.04) 0%, transparent 50%);
    pointer-events: none;
    animation: ${subtleGlow} 8s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(1px 1px at 25px 35px, rgba(255, 255, 255, 0.05), transparent),
      radial-gradient(1px 1px at 45px 75px, rgba(255, 255, 255, 0.03), transparent);
    background-repeat: repeat;
    background-size: 150px 150px;
    pointer-events: none;
    opacity: 0.3;
  }
`;

// Subtle floating particles
export const FloatingParticle = styled.div`
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  animation: ${particleFloat} 15s linear infinite;
  
  &:nth-child(1) { 
    left: 15%; 
    animation-delay: 0s; 
    background: #D710C1;
    box-shadow: 0 0 4px rgba(215, 16, 193, 0.3);
  }
  &:nth-child(2) { 
    left: 25%; 
    animation-delay: 3s; 
    background: #FF6F00;
    box-shadow: 0 0 4px rgba(255, 111, 0, 0.3);
  }
  &:nth-child(3) { 
    left: 35%; 
    animation-delay: 6s; 
    background: #D710C1;
    box-shadow: 0 0 3px rgba(215, 16, 193, 0.2);
  }
  &:nth-child(4) { 
    left: 65%; 
    animation-delay: 2s; 
    background: #FF6F00;
    box-shadow: 0 0 3px rgba(255, 111, 0, 0.2);
  }
  &:nth-child(5) { 
    left: 75%; 
    animation-delay: 4s; 
    background: #D710C1;
    box-shadow: 0 0 5px rgba(215, 16, 193, 0.4);
  }
  &:nth-child(6) { 
    left: 85%; 
    animation-delay: 7s; 
    background: #FF6F00;
    box-shadow: 0 0 4px rgba(255, 111, 0, 0.3);
  }
`;

// Clean page title
export const PageTitle = styled(Typography)`
  && {
    margin-bottom: ${({ theme }) => theme.spacing(6)};
    font-weight: 800;
    font-size: clamp(2.5rem, 5vw, 3.8rem);
    text-align: center;
    background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 30%, #D710C1 60%, #FF6F00 90%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${fadeInUp} 1s ease-out;
    position: relative;
    z-index: 2;
    letter-spacing: -0.01em;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
      margin-bottom: ${({ theme }) => theme.spacing(4)};
      font-size: clamp(2rem, 7vw, 3rem);
    }
  }
`;

// Clean subtitle
export const PageSubtitle = styled(Typography)`
  && {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.2rem;
    text-align: center;
    margin-bottom: ${({ theme }) => theme.spacing(6)};
    font-weight: 400;
    letter-spacing: 0.3px;
    animation: ${fadeInUp} 1s ease-out 0.2s both;
    position: relative;
    z-index: 2;
    max-width: 600px;
    line-height: 1.6;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
      font-size: 1.1rem;
      margin-bottom: ${({ theme }) => theme.spacing(4)};
    }
  }
`;

// Cards container
export const CardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(6)};
  justify-content: center;
  align-items: stretch;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  position: relative;
  z-index: 2;

  @media (max-width: ${({ theme }) => theme.breakpoints.values.lg}px) {
    gap: ${({ theme }) => theme.spacing(4)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    flex-direction: column;
    width: 100%;
    max-width: 450px;
    gap: ${({ theme }) => theme.spacing(4)};
  }
`;

// Clean base card styles - SIGNIFICANTLY REDUCED GLOSSINESS
export const ChoiceCardStyled = styled(Card)`
  && {
    width: 420px;
    min-height: 550px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing(5)};
    border-radius: 20px;
    backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    cursor: pointer;

    /* Simple top accent line */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }

    &:hover {
      transform: translateY(-12px) scale(1.02);

      &::before {
        transform: translateX(100%);
      }
    }

    @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
      width: 100%;
      min-height: 500px;
      
      &:hover {
        transform: translateY(-8px) scale(1.01);
      }
    }
  }
`;

export const CardContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex-grow: 1;
  position: relative;
  z-index: 2;
  min-height: 330px;
  justify-content: flex-start;
  padding-top: ${({ theme }) => theme.spacing(2)}; /* Add consistent top padding */

  /* Create fixed-height logo container */
  & > *:first-child {
    height: 100px; /* Fixed height for logo container */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }
`;

export const LogoImage = styled.img`
  height: 65px;
  width: auto;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  object-fit: contain;
  transition: all 0.3s ease;
  animation: ${gentleFloat} 8s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));

  &:hover {
    transform: scale(1.05);
  }
`;

// Trace logo using actual SVG - PROPER IMPLEMENTATION
export const TraceLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  animation: ${gentleFloat} 8s ease-in-out infinite;
  
  svg {
    height: 45px;
    width: auto;
    filter: drop-shadow(0 2px 8px rgba(255, 111, 0, 0.2));
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      filter: drop-shadow(0 4px 12px rgba(255, 111, 0, 0.3));
    }
  }
`;

export const CardTitle = styled(Typography)`
  && {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 700;
    font-size: 1.9rem;
    line-height: 1.2;
    position: relative;
    letter-spacing: -0.3px;
  }
`;

export const CardDescription = styled(Typography)`
  && {
    margin-bottom: ${({ theme }) => theme.spacing(4)};
    flex-grow: 1;
    line-height: 1.7;
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 0.2px;
    opacity: 0.9;
  }
`;

// Clean button styles - REMOVED EXCESSIVE GLOSSINESS
export const ActionButton = styled(Button)`
  && {
    padding: ${({ theme }) => theme.spacing(2.5, 5)};
    font-weight: 700;
    font-size: 1.1rem;
    border-radius: 12px;
    margin-top: ${({ theme }) => theme.spacing(2)};
    text-transform: none;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    min-height: 60px;
    letter-spacing: 0.3px;

    /* Simple shimmer effect */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      transition: left 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }

    &:active {
      transform: scale(0.97);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
    }
  }
`;

// Adwin.ai specific styles - IMPROVED CONTRAST & REDUCED GLOSSINESS
export const AdwinCard = styled(ChoiceCardStyled)`
  && {
    background: linear-gradient(145deg, 
      rgba(30, 20, 50, 0.95) 0%, 
      rgba(40, 25, 65, 0.97) 25%, 
      rgba(50, 30, 80, 0.95) 50%, 
      rgba(60, 35, 95, 0.97) 75%, 
      rgba(30, 20, 50, 0.95) 100%
    );
    color: #FFFFFF;
    border: 1px solid rgba(215, 16, 193, 0.25);
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(215, 16, 193, 0.1);
    
    /* Subtle animated border */
    &::after {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: linear-gradient(45deg, 
        rgba(215, 16, 193, 0.3), 
        rgba(162, 28, 175, 0.2), 
        rgba(236, 72, 153, 0.3), 
        rgba(190, 24, 93, 0.2)
      );
      border-radius: 21px;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::after {
      opacity: 1;
    }

    &:hover {
      border-color: rgba(215, 16, 193, 0.4);
      box-shadow: 
        0 20px 45px rgba(0, 0, 0, 0.3),
        0 0 25px rgba(215, 16, 193, 0.15),
        0 0 0 1px rgba(215, 16, 193, 0.2);
    }
  }
`;

export const AdwinButton = styled(ActionButton)`
  && {
    background: linear-gradient(135deg, 
      #D710C1 0%, 
      #a21caf 30%, 
      #ec4899 70%, 
      #be185d 100%
    );
    color: #FFFFFF;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 6px 15px rgba(215, 16, 193, 0.3);

    &:hover {
      background: linear-gradient(135deg, 
        #a21caf 0%, 
        #D710C1 30%, 
        #be185d 70%, 
        #ec4899 100%
      );
      box-shadow: 0 8px 20px rgba(215, 16, 193, 0.4);
      transform: translateY(-3px) scale(1.02);
      border-color: rgba(255, 255, 255, 0.2);
    }

    &:active {
      transform: translateY(-1px) scale(1.01);
    }
  }
`;

// Trace+ specific styles - OPTIMIZED FOR LOGO CONTRAST
export const TraceCard = styled(ChoiceCardStyled)`
  && {
    background: linear-gradient(145deg, 
      rgba(20, 15, 10, 0.95) 0%, 
      rgba(30, 20, 15, 0.97) 25%, 
      rgba(40, 25, 20, 0.95) 50%, 
      rgba(50, 30, 25, 0.97) 75%, 
      rgba(20, 15, 10, 0.95) 100%
    );
    color: #FFFFFF;
    border: 1px solid rgba(255, 111, 0, 0.25);
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 111, 0, 0.1);
    
    /* Subtle animated border */
    &::after {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: linear-gradient(45deg, 
        rgba(255, 111, 0, 0.3), 
        rgba(245, 158, 11, 0.2), 
        rgba(234, 88, 12, 0.3), 
        rgba(251, 146, 60, 0.2)
      );
      border-radius: 21px;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::after {
      opacity: 1;
    }

    /* MAINTAIN BACKGROUND FOR LOGO CONTRAST */
    &:hover {
      border-color: rgba(255, 111, 0, 0.4);
      /* Background stays the same for logo readability */
      box-shadow: 
        0 20px 45px rgba(0, 0, 0, 0.3),
        0 0 25px rgba(255, 111, 0, 0.15),
        0 0 0 1px rgba(255, 111, 0, 0.2);
    }
  }
`;

export const TraceButton = styled(ActionButton)`
  && {
    background: linear-gradient(135deg, 
      #FF6F00 0%, 
      #f59e0b 30%, 
      #ea580c 70%, 
      #fb923c 100%
    );
    color: #FFFFFF;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 6px 15px rgba(255, 111, 0, 0.3);

    &:hover {
      background: linear-gradient(135deg, 
        #f59e0b 0%, 
        #FF6F00 30%, 
        #fb923c 70%, 
        #ea580c 100%
      );
      box-shadow: 0 8px 20px rgba(255, 111, 0, 0.4);
      transform: translateY(-3px) scale(1.02);
      border-color: rgba(255, 255, 255, 0.2);
    }

    &:active {
      transform: translateY(-1px) scale(1.01);
    }
  }
`;