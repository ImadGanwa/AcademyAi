import React from 'react';
import { Layout } from '../../components/layout/Layout/Layout';
import { Hero } from '../../components/layout/Hero/Hero';
import { CoursesSection } from '../../components/layout/Courses/CoursesSection';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Course } from '../../types/course';
import { Container, Typography, Box, Button } from '@mui/material';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const TracePlusSection = styled(Container)`
  margin-top: 60px;
  margin-bottom: 40px;
  padding: 0 24px;
`;

const SectionHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled(Typography)`
  font-size: 2rem !important;
  font-weight: bold !important;
  color: #000000 !important;
`;

const PromoCodeContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const PromoCode = styled(Box)`
  border: 2px dashed #000;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
`;

const PromoCodeText = styled(Typography)`
  font-weight: bold !important;
  margin-left: 8px !important;
  color: #D35400 !important;
`;

const JoinNowButton = styled(Button)`
  && {
    background-color: #FF9800;
    color: white;
    font-weight: bold;
    padding: 8px 24px;
    
    &:hover {
      background-color: #F57C00;
    }
  }
`;

const ImagesGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageItem = styled(Box)`
  position: relative;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    
    img {
      transform: scale(1.1);
    }
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
`;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n} = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleCourseClick = (courseData: Course) => {
    navigate(`/${i18n.language}/courses/${courseData.id}`, {
      state: { courseData }
    });
  };

  return (
    <Layout title="Home">
      <Hero />
      
      <TracePlusSection maxWidth="lg">
        <SectionHeader>
          <Title variant="h2">Free Access to Trace+</Title>
          {isAuthenticated && (
            <PromoCodeContainer>
              <PromoCode>
                <Typography variant="body1">Promo code : </Typography>
                <PromoCodeText>ADWIN2025</PromoCodeText>
              </PromoCode>
              <JoinNowButton 
                variant="contained"
                onClick={() => window.open('https://trace.plus/en/', '_blank')}
              >
                Join now
              </JoinNowButton>
            </PromoCodeContainer>
          )}
        </SectionHeader>
        
        <ImagesGrid>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/AFD.jpg" alt="AFD" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/For_Girls_in_Science.jpg" alt="For Girls in Science" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/afd1.jpg" alt="AFD 1" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/afd2.jpg" alt="AFD 2" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/afreximbank.jpg" alt="Afreximbank" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/visa.jpg" alt="VISA" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/smart-reporter.jpg" alt="Smart Reporter" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/sacem.jpg" alt="SACEM" />
          </ImageItem>
          <ImageItem onClick={() => window.open('https://trace.plus/en/', '_blank')}>
            <img src="/images/trace/canalplus.jpg" alt="Canal Plus" />
          </ImageItem>
        </ImagesGrid>
      </TracePlusSection>
      
      <CoursesSection onCourseClick={handleCourseClick} />
    </Layout>
  );
}; 