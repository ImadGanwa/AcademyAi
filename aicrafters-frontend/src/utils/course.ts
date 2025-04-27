import { Course } from '../services/coursesService';

export const calculateCourseDuration = (course: Course): number => {
  if (!course.courseContent?.sections) {
    return course.duration || 0;
  }

  let totalMinutes = 0;
  course.courseContent.sections.forEach(section => {
    section.lessons.forEach(lesson => {
      totalMinutes += lesson.duration || 0;
    });
  });

  return totalMinutes;
};

export const formatDuration = (minutes: number): string => {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}; 