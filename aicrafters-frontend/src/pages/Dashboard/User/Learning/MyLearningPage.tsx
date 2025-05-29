import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Layout } from '../../../../components/layout/Layout/Layout';
import { useLanguageRoute } from '../../../../hooks/useLanguageRoute';
import { LearningHero } from '../../../../components/layout/Learning/LearningHero';
import { LearningSidebar } from '../../../../components/layout/Learning/LearningSidebar';
import { LearningContent } from '../../../../components/layout/Learning/LearningContent';
import { Container } from '@mui/material';
import axios from 'axios';
import config from '../../../../config';
import { CourseData } from '../../../../components/layout/Learning/types';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.palette.background.paper};
`;

const ContentWrapper = styled(Container)`
  display: flex !important;
  gap: 24px;
  padding: 32px 24px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
`;

export const MyLearningPage: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState('inProgress');
  const [courseCounts, setCourseCounts] = useState({
    inProgress: 0,
    saved: 0,
    completed: 0
  });

  useLanguageRoute();

  useEffect(() => {
    const fetchCourseCounts = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/courses/user-courses`);
        const courses: CourseData[] = response.data;
        
        const counts = {
          inProgress: courses.filter((course: CourseData) => course.status === 'in progress').length,
          saved: courses.filter((course: CourseData) => course.status === 'saved').length,
          completed: courses.filter((course: CourseData) => course.status === 'completed').length
        };
        
        setCourseCounts(counts);
      } catch (error) {
        console.error('Error fetching course counts:', error);
      }
    };

    fetchCourseCounts();
  }, []);

  return (
    <Layout title="User Dashboard">
      <PageWrapper>
        <LearningHero />
        <ContentWrapper>
          <LearningSidebar
            onFilterChange={setCurrentFilter}
            courseCounts={courseCounts}
          />
          <LearningContent filter={currentFilter} />
        </ContentWrapper>
      </PageWrapper>
    </Layout>
  );
}; 