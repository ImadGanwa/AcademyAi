import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';
import { Title } from '../../common/Typography/Title';
import { useTranslation } from 'react-i18next';

const ContentSection = styled.section`
  background: #ffffff;
  padding: 32px 0;
  
  @media (max-width: 768px) {
    text-align: center;
  }
  
  .section-title {
    text-align: left;
    
    @media (max-width: 768px) {
      text-align: center;
    }
  }
`;

const DescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SubTitle = styled(Typography)`
  color: ${props => props.theme.palette.text.title};
  font-size: 1rem !important;
  font-weight: 600 !important;
  margin-bottom: 8px !important;
`;

const Description = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem !important;
  line-height: 1.6 !important;
`;

const DescriptionNote = styled(Typography)`
  color: ${props => props.theme.palette.text.title};
  font-size: 1rem !important;
  line-height: 1.6 !important;
  font-weight: bold !important;
`;

interface CourseDescriptionProps {
  description: string;
  subtitle: string;
}

export const CourseDescription: React.FC<CourseDescriptionProps> = ({ description, subtitle }) => {
  const { t } = useTranslation();

  return (
    <ContentSection>
      <Title variant="h2" className="section-title" style={{ marginBottom: '24px' }}>
        {t('course.description.title')}
      </Title>
      <DescriptionWrapper>
        <div>
          <SubTitle>
            {subtitle}
          </SubTitle>
          <Description dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </DescriptionWrapper>
    </ContentSection>
  );
}; 