import React, { useState, useEffect } from 'react'; // Added useEffect for potential future use
import styled, { keyframes, css } from 'styled-components';
import { Box, IconButton, Zoom } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import FloatingMentorChatButton from './FloatingMentorChatButton';
import AdwinaMentor from './AdwinaMentor';
import LoginPrompt from './LoginPrompt';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

// Assuming useAIMentorFeatures.ts is in a path like '../../hooks/useAIMentorFeatures'
// Adjust the path based on your actual file structure.
import { resetRefreshCount } from '../../../hooks/useAIMentorFeatures'; 

// ... (rest of the styled components and imports remain the same) ...

// Animations (assuming these are already defined as in your provided code)
const fadeIn = keyframes` from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes` from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;

// Floating button wrapper with mobile responsiveness
const FloatingButtonWrapper = styled(Box)<{ isVisible: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(20px)'};
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
  
  &:hover {
    transform: ${props => props.isVisible ? 'translateY(-2px)' : 'translateY(20px)'};
  }

  /* Mobile responsiveness - keep button on right side */
  @media (max-width: 768px) {
    right: 16px;
    bottom: 20px;
  }
`;

const NonExpandedChatWrapper = styled(Box)`
  position: fixed;
  bottom: 24px; 
  right: 24px;
  z-index: 2000; 
  width: 400px;
  height: 550px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${css`${slideUp}`} 0.3s forwards;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
`;

const ExpandedChatWrapper = styled(Box)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  z-index: 10001; 
  width: 800px; 
  height: 700px; 
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${css`${fadeIn}`} 0.3s forwards;
`;

const BackdropOverlay = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000; 
  animation: ${css`${fadeIn}`} 0.3s forwards;
  cursor: pointer;
`;

const ExpandButtonContainer = styled(Box)`
  position: absolute;
  top: 8px;
  right: 48px; 
  z-index: 10;

  /* Hide expand button on mobile */
  @media (max-width: 768px) {
    display: none;
  }
`;

const ExpandButton = styled(IconButton)`
  background-color: rgba(255, 255, 255, 0.8);
  color: #757575;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #ffffff;
    color: #000000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UniversalChatWrapper = styled(Box)<{ isOpen: boolean; isExpanded: boolean }>`
  position: fixed;
  z-index: ${props => (props.isExpanded ? 10001 : 2000)};
  width: ${props => (props.isExpanded ? '800px' : '400px')};
  height: ${props => (props.isExpanded ? '700px' : '550px')};
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: ${props =>
    props.isExpanded ? '0 10px 30px rgba(0,0,0,0.2)' : '0 5px 20px rgba(0,0,0,0.1)'};
  display: ${props => (props.isOpen ? 'flex' : 'none')}; // Control visibility here
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s, visibility 0.3s; // Added opacity/visibility
  
  // Apply animation based on state
  ${props =>
    props.isOpen &&
    (props.isExpanded
      ? css`
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: ${fadeIn} 0.3s forwards;
        `
      : css`
          bottom: 24px;
          right: 24px;
          animation: ${slideUp} 0.3s forwards;
          &:hover {
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
        `)}

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    /* On mobile, ignore expand state and use full screen approach */
    width: 95vw !important;
    height: 85vh !important;
    max-width: 500px;
    max-height: 700px;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) !important;
    border-radius: 16px;
    
    ${props =>
      props.isOpen &&
      css`
        animation: ${fadeIn} 0.3s forwards;
      `}
  }

  /* Very small mobile screens */
  @media (max-width: 480px) {
    width: 98vw !important;
    height: 90vh !important;
    border-radius: 12px;
  }
`;

interface MentorChatInterfaceProps {
  mentorId?: string;
}

const MentorChatInterface: React.FC<MentorChatInterfaceProps> = ({ mentorId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const stableOnCloseChat = React.useCallback(() => {
    resetRefreshCount();
    setIsOpen(false);
    setIsExpanded(false); // Ensure isExpanded is also reset when closing
  }, []); // Dependencies if any external state is used inside

  const toggleChat = () => {
    resetRefreshCount();
    setIsOpen(prevIsOpen => {
      const nextIsOpen = !prevIsOpen;
      if (!nextIsOpen && isExpanded) { // If closing and was expanded
        setIsExpanded(false);
      }
      return nextIsOpen;
    });
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetRefreshCount();
    setIsExpanded(prev => !prev);
  };

  const handleBackdropClick = () => {
    resetRefreshCount();
    setIsExpanded(false); // Only minimize on backdrop click, don't close
  };
  
  // Memoize the core chat component to ensure it doesn't re-render unnecessarily
  // if its props (mentorId, user.id, stableOnCloseChat) are stable.
  // This primarily helps performance but is good practice here.
  const coreChatComponent = React.useMemo(() => {
    return isAuthenticated && user ? (
      <AdwinaMentor 
        mentorId={mentorId}
        userId={user.id}
        onClose={stableOnCloseChat}
      />
    ) : (
      <LoginPrompt onClose={stableOnCloseChat} />
    );
  }, [isAuthenticated, user, mentorId, stableOnCloseChat]);

  return (
    <>
      {isOpen && isExpanded && <BackdropOverlay onClick={handleBackdropClick} />}
      
      <FloatingButtonWrapper isVisible={!isOpen}>
        <FloatingMentorChatButton onClick={toggleChat} />
      </FloatingButtonWrapper>

      <UniversalChatWrapper isOpen={isOpen} isExpanded={isExpanded}>
        <ExpandButtonContainer>
          <Zoom in={true}>
            <ExpandButton 
              onClick={toggleExpand}
              size="small" 
              aria-label={isExpanded ? "minimize chat" : "expand chat"}
            >
              {isExpanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
            </ExpandButton>
          </Zoom>
        </ExpandButtonContainer>
        {coreChatComponent}
      </UniversalChatWrapper>
    </>
  );
};

export default MentorChatInterface;