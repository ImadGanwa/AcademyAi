import React, { useEffect, useState, useCallback } from 'react';
import { Container, CircularProgress, Typography, Box } from '@mui/material';
import styled from 'styled-components';
import { Course } from '../../../types/course';
import axios from 'axios';
import config from '../../../config';
import { useTheme } from '@mui/material';
import { CategorySection } from './CategorySection';
import { useTranslation } from 'react-i18next';

const API_URL = config.API_URL;

const HomeContainer = styled(Container)`
  padding: 0 0 50px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const ErrorWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  padding: 20px;
`;

interface CoursesSectionProps {
  onCourseClick: (courseData: Course) => void;
}

interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  trainer: string;
  instructorId?: string;
  instructorName?: string;
  instructorEmail?: string;
  categories?: string[];
  image: string;
  thumbnail: string;
  price: number;
  originalPrice: number;
  video: string;
  learningPoints: string[];
  createdAt?: string;
  updatedAt?: string;
  status: 'published' | 'draft' | 'review' | 'archived';
  usersCount: number;
  rating: number;
  requirements: string[];
  lessons: any[];
  courseContent: { sections: any[] };
  tag?: {
    name: string;
    colorKey: 'primary' | 'secondary';
  };
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const CoursesSection: React.FC<CoursesSectionProps> = ({ onCourseClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const theme = useTheme();
  const { t } = useTranslation();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have cached data
      const cachedData = localStorage.getItem('cached_courses');
      const cacheTimestamp = localStorage.getItem('courses_cache_timestamp');
      
      if (cachedData && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setCourses(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      const response = await axios.get(`${API_URL}/api/courses/list`, {
        params: {
          limit: 20, // Limit the number of courses fetched
          status: 'published'
        }
      });

      const allCourses = response.data;

      // Transform and filter courses
      const publishedCourses = allCourses
        .filter((course: any) => course.status === 'published')
        .map((course: any) => ({
          id: course.id,
          title: course.title,
          subtitle: course.subtitle || '',
          description: course.description || '',
          trainer: course.instructor?.fullName || 'Unknown Instructor',
          instructorId: course.instructor?._id || '',
          instructorName: course.instructor?.fullName || 'Unknown Instructor',
          instructorEmail: course.instructor?.email || '',
          categories: course.categories || [],
          image: course.thumbnail ? course.thumbnail : '/images/placeholder-course.jpg',
          thumbnail: course.thumbnail ? course.thumbnail : '/images/placeholder-course.jpg',
          price: course.currentPrice || 0,
          originalPrice: course.originalPrice || 0,
          video: course.previewVideo || '',
          tag: course.badge || undefined,
          learningPoints: course.learningPoints || [],
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          status: (course.status || 'published') as 'published' | 'draft' | 'review' | 'archived',
          usersCount: course.usersCount || 0,
          rating: course.rating || 0,
          requirements: course.requirements || [],
          lessons: course.lessons || [],
          courseContent: {
            sections: course.courseContent?.sections || []
          }
        }));

      // Cache the transformed data
      localStorage.setItem('cached_courses', JSON.stringify(publishedCourses));
      localStorage.setItem('courses_cache_timestamp', Date.now().toString());

      setCourses(publishedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(t('home.courses.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) {
    return (
      <LoadingWrapper>
        <CircularProgress />
      </LoadingWrapper>
    );
  }

  if (error) {
    return (
      <ErrorWrapper>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('home.courses.errorMessage')}
        </Typography>
      </ErrorWrapper>
    );
  }

  if (courses.length === 0) {
    return (
      <ErrorWrapper>
        <Typography variant="h6" color="text.secondary">
          {t('home.courses.noCourses')}
        </Typography>
      </ErrorWrapper>
    );
  }

  // Group courses by category
  const coursesByCategory = courses.reduce((acc, course) => {
    const categories = course.categories || ['Uncategorized'];
    categories.forEach(category => {
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(course);
    });
    return acc;
  }, {} as Record<string, CourseData[]>);

  return (
    <HomeContainer maxWidth="lg">
      {Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
        <CategorySection
          key={category}
          categoryId={category}
          title={category}
          courses={categoryCourses}
          onCourseClick={(course) => {
            const apiCourse: Course = {
              id: course.id,
              title: course.title,
              subtitle: course.subtitle,
              description: course.description,
              instructor: {
                _id: course.instructorId || '',
                fullName: course.instructorName || 'Unknown Instructor',
                email: course.instructorEmail || '',
                title: '',
                profileImage: '',
                bio: '',
                rating: 0,
                reviewsCount: 0,
                usersCount: 0,
                coursesCount: 0
              },
              categories: course.categories || [],
              image: course.image,
              video: course.video,
              price: course.price,
              originalPrice: course.originalPrice,
              usersCount: course.usersCount,
              rating: course.rating,
              status: course.status,
              thumbnail: course.thumbnail,
              lessons: course.lessons,
              courseContent: course.courseContent,
              requirements: course.requirements,
              learningPoints: course.learningPoints,
            };
            onCourseClick(apiCourse);
          }}
        />
      ))}
    </HomeContainer>
  );
}; 