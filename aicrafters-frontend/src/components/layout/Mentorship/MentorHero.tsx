import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import styled from 'styled-components';
// import { useTranslation } from 'react-i18next';

const HeroWrapper = styled.div`
  background-color: ${props => props.theme.palette.background.default};
  width: 100%;
`;

const HeroSection = styled.section`
  width: 100%;
  padding: 80px 0 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  position: relative;

  @media (max-width: 768px) {
    padding: 60px 0 100px;
  }
`;

const HeroContainer = styled(Container)`
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
  max-width: 1200px !important;
`;

const TitleWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 6px;
  width: 642px;
  max-width: 100%;
  margin-bottom: 19px;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0 20px;
  }
`;

const Title = styled(Typography)`
  font-size: 4.5rem !important;
  font-weight: 500 !important;
  line-height: 1.2 !important;
  color: #ffffff !important;
  text-align: center;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2.8rem !important;
  }
`;

const Highlight = styled.span`
  color: ${props => props.theme.palette.primary.main};
`;

const Description = styled(Typography)`
  font-size: 1.5rem !important;
  color: #ffffff !important;
  line-height: 1.4 !important;
  max-width: 800px;
  text-align: center;
  margin: 0 auto;
  opacity: 0.9;
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 1.2rem !important;
    padding: 0 20px;
  }
`;

export const MentorHero: React.FC = () => {
  // const { t } = useTranslation();

  return (
    <HeroWrapper>
      <HeroSection>
        <HeroContainer maxWidth="lg">
          <TitleWrapper>
            <Title variant="h1">
              Find Your <Highlight>Ideal</Highlight> Mentor
            </Title>
          </TitleWrapper>
          <Description>
            Explore trusted experts ready to support your personal and professional growth.
          </Description>
        </HeroContainer>
      </HeroSection>
    </HeroWrapper>
  );
}; 