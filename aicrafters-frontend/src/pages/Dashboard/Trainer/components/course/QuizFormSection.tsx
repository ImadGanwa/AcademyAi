import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import styled from 'styled-components';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import type { QuizQuestion as QuizQuestionType } from './CourseContent/types';
import { QuizQuestion } from './QuizQuestion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

const StyledTextField = styled(TextField)`
  && {
    margin-bottom: 16px;
    
    .MuiInputBase-input {
      color: ${props => props.theme.palette.text.secondary};
    }
    
    .MuiInputLabel-root {
      color: ${props => props.theme.palette.text.secondary};
    }
    
    .MuiOutlinedInput-root {
      &.Mui-focused fieldset {
        border-color: ${props => props.theme.palette.secondary.main};
      }
    }
  }
`;

const DragHandle = styled(Box)`
  cursor: grab;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-right: 8px;
  
  &:hover {
    color: #ffffff;
  }
`;

interface SortableQuestionProps {
  id: string;
  index: number;
  question: QuizQuestionType;
  onEdit: () => void;
}

interface QuizFormSectionProps {
  form: {
    id: string;
    title: string;
    isEditing?: boolean;
    questions?: QuizQuestionType[];
    showQuestion?: boolean;
  };
  onFormChange: (id: string, field: string, value: any) => void;
  onQuizQuestionSave: (id: string, questionData: QuizQuestionType) => void;
  onAddQuiz: (id: string) => void;
  onRemoveForm: (id: string) => void;
}

const SortableQuestion: React.FC<SortableQuestionProps> = ({ id, index, question, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: 'background.paper',
    borderRadius: 1,
    border: 1,
    borderColor: 'divider',
    p: 2,
    mb: 1,
    display: 'flex',
    alignItems: 'flex-start',
  };

  return (
    <Box ref={setNodeRef} sx={style}>
      <DragHandle {...attributes} {...listeners}>
        <DragIndicatorIcon />
      </DragHandle>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" color="text.title">
            {index + 1}. {question.question}
          </Typography>
          <IconButton 
            size="small" 
            onClick={onEdit}
            sx={{ ml: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
        {question.context && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            {question.context}
          </Typography>
        )}
        <Box sx={{ pl: 2 }}>
          {question.options.map((option, optIndex) => (
            <Box 
              key={option.id} 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
                color: option.isCorrect ? 'success.main' : 'text.secondary'
              }}
            >
              <Typography variant="body2" component="span" sx={{ minWidth: 20 }}>
                {String.fromCharCode(65 + optIndex)}.
              </Typography>
              <Typography variant="body2">
                {option.text} {option.isCorrect && '✓'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export const QuizFormSection: React.FC<QuizFormSectionProps> = ({
  form,
  onFormChange,
  onQuizQuestionSave,
  onAddQuiz,
  onRemoveForm,
}) => {
  const { t } = useTranslation();
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize questions array if it doesn't exist
  React.useEffect(() => {
    if (!form.questions) {
      onFormChange(form.id, 'questions', []);
    }
  }, [form.id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && form.questions) {
      const oldIndex = form.questions.findIndex(q => String(q.question) === active.id);
      const newIndex = form.questions.findIndex(q => String(q.question) === over.id);
      
      const newQuestions = arrayMove(form.questions, oldIndex, newIndex);
      onFormChange(form.id, 'questions', newQuestions);
    }
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    onFormChange(form.id, 'showQuestion', true);
  };

  const handleQuestionSave = (questionData: QuizQuestionType) => {
    if (editingQuestionIndex !== null && form.questions) {
      // Update existing question
      const updatedQuestions = [...form.questions];
      updatedQuestions[editingQuestionIndex] = questionData;
      onFormChange(form.id, 'questions', updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      onQuizQuestionSave(form.id, questionData);
    }
    onFormChange(form.id, 'showQuestion', false);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" color="text.title">
          {form.isEditing ? t('trainer.createCourse.editQuiz') : t('trainer.createCourse.addNewQuiz')}
        </Typography>
        <IconButton onClick={() => onRemoveForm(form.id)}>
          <DeleteOutlineIcon />
        </IconButton>
      </Box>
      <StyledTextField
        fullWidth
        label={t('trainer.createCourse.quizTitle')}
        value={form.title}
        onChange={(e) => onFormChange(form.id, 'title', e.target.value)}
      />
      
      {/* Display existing questions */}
      {form.questions && form.questions.length > 0 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {t('trainer.createCourse.questions')} ({form.questions.length}):
          </Typography>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={form.questions.map(q => String(q.question))}
              strategy={verticalListSortingStrategy}
            >
              {form.questions.map((q, index) => (
                <SortableQuestion
                  key={String(q.question)}
                  id={String(q.question)}
                  index={index}
                  question={q}
                  onEdit={() => handleEditQuestion(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Box>
      )}

      {!form.showQuestion ? (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() => onFormChange(form.id, 'showQuestion', true)}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              bgcolor: 'secondary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'secondary.dark',
              }
            }}
          >
            {t('trainer.createCourse.addQuestion')}
          </Button>
          {form.questions && form.questions.length > 0 && (
            <Button
              variant="contained"
              onClick={() => onAddQuiz(form.id)}
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                }
              }}
            >
              {form.isEditing ? t('trainer.createCourse.updateQuiz') : t('trainer.createCourse.saveQuiz')}
            </Button>
          )}
        </Box>
      ) : (
        <QuizQuestion
          initialData={editingQuestionIndex !== null && form.questions ? form.questions[editingQuestionIndex] : undefined}
          onSave={handleQuestionSave}
          onCancel={() => {
            setEditingQuestionIndex(null);
            onFormChange(form.id, 'showQuestion', false);
          }}
        />
      )}
    </>
  );
} 