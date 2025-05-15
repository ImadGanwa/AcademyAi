import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DEFAULT_LANGUAGE } from '../../utils/constants';

interface MentorRouteGuardProps {
  children: React.ReactNode;
}

export const MentorRouteGuard: React.FC<MentorRouteGuardProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1] || DEFAULT_LANGUAGE;

  // Role check: Make sure user is a mentor
  if (user?.role !== 'mentor') {
    return <Navigate to={`/${currentLang}`} replace />;
  }

  // Additional check: Make sure user has necessary data
  // We use this approach to avoid TypeScript errors with mentorProfile
  const userObject = user as any;
  if (!userObject.mentorProfile) {
    console.warn('User has mentor role but no mentor profile');
    // You might want to redirect to a profile completion page instead
  }

  return <>{children}</>;
}; 