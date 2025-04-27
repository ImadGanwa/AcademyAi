export interface CourseTag {
  name: string;
  colorKey: 'primary' | 'secondary';
  color?: string;
}

export interface Course {
  id: string;
  title: string;
  trainer: string;
  tag?: CourseTag;
  image: string;
}

export interface CourseCategory {
  id: string;
  title: string;
  courses: Course[];
} 