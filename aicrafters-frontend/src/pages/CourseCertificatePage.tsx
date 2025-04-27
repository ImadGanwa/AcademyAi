import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CertificateShare } from '../components/layout/Certificate/CertificateShare';
import { RatingDialog } from '../components/common/RatingDialog/RatingDialog';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Box, CircularProgress } from '@mui/material';

interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  categories: string[];
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
  }>;
}

interface UserCourse {
  id: string;
  title: string;
  status: string;
  progress?: {
    percentage: number;
    completedLessons: string[];
  };
}

export const CourseCertificatePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchCourseData = async () => {
    if (!courseId || !user?.id) {
      console.error('Missing courseId or userId');
      setLoading(false);
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.error('API URL is not defined');
      setLoading(false);
      return;
    }

    try {
      
      // First, fetch the course details
      const courseResponse = await fetch(
        `${apiUrl}/api/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!courseResponse.ok) {
        throw new Error(`Failed to fetch course data: ${courseResponse.statusText}`);
      }

      const courseData = await courseResponse.json();
      setCourseData(courseData);

      // Then check user's course status
      const userCoursesResponse = await fetch(
        `${apiUrl}/api/users/courses`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!userCoursesResponse.ok) {
        throw new Error(`Failed to fetch user courses: ${userCoursesResponse.statusText}`);
      }

      const userCourses = await userCoursesResponse.json();

      const currentCourse = userCourses.find((course: UserCourse) => course.id === courseId);

      if (!currentCourse) {
        return;
      }

      // Check if the course is completed and not rated
      if (currentCourse.status === 'completed') {
        const hasRated = courseData.reviews?.some(
          (review: { user: string }) => review.user === user.id
        );

        setShowRating(!hasRated);
      } else {
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, user?.id]);

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!courseId || !user?.id) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/courses/${courseId}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to submit rating: ${response.statusText}`);
      }

      setShowRating(false);
      await fetchCourseData();
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!courseData) {
    return null;
  }

  return (
    <>
      <CertificateShare
        visibility="Public"
        courseId={courseId || ''}
        courseTitle={courseData.title}
        courseSubtitle={courseData.subtitle}
        categories={courseData.categories}
      />
      <RatingDialog
        open={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
        courseTitle={courseData.title}
      />
    </>
  );
}; 