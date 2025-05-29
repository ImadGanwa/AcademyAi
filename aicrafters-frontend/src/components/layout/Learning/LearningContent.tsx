import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { InProgressSection } from './sections/InProgressSection';
import { SavedSection } from './sections/SavedSection';
import { CompletedSection } from './sections/CompletedSection';
import { CourseData } from './types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import axios from 'axios';
import config from '../../../config';
import { Spinner } from '../../common/Spinner';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const API_URL = config.API_URL;

const Content = styled.main`
  flex: 1;
  min-width: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  background: #FAFBFC;
  border-radius: 10px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    padding: 32px 16px;
    margin: 10px 0;
  }
`;

const EmptyStateText = styled(Typography)`
  && {
    color: ${props => props.theme.palette.text.secondary};
    font-size: 1rem;
    margin-top: 16px;
    max-width: 400px;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin-top: 12px;
    }
  }
`;

interface LearningContentProps {
  filter?: string;
}

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <EmptyStateContainer>
    <EmptyStateText>{message}</EmptyStateText>
  </EmptyStateContainer>
);

export const LearningContent: React.FC<LearningContentProps> = ({ filter = 'inProgress' }) => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/api/courses/user-courses`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      );
    }

    const filteredCourses = courses.filter(course => {
      switch (filter) {
        case 'inProgress':
          return course.status === 'in progress';
        case 'saved':
          return course.status === 'saved';
        case 'completed':
          return course.status === 'completed';
        default:
          return false;
      }
    });

    if (filteredCourses.length === 0) {
      const messages = {
        inProgress: t('user.learning.noInProgress'),
        saved: t('user.learning.noSaved'),
        completed: t('user.learning.noCompleted')
      };
      return <EmptyState message={messages[filter as keyof typeof messages]} />;
    }

    switch (filter) {
      case 'inProgress':
        return <InProgressSection courses={filteredCourses} />;
      case 'saved':
        return <SavedSection courses={filteredCourses} />;
      case 'completed':
        return <CompletedSection courses={filteredCourses} />;
      default:
        return null;
    }
  };

  return <Content>{renderContent()}</Content>;
}; 