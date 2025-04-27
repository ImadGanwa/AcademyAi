import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { DEFAULT_LANGUAGE } from '../../utils/constants';

interface TrainerRouteGuardProps {
  children: React.ReactNode;
}

export const TrainerRouteGuard: React.FC<TrainerRouteGuardProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const currentLang = location.pathname.split('/')[1] || DEFAULT_LANGUAGE;

  if (user?.role !== 'trainer') {
    return <Navigate to={`/${currentLang}`} replace />;
  }

  return <>{children}</>;
}; 