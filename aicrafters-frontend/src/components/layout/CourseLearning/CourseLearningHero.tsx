import React from 'react';
import styled from 'styled-components';
import { Typography, Container, Breadcrumbs, Button } from '@mui/material';
import { RouterLink } from '../../common/RouterLink/RouterLink';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';

const HeroContainer = styled.div`
  width: 100%;
  background-color: ${props => props.theme.palette.primary.dark};
  padding: 60px 24px 120px;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const HeroContent = styled(Container)`
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;

  @media (max-width: 768px) {
    
  }
`;

const StyledBreadcrumbs = styled(Breadcrumbs)`
  && {
    display: flex;
    align-items: center;
    
    .MuiBreadcrumbs-separator {
      color: rgba(255, 255, 255, 0.6);
    }
    
    a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 1rem;
      
      &:hover {
        color: white;
        text-decoration: underline;
      }
    }
  }
`;

const CourseTitle = styled(Typography)`
  && {
    flex: 1;
    max-width: 730px;
    font-size: 2.5rem;
    font-weight: bold;
    margin: 8px 0;
    color: white;

    @media (max-width: 768px) {
      font-size: 2rem;
      max-width: 100%;
    }
  }
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProgressBar = styled.div`
  height: 12px;
  width: 220px;
  background: #ffffff;
  border: 1px solid ${props => props.theme.palette.background.secondary};
  border-radius: 7px;
  overflow: hidden;
  padding: 2px;
  margin-bottom: 6px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Progress = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background:rgb(3, 122, 29);
  border-radius: 6px;
  transition: width 0.3s ease;
  box-shadow: 0px 2px 10px 1px #00d12d;
`;

const ProgressCompleted = styled(Typography)`
  && {
    font-size: 1rem;
    color: white;
  }
`;

const CertificateButton = styled(Button)`
  && {
    background: ${props => props.theme.palette.secondary.main};
    color: white;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 8px;
    text-transform: none;
    font-size: 0.9rem;
    margin-top: 16px;
    width: fit-content;
    
    &:hover {
      background: ${props => props.theme.palette.secondary.dark};
      transform: translateY(-1px);
    }
    
    @media (max-width: 768px) {
      width: 100%;
      padding: 12px 20px;
      font-size: 1rem;
    }
  }
`;

interface CourseLearningHeroProps {
  title: string;
  progress?: number;
  courseId?: string;
}

export const CourseLearningHero: React.FC<CourseLearningHeroProps> = ({ 
  title,
  progress = 50,
  courseId
}) => {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();

  const handleCertificateClick = () => {
    if (courseId) {
      navigate(`/dashboard/user/certificate/${courseId}`);
    }
  };

  return (
    <HeroContainer>
      <HeroContent maxWidth="lg">
        <StyledBreadcrumbs 
          separator={<NavigateNextIcon fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
          aria-label="breadcrumb"
        >
          <RouterLink to="/dashboard/user/learning">
            {t('user.learning.title')}
          </RouterLink>
          <Typography sx={{ color: 'white', fontSize: '1rem' }}>
            {title}
          </Typography>
        </StyledBreadcrumbs>
        <CourseTitle variant="h1">
          {title}
        </CourseTitle>
        <ProgressSection>
          <ProgressBar>
            <Progress $progress={progress} />
          </ProgressBar>
          <ProgressCompleted>
            {Math.round(progress)}% {t('user.learning.completed')}
          </ProgressCompleted>
          {progress === 100 && courseId && (
            <CertificateButton
              variant="contained"
              onClick={handleCertificateClick}
            >
              🏆 {t('user.courseLearning.getCertificate', { defaultValue: 'View Certificate' })}
            </CertificateButton>
          )}
        </ProgressSection>
      </HeroContent>
    </HeroContainer>
  );
}; 