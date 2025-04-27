export interface LessonContent {
  id: string;
  title: string;
  type: 'lesson';
  contentItems: Array<{
    type: 'text' | 'media';
    content: string;
    vimeoLink?: string;
    duration?: number;
  }>;
  // Legacy properties for backward compatibility
  content?: string;
  vimeoLink?: string;
  preview: boolean;
  duration: number;
}

export interface QuizQuestion {
  _id?: string;
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
  id: string;
  title: string;
  type: 'quiz';
  questions: QuizQuestion[];
  preview: boolean;
}

export interface ContentSection {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  content: LessonContent | QuizContent;
  isCollapsed?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  contents: ContentSection[];
  isCollapsed?: boolean;
}

export interface ContentItem {
  id: string;
  type: 'text' | 'media';
  content: string;
  preview?: string;
  duration?: number; // Duration in minutes for media content
  vimeoLink?: string; // For backward compatibility
}

export interface ContentForm {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  content: ContentItem[];
  isEditing?: boolean;
  originalSectionId?: string;
  sectionId?: string;
  preview?: boolean;
  duration: number;
}

export interface MediaContent {
  file: File;
  preview: string;
}

export interface CourseContentProps {
  onChange: (content: { sections: CourseSection[]; totalDuration: number }) => void;
  coursePromoVideo?: string;
  value?: CourseContentType;
}

export interface CourseContentType {
  sections: CourseSection[];
  totalDuration?: number;
} 