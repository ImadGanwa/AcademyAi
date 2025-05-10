import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, IconButton, Button } from '@mui/material';
import { VideoContent } from './content/VideoContent';
import { ArticleContent } from './content/ArticleContent';
import { QuizContent } from './content/QuizContent';
import { ReactComponent as ExpandIcon } from '../../../assets/icons/Expand.svg';
import { LessonContent } from '../../../types/course';
import { useTranslation } from 'react-i18next';

const ContentContainer = styled.main`
  flex: 1;
  min-width: 0;
  background: white;
  border-radius: 0 10px 10px 0;
  border: 1px solid ${props => props.theme.palette.divider};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    border-radius: 10px;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 4px;
  background-color: #FAFBFC;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  border-radius: 0px 10px 0 0;
  display: flex;
  align-items: baseline;
  gap: 16px;

  @media (max-width: 768px) {
    position: sticky;
    top: 64px;
    z-index: 100;
    border-radius: 10px 10px 0 0;
    margin-bottom: 0;
    background-color: rgba(250, 251, 252, 0.95);
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const MobileMenuButton = styled(IconButton)`
  && {
    display: none;
    @media (max-width: 768px) {
      background: #f0f0f0;
        height: 40px;
        width: 40px;
        padding: 2px;
        display: flex;
        border-radius: 8px;
        align-self: center;
    }
  }
`;

const LessonTitle = styled(Typography)`
  && {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.palette.text.title};
  }
`;

const CompleteButton = styled(Button)`
  && {
    margin: 20px;
    padding: 10px 20px;
    align-self: flex-end;
    background-color: ${props => props.theme.palette.success.main};
    color: white;
    &:hover {
      background-color: ${props => props.theme.palette.success.dark};
    }
    box-shadow: none;
  }
`;

interface CourseLearningContentProps {
  lessonType: 'video' | 'article' | 'quiz';
  title: string;
  content: LessonContent;
  totalLessons: number;
  showLessonCount: boolean;
  status: 'completed' | 'in_progress' | 'not_started';
  onLessonComplete: () => void;
  onQuizProgress: (progress: number) => void;
  onMobileMenuClick: () => void;
  sectionId: string;
  lessonId: string;
}

export const CourseLearningContent = React.forwardRef<HTMLDivElement, CourseLearningContentProps>(({
  lessonType,
  title,
  content,
  totalLessons,
  showLessonCount,
  status,
  onLessonComplete,
  onQuizProgress,
  onMobileMenuClick,
  sectionId,
  lessonId
}, ref) => {
  const [locallyCompletedLessons, setLocallyCompletedLessons] = useState<{ [key: string]: boolean }>({});
  const { t } = useTranslation();

  const handleComplete = (id: string) => {
    setLocallyCompletedLessons(prev => ({
      ...prev,
      [id]: true
    }));
    onLessonComplete();
  };

  const renderContent = () => {
    if (lessonType === 'quiz') {
      if (!content?.questions) return null;
      return (
        <QuizContent 
          key={`quiz-${sectionId}-${title}`} 
          title={title} 
          lessonNumber=""
          questions={content.questions}
          onProgress={onQuizProgress}
          sectionId={sectionId}
          onComplete={onLessonComplete}
          status={status}
        />
      );
    }

    if (!content?.contentItems?.length) return null;

    return (
      <>
        {content.contentItems.map((item, index) => (
          <div key={index}>
            {item.type === 'text' ? (
              <ArticleContent 
                title={title} 
                lessonNumber=""
                content={item.content}
                status={status}
                hideCompleteButton={true}
              />
            ) : (
              <VideoContent 
                title={`${title} - Video ${index + 1}`}
                lessonNumber=""
                videoUrl={item.content}
                status={status}
                onComplete={onLessonComplete}
              />
            )}
          </div>
        ))}
        {status !== 'completed' && !locallyCompletedLessons[lessonId] && 
         content.contentItems.every(item => item.type === 'text') && (
          <CompleteButton
            variant="contained"
            color="primary"
            onClick={() => handleComplete(lessonId)}
          >
            {t('user.courseLearning.markComplete')}
          </CompleteButton>
        )}
      </>
    );
  };

  return (
    <ContentContainer ref={ref}>
      <ContentHeader>
        <HeaderContent>
          <LessonTitle variant="h1">{title}</LessonTitle>
        </HeaderContent>
        <MobileMenuButton onClick={onMobileMenuClick}>
          <ExpandIcon />
        </MobileMenuButton>
      </ContentHeader>
      <ContentBody>
        {renderContent()}
      </ContentBody>
    </ContentContainer>
  );
});

CourseLearningContent.displayName = 'CourseLearningContent'; 