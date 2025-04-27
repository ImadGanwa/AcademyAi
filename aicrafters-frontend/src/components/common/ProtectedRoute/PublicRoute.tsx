import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface PublicRouteProps {
  children: React.ReactNode;
  allowRedirect?: boolean;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children, allowRedirect = true }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1];

  // If redirect is not allowed or user is not authenticated, show the children
  if (!allowRedirect || !isAuthenticated || !user) {
    return <>{children}</>;
  }

  // Only redirect if user is authenticated and redirect is allowed
  let dashboardPath;
  switch (user.role) {
    case 'admin':
      dashboardPath = `/${currentLang}/dashboard/admin`;
      break;
    case 'trainer':
      dashboardPath = `/${currentLang}/dashboard/trainer`;
      break;
    default:
      dashboardPath = `/${currentLang}/dashboard/user/learning`;
  }
    
  return <Navigate to={dashboardPath} replace />;
}; 