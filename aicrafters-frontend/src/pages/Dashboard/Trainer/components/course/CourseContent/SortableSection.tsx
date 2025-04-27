import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { CourseSection } from './types';
import { SectionHeader } from './SectionHeader';
import { SectionContent } from './SectionContent';
import { EditorZone } from './EditorZone';
import { formatDuration } from './utils';
import { useTranslation } from 'react-i18next';
interface SortableSectionProps {
  section: CourseSection;
  editingSectionId: string | null;
  editingSectionTitle: string;
  contentForms: any[];
  sectionDurations: Record<string, number>;
  onToggleCollapse: (id: string) => void;
  onEditTitle: (id: string) => void;
  onDelete: (id: string) => void;
  onEditTitleChange: (title: string) => void;
  onSaveTitle: (id: string) => void;
  onEditLesson: (content: any, lessonContent: any) => void;
  onEditQuiz: (content: any, quizContent: any) => void;
  onRemoveContent: (sectionId: string, contentId: string) => void;
  onAddLesson: (sectionId: string) => void;
  onAddQuiz: (sectionId: string) => void;
  onSectionDragEnd: (event: any) => void;
  onToggleContentCollapse: (contentId: string) => void;
  onTogglePreview: (contentId: string, type: 'lesson' | 'quiz') => void;
  onFormChange: (id: string, field: string, value: any) => void;
  onQuizQuestionSave: (id: string, questionData: any) => void;
  onQuizSave: (id: string) => void;
  onAddLessonForm: (id: string) => void;
  onRemoveForm: (id: string) => void;
  onEditorDragEnd: (event: any) => void;
  onDurationChange: (sectionId: string, duration: number) => void;
  isFirstSection?: boolean;
}

export const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  editingSectionId,
  editingSectionTitle,
  contentForms,
  sectionDurations,
  onToggleCollapse,
  onEditTitle,
  onDelete,
  onEditTitleChange,
  onSaveTitle,
  onEditLesson,
  onEditQuiz,
  onRemoveContent,
  onAddLesson,
  onAddQuiz,
  onSectionDragEnd,
  onToggleContentCollapse,
  onTogglePreview,
  onFormChange,
  onQuizQuestionSave,
  onQuizSave,
  onAddLessonForm,
  onRemoveForm,
  onEditorDragEnd,
  onDurationChange,
  isFirstSection = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const { t } = useTranslation();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ 
        mb: 3, 
        p: 2, 
        border: 1, 
        borderColor: isDragging ? 'secondary.main' : 'divider', 
        borderRadius: 1,
        bgcolor: 'background.paper',
        '&:hover': {
          borderColor: 'secondary.main',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} {...attributes}>
        <Box {...listeners} sx={{ 
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          padding: '8px',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#ffffff',
            backgroundColor: 'action.hover',
          }
        }}>
          <DragIndicatorIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SectionHeader
            id={section.id}
            title={section.title}
            isCollapsed={section.isCollapsed}
            isEditing={editingSectionId === section.id}
            editTitle={editingSectionTitle}
            onToggleCollapse={() => onToggleCollapse(section.id)}
            onEdit={() => onEditTitle(section.id)}
            onDelete={() => onDelete(section.id)}
            onEditTitleChange={onEditTitleChange}
            onSaveTitle={() => onSaveTitle(section.id)}
          />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              pl: 2, 
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5 
            }}
          >
            <span style={{ fontWeight: 500 }}>{t('trainer.createCourse.sectionDuration')}:</span> {formatDuration(sectionDurations[section.id] || 0)}
          </Typography>
        </Box>
      </Box>

      {!section.isCollapsed && (
        <>
          <SectionContent
            sectionId={section.id}
            contents={section.contents}
            contentForms={contentForms}
            sectionDurations={sectionDurations}
            onEditLesson={onEditLesson}
            onEditQuiz={onEditQuiz}
            onRemoveContent={onRemoveContent}
            onAddLesson={() => onAddLesson(section.id)}
            onAddQuiz={() => onAddQuiz(section.id)}
            onSectionDragEnd={onSectionDragEnd}
            onToggleContentCollapse={onToggleContentCollapse}
            onTogglePreview={onTogglePreview}
            onDurationChange={onDurationChange}
            isFirstSection={isFirstSection}
          />

          <EditorZone
            sectionId={section.id}
            contentForms={contentForms}
            onDragEnd={onEditorDragEnd}
            onFormChange={onFormChange}
            onQuizQuestionSave={onQuizQuestionSave}
            onQuizSave={onQuizSave}
            onAddLesson={onAddLessonForm}
            onRemoveForm={onRemoveForm}
          />
        </>
      )}
    </Box>
  );
}; 