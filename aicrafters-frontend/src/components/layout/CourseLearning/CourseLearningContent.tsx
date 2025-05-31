import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, IconButton, Button } from '@mui/material';
import { VideoContent } from './content/VideoContent';
import { ArticleContent } from './content/ArticleContent';
import { QuizContent } from './content/QuizContent';
// import { ReactComponent as ExpandIcon } from '../../../assets/icons/Expand.svg';
import MenuIcon from '@mui/icons-material/Menu';
import { LessonContent } from '../../../types/course';
import { useTranslation } from 'react-i18next';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const ContentContainer = styled.main`
  flex: 1;
  min-width: 0;
  background: white;
  border-radius: 0 10px 10px 0;
  border: 1px solid ${props => props.theme.palette.divider};
  display: flex;
  flex-direction: column;
  scroll-margin-top: 100px; /* Prevents the content from scrolling too far when using scrollIntoView */

  @media (max-width: 768px) {
    border-radius: 10px;
  }
`;

const ContentHeader = styled.div`
  margin-bottom: 4px;
  background-color: #FAFBFC;
  padding: 12px 24px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  border-radius: 0px 10px 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 47px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    position: relative;
    border-radius: 10px 10px 0 0;
    margin-bottom: 0;
    background-color: #FAFBFC;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 12px;
    align-items: center;
  }
`;

const ContentBody = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 10px;
`;

const HeaderContent = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 8px;
    text-align: center;
  }
`;

const MobileMenuButton = styled(IconButton)`
  && {
    display: none;
    @media (max-width: 768px) {
      background: #f0f0f0;
      height: 36px;
      width: 36px;
      padding: 2px;
      display: flex;
      border-radius: 8px;
      align-self: center;
    }
  }
`;

const MobileNavContainer = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    justify-content: space-between;
    border-bottom: 1px solid ${props => props.theme.palette.divider};
    padding-bottom: 12px;
  }
`;

const MobileMenuContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileNavText = styled(Typography)`
  && {
    display: none;
    @media (max-width: 768px) {
      display: block;
      font-size: 12px;
      color: ${props => props.theme.palette.text.secondary};
      white-space: nowrap;
    }
  }
`;

const NavButtonsContainer = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    gap: 8px;
  }
`;

const NavButton = styled(IconButton)`
  && {
    background: #f0f0f0;
    height: 36px;
    width: 36px;
    padding: 0;
    display: flex;
    border-radius: 8px;
    align-self: center;
    
    &:disabled {
      background: #e0e0e0;
      opacity: 0.5;
    }
  }
`;

const LessonTitle = styled(Typography)`
  && {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.palette.text.title};
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
      line-height: 1.4;
    }
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
  courseId?: string;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  hasPrevLesson?: boolean;
  hasNextLesson?: boolean;
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
  lessonId,
  courseId,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson
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
                courseId={courseId}
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
        <MobileNavContainer>
          <MobileMenuContainer>
            <MobileMenuButton onClick={onMobileMenuClick} aria-label="Open menu">
              <MenuIcon />
            </MobileMenuButton>
            <MobileNavText variant="caption">
              {t('user.courseLearning.mobileNavHelp', 'Tap to see all lessons')}
            </MobileNavText>
          </MobileMenuContainer>
          <NavButtonsContainer>
            <NavButton 
              onClick={onPrevLesson} 
              aria-label="Previous lesson"
              disabled={!hasPrevLesson}
            >
              <NavigateBeforeIcon />
            </NavButton>
            <NavButton 
              onClick={onNextLesson} 
              aria-label="Next lesson"
              disabled={!hasNextLesson}
            >
              <NavigateNextIcon />
            </NavButton>
          </NavButtonsContainer>
        </MobileNavContainer>
        <HeaderContent>
          <LessonTitle variant="h1">{title}</LessonTitle>
        </HeaderContent>
      </ContentHeader>
      <ContentBody>
        {renderContent()}
      </ContentBody>
    </ContentContainer>
  );
});

CourseLearningContent.displayName = 'CourseLearningContent'; 