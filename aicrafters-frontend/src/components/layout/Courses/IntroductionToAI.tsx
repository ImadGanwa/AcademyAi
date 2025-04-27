import React from 'react';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CourseCard } from '../../common/Card/CourseCard';

const Section = styled.section`
  width: 100%;
  padding: 70px 0 0;
  background-color: ${props => props.theme.palette.background.paper};
`;

const Title = styled(Typography)`
  font-size: 1.3rem !important;
  font-weight: bold !important;
  margin-bottom: 25px !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface IntroductionToAIProps {
  onCourseClick: (courseData: any) => void;
  courses: any[];
}

export const IntroductionToAI: React.FC<IntroductionToAIProps> = ({ onCourseClick, courses }) => {
  const { t } = useTranslation();

  return (
    <Section>
      <Title variant="h2">
        {t('home.courses.title')}
      </Title>
      <CoursesGrid>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={t(course.title)}
            trainer={t(course.trainer)}
            tag={course.tag}
            image={course.image}
            onClick={() => onCourseClick(course)}
          />
        ))}
      </CoursesGrid>
    </Section>
  );
}; 