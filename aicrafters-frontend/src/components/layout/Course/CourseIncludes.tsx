import React from 'react';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ClockIcon } from '../../../assets/icons/Clock.svg';
import { ReactComponent as ArticleIcon } from '../../../assets/icons/Article.svg';
// import { ReactComponent as DownloadIcon } from '../../../assets/icons/Download.svg';
import { ReactComponent as AccessIcon } from '../../../assets/icons/Access.svg';
import { ReactComponent as CertificateIcon } from '../../../assets/icons/Certificate.svg';
import { Title } from '../../common/Typography/Title';

const Section = styled.section`
  background: #ffffff;
  padding: 32px 0;

  @media (max-width: 768px) {
    padding: 0;
    background: transparent;
    text-align: center;
  }
  
  .section-title {
    text-align: left;
    
    @media (max-width: 768px) {
      text-align: center;
    }
  }
`;

const FeaturesContainer = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 768px) {
    gap: 14px;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 12px;
    padding: 16px;
    background: #F8F9FA;
    border-radius: 12px;
    border: 1px solid #E8ECEF;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    background: ${props => props.theme.palette.primary.main};
    border-radius: 8px;
    padding: 8px;
    min-width: 40px;
    height: 40px;
  }
  
  svg {
    width: 18px;
    height: 18px;
    
    @media (max-width: 768px) {
      width: 20px;
      height: 20px;
    }
    
    path {
      stroke: ${props => props.theme.palette.text.title};

      @media (max-width: 768px) {
        stroke: white;
      }
    }
  }
`;

const FeatureText = styled(Typography)`
  font-size: 1rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;

  @media (max-width: 768px) {
    font-size: 1rem !important;
    color: ${props => props.theme.palette.text.title} !important;
    font-weight: 500 !important;
    line-height: 1.4 !important;
  }
`;

interface CourseIncludesProps {
  courseData: {
    courseContent?: {
      sections: Array<{
        lessons: Array<{
          duration?: number;
          type: string;
        }>;
      }>;
    };
  };
}

export const CourseIncludes: React.FC<CourseIncludesProps> = ({ courseData }) => {
  const { t } = useTranslation();

  const { totalHours, totalArticles } = React.useMemo(() => {
    let totalMinutes = 0;
    let articles = 0;

    // Add up all lesson durations
    courseData.courseContent?.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        if (lesson.type !== 'quiz') {
          articles++;
        }
        if (lesson.duration) {
          totalMinutes += lesson.duration;
        }
      });
    });

    // Convert minutes to hours with one decimal place
    const hours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      totalHours: hours,
      totalArticles: articles
    };
  }, [courseData]);

  return (
    <Section>
      <Title variant="h2" className="section-title">
        {t('course.includes.title')}
      </Title>
      <FeaturesContainer>
        <Column>
          <FeatureItem>
            <IconWrapper>
              <ClockIcon />
            </IconWrapper>
            <FeatureText>
              {totalHours} {t('course.includes.features.clock')}
            </FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <IconWrapper>
              <ArticleIcon />
            </IconWrapper>
            <FeatureText>
              {totalArticles} {t('course.includes.features.article')}
            </FeatureText>
          </FeatureItem>
          
          {/* <FeatureItem>
            <IconWrapper>
              <DownloadIcon />
            </IconWrapper>
            <FeatureText>
              {t('course.includes.features.download')}
            </FeatureText>
          </FeatureItem> */}
        </Column>

        <Column>
          <FeatureItem>
            <IconWrapper>
              <AccessIcon />
            </IconWrapper>
            <FeatureText>
              {t('course.includes.features.access')}
            </FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <IconWrapper>
              <CertificateIcon />
            </IconWrapper>
            <FeatureText>
              {t('course.includes.features.certificate')}
            </FeatureText>
          </FeatureItem>
        </Column>
      </FeaturesContainer>
    </Section>
  );
}; 