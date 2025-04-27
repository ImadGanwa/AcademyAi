import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { QuizQuestion } from './QuizQuestion';
import { StyledTextField } from './CourseContent/styles';

interface QuizFormProps {
  id: string;
  title: string;
  questions: Array<{
    question: string;
    context: string;
    isMultipleChoice: boolean;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
  onTitleChange: (value: string) => void;
  onQuestionSave: (questionData: any) => void;
  onSave: () => void;
  onRemove: () => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  id,
  title,
  questions,
  onTitleChange,
  onQuestionSave,
  onSave,
  onRemove,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ flex: 1, mr: 2 }}>
          <StyledTextField
            fullWidth
            label="Quiz Title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
          />
        </Box>
        <IconButton onClick={onRemove}>
          <DeleteOutlineIcon />
        </IconButton>
      </Box>
      
      {/* Rest of the component... */}
    </Box>
  );
}; 