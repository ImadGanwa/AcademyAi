import { Types } from 'mongoose';

// Content item types
export interface ContentItem {
  _id?: Types.ObjectId;
  type: 'text' | 'media';
  content: string;
  duration?: number;  // For media items
}

// Lesson types
export interface LessonContent {
  id: string;
  title: string;
  type: 'lesson';
  contentItems: Array<{
    type: 'text' | 'media';
    content: string;
    duration?: number;
  }>;
  preview: boolean;
  duration: number;
}

export interface QuizQuestion {
  _id?: Types.ObjectId;
  question: string;
  context: string;
  isMultipleChoice: boolean;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export interface QuizContent {
  _id?: Types.ObjectId;
  id: string;
  title: string;
  type: 'quiz';
  questions: QuizQuestion[];
  preview?: boolean;
}

// Section types
export interface ContentSection {
  id: string;
  title: string;
  type: 'lesson' | 'quiz';
  content: LessonContent | QuizContent;
  isCollapsed?: boolean;
}

export interface CourseSection {
  _id?: Types.ObjectId;
  title: string;
  contents: ContentSection[];
}

// Course type
export interface CourseContent {
  sections: CourseSection[];
}

export interface TransformedLesson {
  id: string;
  title: string;
  type: 'lesson' | 'quiz';
  preview: boolean;
  duration: number;
  contentItems: Array<{
    type: 'text' | 'media';
    content: string;
    duration?: number;
  }>;
  questions?: QuizQuestion[];
}

export interface TransformedCourse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  instructor: Types.ObjectId;
  thumbnail: string;
  previewVideo?: string;
  originalPrice: number;
  currentPrice: number;
  categories: string[];
  learningPoints: string[];
  requirements: string[];
  status: 'draft' | 'review' | 'published' | 'archived';
  rating: number;
  usersCount: number;
  createdAt: Date;
  updatedAt: Date;
  courseContent?: {
    sections: Array<{
      id: string;
      title: string;
      lessons: TransformedLesson[];
    }>;
  };
}
