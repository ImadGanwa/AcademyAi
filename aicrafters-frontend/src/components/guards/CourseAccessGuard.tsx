import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface CourseAccessGuardProps {
  children: React.ReactNode;
}

export const CourseAccessGuard: React.FC<CourseAccessGuardProps> = ({ children }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const userCourse = user.courses?.find(course => 
    course.courseId === courseId && (course.status === 'in progress' || course.status === 'completed')
  );

  if (!userCourse) {
    return <Navigate to={`/course/${courseId}`} />;
  }

  return <>{children}</>;
}; 