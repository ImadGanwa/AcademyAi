import React from 'react';
import { LearningCard } from '../../../common/Card/LearningCard';
import { CourseData } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';

interface SavedSectionProps {
  courses: CourseData[];
}

export const SavedSection: React.FC<SavedSectionProps> = ({ courses }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useLocalizedNavigate();

  const handlePreviewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleShare = (course: CourseData) => {
    // Create the sharing text with proper formatting
    const shareText = `Check out this amazing course on AiCrafters: ${course.title}\n\nJoin me: https://aicrafters.aicademy.com/en/courses/${course.id}\n\n#aicrafters #learning`;
    
    // Use LinkedIn's feed sharing URL
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;

    // Open in a new window
    window.open(
      linkedinUrl,
      '_blank',
      'width=600,height=600,left=' + (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 300)
    );
  };

  return (
    <>
      {courses.map(course => {
        // Check if course is already purchased
        const isPurchased = user?.courses?.some(c => 
          c.courseId === course.id && (c.status === 'in progress' || c.status === 'completed')
        );

        if (isPurchased) {
          return null; // Don't show purchased courses in saved section
        }

        const imageUrl = course.imageId || '/images/placeholder-course.jpg';

        return (
          <LearningCard
            key={course.id}
            id={course.id}
            title={course.title}
            image={imageUrl}
            instructor={{ fullName: course.instructor }}
            onShare={() => handleShare(course)}
            onMore={() => {}}
            showCertificate={false}
            isSaved={true}
            previewButtonText="Preview Course"
            onPreviewClick={() => handlePreviewCourse(course.id)}
          />
        );
      })}
    </>
  );
}; 