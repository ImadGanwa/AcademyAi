import React from 'react';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from '../../common/Logo/LogoIcon';
import { Title } from '../../common/Typography/Title';

const ContentSection = styled.section`
  width: 100%;
  background-color: #ffffff;
`;

const LearningSection = styled.div`
  background: #ffffff;
  border-radius: 12px;
`;

const LearningTitle = styled(Title)`
  && {
    background-color: #FAFBFC;
    border: 1px solid #D6D9DD;
    border-radius: 12px 12px 0px 0px;
    padding: 1rem;
    border-bottom: none;
    margin-bottom: 0 !important;
  }
`;

const LearningColumns = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 0; // Prevent flex items from overflowing
`;

const LearningItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WhatToLearn = styled.div`
  border: 1px solid #D6D9DD;
  border-radius: 0px 0px 12px 12px;
  padding: 1.5rem;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
`;

const ItemText = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: .9rem;
  line-height: 1.4;
`;

interface LearningPoint {
  key: string;
  defaultValue: string;
}

interface CourseContentProps {
  learningPoints?: string[];
}

export const CourseContent: React.FC<CourseContentProps> = ({ learningPoints = [] }) => {
  const { t } = useTranslation();

  // Transform the string array into LearningPoint objects
  const points: LearningPoint[] = learningPoints.map((point, index) => ({
    key: `course.content.learning.point.${index}`,
    defaultValue: point
  }));

  // Split points into two columns
  const midPoint = Math.ceil(points.length / 2);
  const firstColumnPoints = points.slice(0, midPoint);
  const secondColumnPoints = points.slice(midPoint);

  return (
    <ContentSection>
      <LearningSection>
        <LearningTitle variant="h2">
          {t('course.content.learning.title')}
        </LearningTitle>
        <WhatToLearn>
          <LearningColumns>
            <Column>
              {firstColumnPoints.map((point, index) => (
                <LearningItem key={index}>
                  <IconWrapper>
                    <LogoIcon size={18} />
                  </IconWrapper>
                  <ItemText>
                    {point.defaultValue}
                  </ItemText>
                </LearningItem>
              ))}
            </Column>
            <Column>
              {secondColumnPoints.map((point, index) => (
                <LearningItem key={index}>
                  <IconWrapper>
                    <LogoIcon size={18} />
                  </IconWrapper>
                  <ItemText>
                    {point.defaultValue}
                  </ItemText>
                </LearningItem>
              ))}
            </Column>
          </LearningColumns>
        </WhatToLearn>
      </LearningSection>
    </ContentSection>
  );
}; 