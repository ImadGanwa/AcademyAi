import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Divider,
  styled,
  Paper,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import QuizIcon from '@mui/icons-material/Quiz';
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
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface CoursePreviewProps {
  open: boolean;
  onClose: () => void;
  course: {
    title: string;
    description: string;
    thumbnail: string;
    status: string;
    sections: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        type: 'video' | 'text' | 'quiz';
        duration?: number;
      }>;
    }>;
    learningPoints: string[];
    requirements: string[];
  };
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  open,
  onClose,
  course,
}) => {
  const { t } = useTranslation();

  return (
    <PreviewDialog
      open={open}
      onClose={onClose}
      scroll="paper"
      aria-labelledby="course-preview-dialog"
    >
      <PreviewHeader>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DialogTitle sx={{ p: 0 }}>{t('trainer.coursePreview.coursePreview')}</DialogTitle>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </PreviewHeader>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
          <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            {course.title}
          </Typography>
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
          />
        </Box>

        <ContentSection>
          <SectionTitle variant="h6">{t('trainer.coursePreview.aboutThisCourse')}</SectionTitle>
          <Typography variant="body1" color="text.secondary">
            {course.description}
          </Typography>
        </ContentSection>

        <ContentSection>
          <SectionTitle variant="h6">{t('trainer.coursePreview.whatYoullLearn')}</SectionTitle>
          <Box component="ul" sx={{ pl: 2, mt: 0 }}>
            {course.learningPoints.map((point, index) => (
              <Typography
                key={index}
                component="li"
                variant="body1"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {point}
              </Typography>
            ))}
          </Box>
        </ContentSection>

        <ContentSection>
          <SectionTitle variant="h6">{t('trainer.coursePreview.requirements')}</SectionTitle>
          <Box component="ul" sx={{ pl: 2, mt: 0 }}>
            {course.requirements.map((requirement, index) => (
              <Typography
                key={index}
                component="li"
                variant="body1"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {requirement}
              </Typography>
            ))}
          </Box>
        </ContentSection>

        <ContentSection>
          <SectionTitle variant="h6">{t('trainer.coursePreview.courseContent')}</SectionTitle>
          {course.sections.map((section) => (
            <Box key={section.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {section.title}
              </Typography>
              <Box sx={{ pl: 2 }}>
                {section.lessons.map((lesson) => (
                  <LessonItem key={lesson.id}>
                    {lesson.type === 'video' && (
                      <PlayCircleOutlineIcon color="action" />
                    )}
                    {lesson.type === 'text' && <ArticleIcon color="action" />}
                    {lesson.type === 'quiz' && <QuizIcon color="action" />}
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {lesson.title}
                    </Typography>
                    {lesson.duration && (
                      <Typography variant="caption" color="text.secondary">
                        {lesson.duration}min
                      </Typography>
                    )}
                  </LessonItem>
                ))}
              </Box>
            </Box>
          ))}
        </ContentSection>
      </DialogContent>
    </PreviewDialog>
  );
}; 