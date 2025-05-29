import React from 'react';
import { LearningCard } from '../../../common/Card/LearningCard';
import { CourseData } from '../types';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import config from '../../../../config';

interface CompletedSectionProps {
  courses: CourseData[];
}

export const CompletedSection: React.FC<CompletedSectionProps> = ({ courses }) => {
  const navigate = useLocalizedNavigate();

  const handleDownloadCertificate = (courseId: string) => {
    navigate(`/dashboard/user/certificate/${courseId}`);
  };

  const handleShare = (course: CourseData) => {
    // Create the sharing text with proper formatting
    const shareText = `I just completed ${course.title}!\n\nCheck out my achievement: ${config.FRONTEND_URL}/en/courses/${course.id}\n\n#aicrafters`;
    
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
          onShare={() => handleShare(course)}
          showCertificate={true}
          onButtonClick={() => handleDownloadCertificate(course.id)}
          buttonText="Download Certificate"
        />
      ))}
    </>
  );
}; 