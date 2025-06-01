import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AdwinSection = styled(Container)`
  margin-top: 60px;
  margin-bottom: 40px;
  padding: 0 24px;
`;

const SectionHeader = styled(Box)`
  margin-bottom: 30px;
`;

const Title = styled(Typography)`
  font-size: 1.8rem !important;
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin-bottom: 25px !important;
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CourseCard = styled(Box)`
  position: relative;
  width: 100%;
  height: 390px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: #FAFBFC;
  box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.0);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const CardImage = styled.img`
  height: 290px;
  width: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
  flex-shrink: 0;
`;

const ContentWrapper = styled(Box)`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CourseTitle = styled(Typography)`
  font-weight: bold;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: auto !important;
  font-size: 1rem !important;
  color: ${props => props.theme.palette.text.title} !important;
  line-height: 1.2 !important;
`;

const CourseTrainer = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary} !important;
  font-size: 0.85rem !important;
  line-height: 1 !important;
  margin-top: 12px !important;
`;

interface AdwinCourseSectionProps {
  onCourseClick?: () => void;
}

const adwinCourses = [
  {
    id: '67f92f8db05f25155fe50ca1',
    title: 'Types - Adwin Course',
    trainer: 'Adwin Team',
    image: '/images/adwin/Types.png'
  },
  {
    id: '67f92f8db05f25155fe50ca1',
    title: 'HandyMan - Adwin Course',
    trainer: 'Adwin Team',
    image: '/images/adwin/HandyMan.png'
  },
  {
    id: '67f92f8db05f25155fe50ca1',
    title: 'Meet CynTHIA - Adwin Course',
    trainer: 'Adwin Team',
    image: '/images/adwin/MeetCynTHIA.png'
  },
  {
    id: '67f92f8db05f25155fe50ca1',
    title: 'Cultural Intrepreneurship - Adwin Course',
    trainer: 'Adwin Team',
    image: '/images/adwin/cultural Intrepreneurship.png'
  }
];

export const AdwinCourseSection: React.FC<AdwinCourseSectionProps> = ({ onCourseClick }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleCourseClick = () => {
    if (onCourseClick) {
      onCourseClick();
    }
    navigate(`/${i18n.language}/courses/67f92f8db05f25155fe50ca1`);
  };

  return (
    <AdwinSection maxWidth="lg">
      <SectionHeader>
        <Title variant="h2">Adwin Course</Title>
      </SectionHeader>
      
      <CoursesGrid>
        {adwinCourses.map((course, index) => (
          <CourseCard key={index} onClick={handleCourseClick}>
            <CardImage 
              src={course.image} 
              alt={course.title}
            />
            <ContentWrapper>
              <CourseTitle variant="h6">
                {course.title}
              </CourseTitle>
              <CourseTrainer>
                {course.trainer}
              </CourseTrainer>
            </ContentWrapper>
          </CourseCard>
        ))}
      </CoursesGrid>
    </AdwinSection>
  );
}; 