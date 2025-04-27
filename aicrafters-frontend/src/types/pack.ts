import { Course } from './course';

export interface PackCourse {
  id: string;
  imageId: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice: number;
}

export interface Pack {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  courses: PackCourse[];
}

export interface CartPopupProps {
  onClose: () => void;
  onGoToCart: () => void;
  courseTitle: string;
  instructorName: string;
  imageId: string;
  price: number;
  courseId: string;
  courseData?: Course;
  packData?: Pack | null;
} 