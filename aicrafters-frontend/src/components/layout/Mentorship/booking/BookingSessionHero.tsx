import React from 'react';
import styled from 'styled-components';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

interface BookingSessionHeroProps {
  mentorName?: string;
}

const HeroSection = styled.section`
  width: 100%;
  background-color: ${props => props.theme.palette.background.default};
  padding: 80px 24px 60px;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 60px 16px 40px;
  }
`;

const HeroContainer = styled(Container)`
  position: relative;
  z-index: 2;
`;

const HeroContent = styled(Box)`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const MainTitle = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: white;
  line-height: 1.2;
  font-family: ${props => props.theme.typography.fontFamily};

  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 16px;
  }
`;

const SubTitle = styled(motion.p)`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 32px;
  font-weight: 400;
  font-family: ${props => props.theme.typography.fontFamily};

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 20px;
  }
`;

const MentorNameHighlight = styled.span`
  color: ${props => props.theme.palette.secondary.main};
  font-weight: 600;
`;

const IconsContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;

  @media (max-width: 768px) {
    gap: 30px;
    margin-top: 32px;
  }

  @media (max-width: 480px) {
    gap: 20px;
    margin-top: 24px;
  }
`;

const IconBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .icon {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    padding: 16px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    .MuiSvgIcon-root {
      font-size: 2rem;
      color: white;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      padding: 14px;
      
      .MuiSvgIcon-root {
        font-size: 1.8rem;
      }
    }

    @media (max-width: 480px) {
      padding: 12px;
      
      .MuiSvgIcon-root {
        font-size: 1.6rem;
      }
    }
  }
`;

const IconLabel = styled(Typography)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  font-family: ${props => props.theme.typography.fontFamily};

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const BackgroundDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="50" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="30" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  z-index: 1;
`;

export const BookingSessionHero: React.FC<BookingSessionHeroProps> = ({ mentorName }) => {
  const { t } = useTranslation();

  const getTitle = (): string => {
    return mentorName 
      ? (t('mentor.booking.session.titleWithName', { 
          defaultValue: 'Book Your Session',
          mentorName 
        }) as string)
      : (t('mentor.booking.session.title', { 
          defaultValue: 'Book Mentorship Session' 
        }) as string);
  };

  const getDescription = (): string => {
    return mentorName 
      ? (t('mentor.booking.session.descriptionWithName', { 
          defaultValue: `Schedule your personalized mentorship session with {{mentorName}}. Choose your preferred time and get expert guidance tailored to your goals.`,
          mentorName 
        }) as string)
      : (t('mentor.booking.session.description', { 
          defaultValue: 'Choose your preferred date and time to schedule a personalized mentorship session. Get expert guidance to accelerate your learning journey.' 
        }) as string);
  };

  return (
    <HeroSection>
      <BackgroundDecoration />
      
      <HeroContainer maxWidth="lg">
        <HeroContent>
          <MainTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {mentorName ? (
              <>
                Book Your Session with{' '}
                <MentorNameHighlight>{mentorName}</MentorNameHighlight>
              </>
            ) : (
              getTitle()
            )}
          </MainTitle>

          <SubTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {getDescription()}
          </SubTitle>

          <IconsContainer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <IconBox>
              <Box className="icon">
                <CalendarTodayIcon />
              </Box>
              <IconLabel>
                {t('mentor.booking.session.selectDate', { defaultValue: 'Select Date & Time' })}
              </IconLabel>
            </IconBox>

            <IconBox>
              <Box className="icon">
                <PersonIcon />
              </Box>
              <IconLabel>
                {t('mentor.booking.session.expertGuidance', { defaultValue: 'Expert Guidance' })}
              </IconLabel>
            </IconBox>
          </IconsContainer>
        </HeroContent>
      </HeroContainer>
    </HeroSection>
  );
}; 