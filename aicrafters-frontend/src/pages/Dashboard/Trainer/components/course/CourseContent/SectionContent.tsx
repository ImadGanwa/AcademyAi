import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DroppableContainer, ZoneTitle } from './styles';
import { ContentSection, LessonContent, QuizContent } from './types';
import { QuizPreview } from '../QuizPreview';
import { SortableContentForm } from '../SortableContentForm';
import { useTranslation } from 'react-i18next';

interface SectionContentProps {
  sectionId: string;
  contents: ContentSection[];
  contentForms: any[];
  sectionDurations: Record<string, number>;
  onEditLesson: (content: ContentSection, lessonContent: LessonContent) => void;
  onEditQuiz: (content: ContentSection, quizContent: QuizContent) => void;
  onRemoveContent: (sectionId: string, contentId: string) => void;
  onAddLesson: () => void;
  onAddQuiz: () => void;
  onSectionDragEnd: (event: any) => void;
  onToggleContentCollapse: (contentId: string) => void;
  onTogglePreview: (contentId: string, type: 'lesson' | 'quiz') => void;
  onDurationChange: (sectionId: string, duration: number) => void;
  isFirstSection?: boolean;
}

interface ContentItem {
  type: 'text' | 'media';
  content: string;
  duration?: number;
}

export const SectionContent: React.FC<SectionContentProps> = ({
  sectionId,
  contents,
  contentForms,
  sectionDurations,
  onEditLesson,
  onEditQuiz,
  onRemoveContent,
  onAddLesson,
  onAddQuiz,
  onSectionDragEnd,
  onToggleContentCollapse,
  onTogglePreview,
  onDurationChange,
  isFirstSection = false,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const { t } = useTranslation();

  const [contentDurations, setContentDurations] = useState<{ [key: string]: number }>({});
  const [lastEditTime, setLastEditTime] = useState<number>(Date.now());
  const [videoDurationCache, setVideoDurationCache] = useState<{ [key: string]: number }>({});

  // Helper functions for duration calculation
  const getContentItems = (lessonContent: LessonContent): ContentItem[] => {
    if (lessonContent.contentItems) {
      return lessonContent.contentItems;
    }
    if (Array.isArray(lessonContent.content)) {
      return lessonContent.content;
    }
    return [];
  };

  const calculateLessonDuration = (lessonContent: LessonContent): number => {
    return getContentItems(lessonContent).reduce((total: number, item: ContentItem) => {
      if (item.type === 'media' && item.duration) {
        return total + item.duration;
      }
      return total;
    }, 0);
  };

  const calculateQuizDuration = (quizContent: QuizContent): number => {
    return (quizContent.questions?.length || 0) * 2; // 2 minutes per question
  };

  // Calculate total duration for the section
  const calculateTotalDuration = () => {
    return contents.reduce((total, content) => {
      if (content.type === 'lesson') {
        return total + calculateLessonDuration(content.content as LessonContent);
      } else if (content.type === 'quiz') {
        return total + calculateQuizDuration(content.content as QuizContent);
      }
      return total;
    }, 0);
  };

  // Calculate duration on mount and when contents change
  useEffect(() => {
    const duration = calculateTotalDuration();
    if (duration !== sectionDurations[sectionId]) {
      onDurationChange(sectionId, duration);
    }
  }, [contents, sectionId, onDurationChange, sectionDurations]);

  const handleEditLesson = useCallback((content: ContentSection, lessonContent: LessonContent) => {
    onEditLesson(content, lessonContent);
  }, [onEditLesson]);

  const handleEditQuiz = useCallback((content: ContentSection, quizContent: QuizContent) => {
    onEditQuiz(content, quizContent);
  }, [onEditQuiz]);

  const getVimeoVideoId = (vimeoLink: string): string | null => {
    const match = vimeoLink.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/);
    return match ? match[1] : null;
  };
  
  const renderPreview = (content: ContentSection) => {
    if (content.type === 'quiz') {
      
      // Cast to QuizContent since we know it's a quiz
      const quizContent = content.content as QuizContent;
      
      // Extract questions from the correct location in the content structure
      const questions = quizContent?.questions || [];
      
      return (
        <Box sx={{ pl: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => onToggleContentCollapse(content.id)}
              sx={{ p: 0.5 }}
            >
              {content.isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {t('trainer.createCourse.questions', { count: questions.length })}
            </Typography>
          </Box>
          {!content.isCollapsed && (
            <QuizPreview
              questions={questions}
              onEdit={() => {
                onEditQuiz(content, quizContent);
              }}
            />
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <>
      {/* Preview Zone */}
      <DroppableContainer style={{ marginTop: '20px' }} data-type="preview">
        <ZoneTitle sx={{ color: '#D710C1', fontWeight: 'bold' }}>{t('trainer.createCourse.previewZone')}</ZoneTitle>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onSectionDragEnd}
        >
          <SortableContext
            items={contents.map(content => content.id)}
            strategy={verticalListSortingStrategy}
          >
            {contents.map((content, index) => (
              <SortableContentForm key={content.id} id={content.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" color="text.title">
                      {`${index + 1}. ${content.title}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {`Content Type (${content.type === 'lesson' ? 
                          (getContentItems(content.content as LessonContent).some(item => item.type === 'media') ? 'Video' : 'Text') + ' • ' + 
                          calculateLessonDuration(content.content as LessonContent) + ' min' : 
                          'Quiz • ' + calculateQuizDuration(content.content as QuizContent) + ' min'})`}
                      </Typography>
                    </Box>
                    {isFirstSection && index === 0 && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={content.type === 'lesson' 
                              ? (content.content as LessonContent).preview
                              : (content.content as QuizContent).preview}
                            onChange={() => onTogglePreview(content.id, content.type)}
                            color="secondary"
                          />
                        }
                        label={
                          <Typography variant="body2" style={{ color: '#ff0000' }}>
                            {t('trainer.createCourse.makeThisPreview', { content: content.type })}
                          </Typography>
                        }
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => content.type === 'lesson' 
                        ? onEditLesson(content, content.content as LessonContent)
                        : onEditQuiz(content, content.content as QuizContent)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onRemoveContent(sectionId, content.id)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                </Box>

                {content.type === 'lesson' && (
                  <Box sx={{ pl: 2, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => onToggleContentCollapse(content.id)}
                        sx={{ p: 0.5 }}
                      >
                        {content.isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {t('trainer.createCourse.contentItems', { count: getContentItems(content.content as LessonContent).length })}
                      </Typography>
                    </Box>
                    {!content.isCollapsed && (
                      <Box sx={{ mt: 2 }}>
                        {getContentItems(content.content as LessonContent).map((item, idx) => (
                          <Box key={idx} sx={{ 
                            p: 2, 
                            mb: 2,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            border: 1,
                            borderColor: 'divider'
                          }}>
                            <Typography variant="body2" color="text.secondary">
                              {`${idx + 1}. ${item.type === 'media' ? t('trainer.createCourse.videoContent') : t('trainer.createCourse.textContent')}`}
                              {item.type === 'media' && item.duration && ` • ${item.duration} min`}
                            </Typography>
                            {item.type === 'media' ? (
                              <Box sx={{ 
                                mt: 1,
                                width: '100%', 
                                aspectRatio: '16/9',
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: 1,
                                borderColor: 'divider'
                              }}>
                                <iframe
                                  title={`Video ${idx + 1}`}
                                  src={`https://player.vimeo.com/video/${getVimeoVideoId(item.content)}?autoplay=0`}
                                  style={{ width: '100%', height: '100%' }}
                                  frameBorder="0"
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                />
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                                <div dangerouslySetInnerHTML={{ __html: item.content }} />
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {content.type === 'quiz' && renderPreview(content)}
              </SortableContentForm>
            ))}
          </SortableContext>
        </DndContext>
      </DroppableContainer>

      {/* Add Content Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={onAddLesson}
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'secondary.dark',
            }
          }}
        >
          {t('trainer.createCourse.addLesson')}
        </Button>
        <Button
          variant="contained"
          onClick={onAddQuiz}
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'secondary.dark',
            }
          }}
        >
          {t('trainer.createCourse.addQuiz')}
        </Button>
      </Box>
    </>
  );
}; 