import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Title } from '../../common/Typography/Title';
import { ReactComponent as ExpandIcon } from '../../../assets/icons/Expand.svg';
import { ReactComponent as ArrowDownIcon } from '../../../assets/icons/ArrowDown.svg';
import { ReactComponent as PlayIcon } from '../../../assets/icons/Play.svg';
import { ReactComponent as ArticleIcon } from '../../../assets/icons/Article.svg';
import { ReactComponent as QuizIcon } from '../../../assets/icons/Quiz.svg';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import { isRTL } from '../../../utils/i18n/i18n';
import { LessonPreviewPopup } from './LessonPreviewPopup';

const ContentSection = styled.section`
  background: #ffffff;
  padding: 32px 0;
`;

const ContentHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  justify-content: space-between;
  margin-top: -20px;

  @media (max-width: 768px) {
    display: block;
    margin-top: -14px;
  }
`;

const ExpandAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${props => props.theme.palette.text.title};
  border: 1px solid ${props => props.theme.palette.text.title};
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 1rem;
    padding: 6px;
    display: block;
    margin-top: 12px;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  svg {
    width: 16px;
    height: 16px;
    path {
      fill: ${props => props.theme.palette.text.secondary};
    }

    @media (max-width: 768px) {
    margin: 0 10px;
        vertical-align: middle;
    }
  }
`;

const Stats = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.9rem !important;
`;

const CourseList = styled.div`
  border: 1px solid #D6D9DD;
  border-radius: 12px;
  overflow: hidden;
`;

const CourseItem = styled.div<{ isFirst?: boolean; isLast?: boolean, isExpanded: boolean }>`
  border-bottom: 1px solid #D6D9DD;
  
  &:last-child {
    border-bottom: none;
  }

  button {
    border-radius: ${props => {
      if (props.isFirst) return '12px 12px 0 0';
      if (props.isLast && !props.isExpanded) return '0 0 12px 12px';
      return '0';
    }};
  }
`;

const DropdownButton = styled.button<{ isExpanded: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #ffffff;
  border: none;
  cursor: pointer;
  border-bottom: ${props => props.isExpanded ? '1px solid #D6D9DD' : 'none'}
`;

const CourseInfo = styled.div<{ $isRtl: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: ${props => props.$isRtl ? 'right' : 'left'};
`;

const CourseName = styled(Typography)`
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title};
  font-size: 1rem !important;
`;

const CourseStats = styled(Typography)`
font-weight: 500;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.8rem !important;
`;

const IconButton = styled.div<{ isExpanded: boolean }>`
  svg {
    width: 16px;
    height: 16px;
    transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.5s ease;
    path {
      fill: ${props => props.isExpanded ? props.theme.palette.text.title : props.theme.palette.text.secondary};
    }
  }
`;

const LectureList = styled.div`
  background: #FAFBFC;
  padding: 16px 6px;
`;

const LectureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  
  &:hover {
    background: #ffffff;
    border-radius: 8px;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const LectureInfo = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LectureName = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.9rem !important;
`;

const Duration = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.8rem;
`;

const PreviewTag = styled.span`
  color: ${props => props.theme.palette.secondary.main};
  font-size: 0.9rem;
  margin: 0 12px;

  @media (max-width: 768px) {
  display: none;
  }
`;

interface LessonType {
  id: string;
  title: string;
  type: 'lesson' | 'quiz';
  content?: string;
  vimeoLink?: string;
  preview: boolean;
  duration?: number;
  contentItems?: Array<{
    type: 'text' | 'media';
    content: string;
    vimeoLink?: string;
    duration?: number;
  }>;
  questions?: Array<{
    question: string;
    context?: string;
    isMultipleChoice: boolean;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export interface CourseContentListProps {
  content: {
    video?: string;
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
  };
}

export const CourseContentList: React.FC<CourseContentListProps> = ({ content }) => {
  const { i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);

  const sections = content.courseContent?.sections || [];
  const totalLectures = sections.reduce((total, section) => total + section.lessons.length, 0);
  const totalDuration = sections.reduce((total, section) => 
    total + section.lessons.reduce((sectionTotal, lesson) => sectionTotal + (lesson.duration || 0), 0), 0
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleAllSections = () => {
    if (expandedSections.length === sections.length) {
      setExpandedSections([]);
    } else {
      setExpandedSections(sections.map(section => section.id));
    }
  };

  const handleLessonClick = (lesson: LessonType, sectionIndex: number, lessonIndex: number) => {
    if (sectionIndex === 0 && lessonIndex === 0 && lesson.preview) {
      const transformedLesson: LessonType = {
        ...lesson,
        contentItems: lesson.contentItems || (lesson.content && lesson.type === 'lesson' ? [{
          type: 'media',
          content: lesson.content,
          vimeoLink: lesson.content,
          duration: lesson.duration
        }] : []),
        questions: lesson.type === 'quiz' ? (
          lesson.questions || (lesson.content ? JSON.parse(lesson.content) : undefined)
        ) : undefined
      };
      setSelectedLesson(transformedLesson);
    }
  };

  return (
    <ContentSection>
      <ContentHeader>
        <Title variant="h2">{t('course.content.title')}</Title>
        <StatsRow>
          <StatsWrapper>
            <Stats>
              {sections.length} {t('course.content.sections')} • {totalLectures} {t('course.content.lectures')} • {totalDuration}min
            </Stats>
            <ExpandAllButton onClick={toggleAllSections}>
              {expandedSections.length === sections.length 
                ? t('course.content.collapse_all_sections')
                : t('course.content.expand_all_sections')}
                <ExpandIcon />
            </ExpandAllButton>
          </StatsWrapper>
        </StatsRow>
      </ContentHeader>
      
      <CourseList>
        {sections.map((section, sectionIndex) => (
          <CourseItem 
            key={section.id}
            isExpanded={expandedSections.includes(section.id)}
            isFirst={sectionIndex === 0}
            isLast={sectionIndex === sections.length - 1}
          >
            <DropdownButton
              isExpanded={expandedSections.includes(section.id)}
              onClick={() => toggleSection(section.id)}
            >
              <CourseInfo $isRtl={isRtl}>
                <CourseName>{section.title}</CourseName>
                <CourseStats>
                  {section.lessons.length} {t('course.content.lectures')} • {section.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)}min
                </CourseStats>
              </CourseInfo>
              <IconButton isExpanded={expandedSections.includes(section.id)}>
                <ArrowDownIcon />
              </IconButton>
            </DropdownButton>
            
            {expandedSections.includes(section.id) && (
              <LectureList>
                {section.lessons.map((lesson, lessonIndex) => (
                    <LectureItem 
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson, sectionIndex, lessonIndex)}
                      style={{ cursor: (sectionIndex === 0 && lessonIndex === 0 && lesson.preview) ? 'pointer' : 'default' }}
                    >
                      <IconWrapper>
                      {lesson.type === 'lesson' && (
                        lesson.contentItems?.[0]?.type === 'text' ? <ArticleIcon /> : <PlayIcon />
                      )}
                        {lesson.type === 'quiz' && <QuizIcon />}
                      </IconWrapper>
                      <LectureInfo>
                        <LectureName>
                          {lesson.title}
                        </LectureName>
                        <Duration>
                          {sectionIndex === 0 && lessonIndex === 0 && lesson.preview && (
                            <PreviewTag>
                              {t('course.content.preview')}
                            </PreviewTag>
                          )}
                          {lesson.duration ? `${lesson.duration}min` : ''}
                        </Duration>
                      </LectureInfo>
                    </LectureItem>
                ))}
              </LectureList>
            )}
          </CourseItem>
        ))}
      </CourseList>

      {selectedLesson && (
        <LessonPreviewPopup
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </ContentSection>
  );
}; 