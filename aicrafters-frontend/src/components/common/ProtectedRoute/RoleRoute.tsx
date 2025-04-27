import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1];

  useEffect(() => {
    
  }, [user, isAuthenticated, allowedRoles, currentLang, location]);

  if (!isAuthenticated) {
    return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${currentLang}`} replace />;
  }

  return <>{children}</>;
}; 