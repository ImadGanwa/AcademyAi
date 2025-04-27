import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DEFAULT_LANGUAGE } from '../../utils/constants';

interface UserRouteGuardProps {
  children: React.ReactNode;
}

export const UserRouteGuard: React.FC<UserRouteGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1] || DEFAULT_LANGUAGE;

  if (!isAuthenticated) {
    // Redirect to login while preserving the attempted URL
    return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
  }

  if (user?.role !== 'user') {
    // If authenticated but not a user, redirect to home
    return <Navigate to={`/${currentLang}`} replace />;
  }

  return <>{children}</>;
}; 