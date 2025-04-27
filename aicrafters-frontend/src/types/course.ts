export interface VideoContent {
  videoUrl: string;
}

export interface ArticleContent {
  html: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  context?: string;
  isMultipleChoice: boolean;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export interface QuizContent {
  questions: QuizQuestion[];
}

export interface LessonContentItem {
  type: 'text' | 'video';
  content: string;
}

export interface LessonContent {
  contentItems: LessonContentItem[];
  questions?: QuizQuestion[];
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  type: 'video' | 'article' | 'quiz';
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number;
  content: LessonContent;
}

export interface Section {
  id: string;
  order: number;
  title: string;
  items: Lesson[];
}

export interface CourseContent {
  sections: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      type: 'video' | 'text' | 'quiz';
      duration?: number;
      preview: boolean;
      content?: string;
    }>;
  }>;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  instructor: {
    _id: string;
    fullName: string;
    email: string;
    title: string;
    profileImage: string;
    bio: string;
    rating: number;
    reviewsCount: number;
    usersCount: number;
    coursesCount: number;
  };
  categories: string[];
  image: string;
  video: string;
  pack?: string;
  price: number;
  originalPrice: number;
  usersCount: number;
  rating: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  thumbnail: string;
  duration?: number;
  lessons: Array<{
    id: string;
    title: string;
    type: 'lesson' | 'quiz';
    duration?: number;
    preview: boolean;
    content?: string;
    contentItems?: Array<{
      type: 'text' | 'media';
      content: string;
      vimeoLink?: string;
      duration?: number;
    }>;
  }>;
  courseContent?: {
    sections: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        type: 'lesson' | 'quiz';
        duration?: number;
        preview: boolean;
        content?: string;
        contentItems?: Array<{
          type: 'text' | 'media';
          content: string;
          vimeoLink?: string;
          duration?: number;
        }>;
      }>;
    }>;
  };
  requirements: string[];
  learningPoints: string[];
}
