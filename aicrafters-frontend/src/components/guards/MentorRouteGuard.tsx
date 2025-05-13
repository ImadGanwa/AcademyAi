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

  // Role check: Uncommented and active
  if (user?.role !== 'mentor') {
    return <Navigate to={`/${currentLang}`} replace />;
  }

  return <>{children}</>;
}; 