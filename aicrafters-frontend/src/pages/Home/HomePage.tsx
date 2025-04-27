import React from 'react';
import { Layout } from '../../components/layout/Layout/Layout';
import { Hero } from '../../components/layout/Hero/Hero';
import { CoursesSection } from '../../components/layout/Courses/CoursesSection';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Course } from '../../types/course';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleCourseClick = (courseData: Course) => {
    navigate(`/${i18n.language}/courses/${courseData.id}`, {
      state: { courseData }
    });
  };

  return (
    <Layout title="Home">
      <Hero />
      <CoursesSection onCourseClick={handleCourseClick} />
    </Layout>
  );
}; 