import React from 'react';
import { LearningCard } from '../../../common/Card/LearningCard';
import { CourseData } from '../types';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import config from '../../../../config';

interface InProgressSectionProps {
  courses: CourseData[];
}

export const InProgressSection: React.FC<InProgressSectionProps> = ({ courses }) => {
  const navigate = useLocalizedNavigate();

  const handleCardClick = (courseId: string) => {
    navigate(`/dashboard/user/learning/${courseId}`);
  };

  const handleShare = (course: CourseData) => {
    // Create the sharing text with proper formatting
    const shareText = `I'm learning ${course.title} on AiCrafters!\n\nJoin me: ${config.FRONTEND_URL}/en/courses/${course.id}\n\n#aicrafters #learning`;
    
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
      {courses.map(course => (
        <LearningCard
          key={course.id}
          id={course.id}
          title={course.title}
          image={course.imageId}
          instructor={{ fullName: course.instructor }}
          progress={course.progress}
          onShare={() => handleShare(course)}
          showCertificate={false}
          onButtonClick={() => handleCardClick(course.id)}
          buttonText="Continue Learning"
        />
      ))}
    </>
  );
}; 