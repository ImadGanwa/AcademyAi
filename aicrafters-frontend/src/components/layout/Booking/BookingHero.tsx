import React from 'react';
import styled from 'styled-components';
import { Box, Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import winConfidenceLogo from '../../../assets/images/win-confidence.png';

const HeroSection = styled.section`
  width: 100%;
  background-color: ${props => props.theme.palette.background.default};
  padding: 60px 24px;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 30px 16px;
  }
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
`;

const FloatingElement2 = styled(motion.div)`
  position: absolute;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
`;

const HeroContainer = styled(Container)`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 60px !important;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    flex-direction: column !important;
    gap: 32px !important;
    text-align: center !important;
  }
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: white;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 12px;
  }
`;

const Description = styled(motion.p)`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  line-height: 1.6;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    margin: 0 auto;
  }
`;

const ContentWrapper = styled(Box)`
  flex: 1;
  max-width: 600px;

  @media (max-width: 768px) {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButtonsWrapper = styled(motion.div)`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    width: 100%;
  }
`;

const AllBookingsButton = styled(Button)`
  && {
    background: #D710C1;
    color: white;
    padding: 12px 24px;
    font-weight: 600;
    border-radius: 8px;
    
    &:hover {
      background: #b0009c;
    }

    @media (max-width: 768px) {
      width: 100%;
      max-width: 280px;
    }
  }
`;

const BackgroundIcon = styled(motion.div)`
  position: absolute;
  right: 13%;
  top: -10%;
  transform: translateY(-50%);
  width: 400px;
  height: 400px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
  }

  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
    right: 50%;
    transform: translate(50%, -50%);
    display: none;
  }
`;

export const BookingHero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleFindMentorClick = () => {
    const currentLang = i18n.language;
    navigate(`/${currentLang}/mentorship`);
  };

  return (
    <HeroSection>
      {/* Floating background elements */}
      

      <BackgroundIcon
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <img src={winConfidenceLogo} alt="Booking Hero Logo" />
      </BackgroundIcon>

      <HeroContainer maxWidth="lg">
        <ContentWrapper>
          <Title
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t('booking.hero.title', 'My Mentorship Sessions') as string}
          </Title>
          <Description
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('booking.hero.description', 'Manage your mentorship sessions, view upcoming appointments, and track your learning journey with expert mentors.') as string}
          </Description>
          <ActionButtonsWrapper
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AllBookingsButton 
              variant="contained"
              startIcon={<PersonSearchIcon />}
              onClick={handleFindMentorClick}
            >
              {t('booking.hero.findMentor', 'Find a Mentor') as string}
            </AllBookingsButton>
          </ActionButtonsWrapper>
        </ContentWrapper>
      </HeroContainer>
    </HeroSection>
  );
}; 