import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Paper,
  Chip,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

const PreviewDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '900px',
    width: '90vw',
    maxHeight: '90vh',
    margin: '16px',
  },
}));

const PreviewHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));

const ContentSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

const LessonItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  gap: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const VideoWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  aspectRatio: '16/9',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const QuizOption = styled(Box)<{ $isCorrect?: boolean }>(({ theme, $isCorrect }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  backgroundColor: $isCorrect ? `${theme.palette.success.main}15` : theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface CoursePreviewProps {
  open: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description: string;
    subtitle: string;
    thumbnail: string;
    status: string;
    courseContent?: {
      sections: Array<{
        id: string;
        title: string;
        lessons: Array<{
          id: string;
          title: string;
          type: 'video' | 'text' | 'quiz';
          duration?: number;
          content?: any;
          contentItems?: Array<{
            type: 'text' | 'media';
            content: string;
            vimeoLink?: string;
            duration?: number;
          }>;
          preview: boolean;
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
        }>;
      }>;
    };
    learningPoints: string[];
    requirements: string[];
  };
  actions?: React.ReactNode;
}

const getVimeoVideoId = (vimeoLink: string) => {
  const match = vimeoLink.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/);
  return match ? match[1] : null;
};

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  open,
  onClose,
  course,
  actions
}) => {
  const { t } = useTranslation();
  // Initialize with all sections and lessons expanded
  const [expandedSection, setExpandedSection] = useState<string[]>(
    course.courseContent?.sections.map(section => section.id) || []
  );
  const [expandedLesson, setExpandedLesson] = useState<string[]>(
    course.courseContent?.sections.flatMap(section => 
      section.lessons.map(lesson => lesson.id)
    ) || []
  );

  // Add debug logging
  React.useEffect(() => {
    
  }, [open, course]);

  const handleSectionChange = (sectionId: string) => {
    setExpandedSection(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLessonChange = (lessonId: string) => {
    setExpandedLesson(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const renderLessonContent = (lesson: any) => {
    

    switch (lesson.type) {
      case 'lesson':
        if (lesson.contentItems && Array.isArray(lesson.contentItems)) {
          return (
            <Box sx={{ pl: 2, pr: 2 }}>
              {lesson.contentItems.map((item: any, index: number) => {
                if (item.type === 'media') {
                  const videoId = getVimeoVideoId(item.vimeoLink || item.content);
                  if (!videoId) return null;
                  return (
                    <Box key={index} sx={{ mb: 3 }}>
                      <VideoWrapper>
                        <iframe
                          title={`Video ${index + 1}`}
                          src={`https://player.vimeo.com/video/${videoId}?autoplay=0`}
                          style={{ width: '100%', height: '100%' }}
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      </VideoWrapper>
                    </Box>
                  );
                } else if (item.type === 'text') {
                  return (
                    <Box key={index} sx={{ mb: 3 }}>
                      <div dangerouslySetInnerHTML={{ __html: item.content }} />
                    </Box>
                  );
                }
                return null;
              })}
            </Box>
          );
        } else if (lesson.content) {
          // Handle legacy content format
          let content = '';
          try {
            if (typeof lesson.content === 'string') {
              // Check if it's a video URL
          const videoId = getVimeoVideoId(lesson.content);
              if (videoId) {
          return (
            <VideoWrapper>
              <iframe
                title={lesson.title}
                src={`https://player.vimeo.com/video/${videoId}?autoplay=0`}
                style={{ width: '100%', height: '100%' }}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </VideoWrapper>
          );
        }
              // If not a video, treat as text
              content = lesson.content;
            } else if (typeof lesson.content === 'object') {
              if (Array.isArray(lesson.content)) {
                content = lesson.content.map((item: any) => item.content || '').join('\n');
              } else {
                content = lesson.content.content || '';
              }
            }
            return content ? (
              <Box sx={{ mt: 2 }}>
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </Box>
            ) : null;
          } catch (e) {
            console.error('Error processing lesson content:', e);
            return null;
          }
        }
        return null;

      case 'quiz':
        
        if (!lesson.questions || !Array.isArray(lesson.questions)) {
          return null;
        }

        return (
          <Box sx={{ mt: 2 }}>
            {lesson.questions.map((question: any, index: number) => (
              <Box key={index} sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  {question.question}
                </Typography>
                {question.context && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {question.context}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {question.options?.map((option: any, optIndex: number) => (
                    <QuizOption
                      key={optIndex}
                      $isCorrect={option.isCorrect}
                    >
                      <Typography variant="body2">
                        {option.text}
                      </Typography>
                    </QuizOption>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <PreviewDialog
      open={open}
      onClose={onClose}
      scroll="paper"
      aria-labelledby="course-preview-dialog"
    >
      <PreviewHeader>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle sx={{ p: 0, fontSize: '1.5rem', fontWeight: 600 }}>{t('trainer.coursePreview.coursePreview')}</DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </PreviewHeader>
      
      <DialogContent dividers>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            position: 'relative',
            width: '100%',
            height: '400px',
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src={course.thumbnail}
              alt={course.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'text.title' }}>
            {course.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Chip
              label={course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              color={
                course.status === 'published'
                  ? 'success'
                  : course.status === 'review'
                  ? 'warning'
                  : 'default'
              }
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {course.subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {course.subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <ContentSection elevation={0}>
          <SectionTitle variant="h5">{t('trainer.coursePreview.aboutThisCourse')}</SectionTitle>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {course.description}
          </Typography>
        </ContentSection>

        <ContentSection elevation={0}>
          <SectionTitle variant="h5">{t('trainer.coursePreview.whatYoullLearn')}</SectionTitle>
          <Box component="ul" sx={{ pl: 2, mt: 0 }}>
            {course.learningPoints.map((point, index) => (
              <Typography
                key={index}
                component="li"
                variant="body1"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {point}
              </Typography>
            ))}
          </Box>
        </ContentSection>

        <ContentSection elevation={0}>
          <SectionTitle variant="h5">{t('trainer.coursePreview.requirements')}</SectionTitle>
          <Box component="ul" sx={{ pl: 2, mt: 0 }}>
            {course.requirements.map((requirement, index) => (
              <Typography
                key={index}
                component="li"
                variant="body1"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {requirement}
              </Typography>
            ))}
          </Box>
        </ContentSection>

        <ContentSection elevation={0}>
          <SectionTitle variant="h5">{t('trainer.coursePreview.courseContent')}</SectionTitle>
          {course.courseContent?.sections.map((section) => (
            <Accordion
              key={section.id}
              expanded={expandedSection.includes(section.id)}
              onChange={() => handleSectionChange(section.id)}
              sx={{ 
                mb: 3,
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                overflow: 'hidden',
                '&:before': {
                  display: 'none',
                },
                '& .MuiAccordionSummary-root': {
                  backgroundColor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                  }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {section.lessons.map((lesson) => (
                  <Box 
                    key={lesson.id} 
                    sx={{ 
                      mb: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <LessonItem 
                      onClick={() => handleLessonChange(lesson.id)}
                      sx={{ 
                        p: 2,
                        borderBottom: expandedLesson.includes(lesson.id) ? '1px solid' : 'none',
                        borderColor: 'divider',
                        backgroundColor: expandedLesson.includes(lesson.id) ? 'action.hover' : 'transparent',
                      }}
                    >
                      {(lesson.type === 'video' || lesson.type === 'text') && (
                        lesson.contentItems?.some(item => item.type === 'media') 
                          ? <PlayCircleOutlineIcon color="primary" />
                          : <ArticleIcon color="info" />
                      )}
                      {lesson.type === 'quiz' && <QuizIcon color="warning" />}
                      <Typography variant="body1" sx={{ flex: 1, ml: 1, fontWeight: 500 }}>
                        {lesson.title}
                      </Typography>
                      {lesson.duration && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          {lesson.duration}min
                        </Typography>
                      )}
                    </LessonItem>
                    {expandedLesson.includes(lesson.id) && (
                      <Box sx={{ 
                        p: 3, 
                        backgroundColor: 'grey.50',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}>
                        {renderLessonContent(lesson)}
                      </Box>
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </ContentSection>

        {actions && (
          <ContentSection elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {actions}
            </Box>
          </ContentSection>
        )}
      </DialogContent>
    </PreviewDialog>
  );
}; 