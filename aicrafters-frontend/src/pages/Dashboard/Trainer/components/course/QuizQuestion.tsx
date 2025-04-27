import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Checkbox,
  useTheme,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import styled from 'styled-components';
import { QuizQuestion as QuizQuestionType } from './CourseContent/types';
import { useTranslation } from 'react-i18next';

const QuestionContainer = styled(Box)`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 8px;
  margin-bottom: 16px;
`;

const OptionContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

interface QuizQuestionProps {
  initialData?: QuizQuestionType;
  onSave: (questionData: QuizQuestionType) => void;
  onCancel: () => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ initialData, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState(initialData?.question || '');
  const [context, setContext] = useState(initialData?.context || '');
  const [options, setOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>(
    initialData?.options || [
      { id: String(Date.now()), text: '', isCorrect: false },
      { id: String(Date.now() + 1), text: '', isCorrect: false },
    ]
  );

  const handleAddOption = () => {
    setOptions([
      ...options,
      { id: String(Date.now()), text: '', isCorrect: false },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const handleOptionChange = (id: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setOptions(options.map(option =>
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  const handleSave = () => {
    // Count correct options to determine if it's multiple choice
    const correctOptionsCount = options.filter(opt => opt.isCorrect).length;
    const isMultipleChoice = correctOptionsCount > 1;

    if (!question || options.some(opt => !opt.text) || !options.some(opt => opt.isCorrect)) {
      return;
    }

    onSave({
      question,
      context,
      isMultipleChoice,
      options: options.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    });
  };

  const theme = useTheme();

  return (
    <QuestionContainer>
      <TextField
        fullWidth
        label={t('trainer.createCourse.question')}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        sx={{ 
          mb: 2,
          '& .MuiInputBase-input': {
            color: 'text.secondary'
          }
        }}
      />
      <TextField
        fullWidth
        label={t('trainer.createCourse.context')}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        multiline
        rows={2}
        sx={{ 
          mb: 2,
          '& .MuiInputBase-input': {
            color: 'text.secondary'
          }
        }}
      />

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {t('trainer.createCourse.options')} ({t('trainer.createCourse.selectCorrectAnswer')}):
      </Typography>

      {options.map((option) => (
        <OptionContainer key={option.id}>
          <Checkbox
            checked={option.isCorrect}
            onChange={(e) => handleOptionChange(option.id, 'isCorrect', e.target.checked)}
          />
          <TextField
            fullWidth
            placeholder={t('trainer.createCourse.optionText')}
            value={option.text}
            onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
            sx={{ 
              '& .MuiInputBase-input': {
                color: 'text.secondary'
              }
            }}
          />
          {options.length > 2 && (
            <IconButton 
              size="small"
              onClick={() => handleRemoveOption(option.id)}
            >
              <DeleteOutlineIcon />
            </IconButton>
          )}
        </OptionContainer>
      ))}

      <Button
        variant="text"
        onClick={handleAddOption}
        startIcon={<AddCircleOutlineIcon />}
        sx={{ mb: 2 }}
      >
        {t('trainer.createCourse.addOption')}
      </Button>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderColor: 'secondary.main',
            color: 'secondary.main',
            '&:hover': {
              borderColor: 'secondary.dark',
              backgroundColor: 'rgba(156, 39, 176, 0.04)'
            }
          }}
        >
          {t('trainer.createCourse.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!question || options.some(opt => !opt.text) || !options.some(opt => opt.isCorrect)}
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'secondary.dark',
            }
          }}
        >
          {t('trainer.createCourse.saveQuestion')}
        </Button>
      </Box>
    </QuestionContainer>
  );
}; 