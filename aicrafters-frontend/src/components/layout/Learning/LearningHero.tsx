import React from 'react';
import styled from 'styled-components';
import { Box, Container, Typography, Button } from '@mui/material';
import { ReactComponent as HeroBg } from '../../../assets/images/HeroBg.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HeroSection = styled.section`
  width: 100%;
  background-color: ${props => props.theme.palette.background.default};
  padding: 60px 24px;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const BackgroundImage = styled(HeroBg)`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  width: auto;
  pointer-events: none;

  @media (max-width: 768px) {
    opacity: 0.05;
  }
`;

const HeroContainer = styled(Container)`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 60px !important;

  @media (max-width: 768px) {
    flex-direction: column !important;
    gap: 32px !important;
  }
`;

const Title = styled(Typography)`
  && {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 16px;
    color: white;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
`;

const Description = styled(Typography)`
  && {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    max-width: 600px;
  }
`;

const ContentWrapper = styled(Box)`
  flex: 1;
  max-width: 600px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const AllCoursesButton = styled(Button)`
  && {
    background: #D710C1;
    color: white;
    padding: 12px 24px;
    margin-top: 24px;
    font-weight: 600;
    
    &:hover {
      background: #b0009c;
    }
  }
`;

export const LearningHero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleAllCoursesClick = () => {
    const currentLang = i18n.language;
    navigate(`/${currentLang}/`, { replace: true });
  };

  return (
    <HeroSection>
      <BackgroundImage />
      <HeroContainer maxWidth="lg">
        <ContentWrapper>
          <Title variant="h1">
            {t('user.learning.title')}
          </Title>
          <Description>
            {t('user.learning.description')}
          </Description>
          <AllCoursesButton 
            variant="contained"
            onClick={handleAllCoursesClick}
          >
            {t('user.learning.allCourses')}
          </AllCoursesButton>
        </ContentWrapper>
      </HeroContainer>
    </HeroSection>
  );
}; 