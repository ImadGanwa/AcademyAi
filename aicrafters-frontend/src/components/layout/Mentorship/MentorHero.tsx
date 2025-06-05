import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import WinConfidenceImage from '../../../assets/images/win-confidence.png';

const HeroSection = styled.section`
  width: 100%;
  background-color: ${props => props.theme.palette.background.default};
  padding: 60px 0;

  @media (max-width: 768px) {
    padding: 30px 0 40px;
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
    text-align: center !important;
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

const Title = styled(Typography)`
  font-size: 2.5rem !important;
  font-weight: bold !important;
  line-height: 1.2 !important;
  margin-bottom: 24px !important;
  color: #ffffff !important;

  @media (max-width: 768px) {
    font-size: 2rem !important;
    margin-bottom: 16px !important;
  }
`;

const Highlight = styled.span`
  color: ${props => props.theme.palette.secondary.main};
`;

const Description = styled(Typography)`
  font-size: 1.1rem !important;
  color: #ffffff !important;
  margin-bottom: 40px !important;
  line-height: 1.4 !important;
  padding-right: 20px;

  @media (max-width: 768px) {
    padding-right: 0;
    font-size: 1rem !important;
    margin-bottom: 30px !important;
    max-width: 90%;
  }
`;

const StyledImage = styled.img`
  width: 320px;
  height: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileImageWrapper = styled(Box)`
  display: none;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    
    img {
      width: 220px;
      height: auto;
    }
  }
`;

export const MentorHero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HeroSection>
      <HeroContainer maxWidth="lg">
        <ContentWrapper>
          <MobileImageWrapper>
            <img src={WinConfidenceImage} alt="Win Confidence" />
          </MobileImageWrapper>
          <Title variant="h1">
            <Highlight>{t('mentorship.heroTitle.highlight', 'Win') as string}</Highlight>
            {t('mentorship.heroTitle.main', 'Confidence - Find your ideal mentor') as string}
          </Title>
          <Description>
            {t('mentorship.heroDescription', 'Explore trusted experts ready to support your personal and professional growth.') as string}
          </Description>
        </ContentWrapper>
        <StyledImage src={WinConfidenceImage} alt="Win Confidence" />
      </HeroContainer>
    </HeroSection>
  );
}; 