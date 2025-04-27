export interface CourseData {
  id: string;
  title: string;
  imageId: string;
  thumbnail: string;
  instructor: string;
  currentPrice: number;
  originalPrice: number;
  status: 'in progress' | 'saved' | 'completed';
  organizationId?: string | null;
  progress?: {
    percentage: number;
    completedLessons: string[];
    timeSpent?: number;
  };
  completedDate?: string;
  courseContent?: {
    sections: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        type: 'video' | 'article' | 'quiz';
        status: 'not_started' | 'in_progress' | 'completed';
      }>;
    }>;
  };
} 