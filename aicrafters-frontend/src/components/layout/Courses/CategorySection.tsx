import React from 'react';
import { Typography, useTheme } from '@mui/material';
import styled from 'styled-components';
import { CourseCard } from '../../common/Card/CourseCard';

const Section = styled.section`
  width: 100%;
  padding: 70px 0 0;
  background-color: ${props => props.theme.palette.background.paper};
`;

const Title = styled(Typography)`
  font-size: 1.8rem !important;
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

interface CategorySectionProps {
  categoryId: string;
  title: string;
  courses: Array<{
    id: string;
    title: string;
    trainer: string;
    requirements?: string[];
    learningPoints?: string[];
    courseContent?: { sections: any[] };
    description?: string;
    categories?: string[];
    image: string;
    subtitle?: string;
    price?: number;
    originalPrice?: number;
    video?: string;
    tag?: {
      name: string;
      colorKey: 'primary' | 'secondary';
    };
  }>;
  onCourseClick: (course: any) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ 
  categoryId,
  title,
  courses,
  onCourseClick
}) => {
  const theme = useTheme();

  return (
    <Section>
      <Title variant="h2">
        {title}
      </Title>
      <CoursesGrid>
        {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              trainer={course.trainer || ''}
              tag={course.tag ? {
                name: course.tag.name,
                color: theme.palette[course.tag.colorKey].main
              } : undefined}
              image={course.image}
              onClick={() => onCourseClick(course)}
            />
        ))}
      </CoursesGrid>
    </Section>
  );
}; 