import React, { createContext, useContext, useState } from 'react';

interface CourseStats {
  totalSections: number;
  totalLectures: number;
  totalDuration: string;
  usersEnrolled: number;
  averageRating: number;
  totalReviews: number;
}

interface StatsContextType {
  courseStats: CourseStats;
  updateCourseStats: (stats: Partial<CourseStats>) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalSections: 0,
    totalLectures: 0,
    totalDuration: '0h 0m',
    usersEnrolled: 0,
    averageRating: 0,
    totalReviews: 0
  });

  const updateCourseStats = (stats: Partial<CourseStats>) => {
    setCourseStats(prev => ({
      ...prev,
      ...stats
    }));
  };

  return (
    <StatsContext.Provider value={{ courseStats, updateCourseStats }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}; 