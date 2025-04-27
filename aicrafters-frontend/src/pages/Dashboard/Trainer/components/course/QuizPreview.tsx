import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { QuizQuestion as QuizQuestionType } from './CourseContent/types';

interface QuizPreviewProps {
  questions: QuizQuestionType[];
  onEdit?: () => void;
}

export const QuizPreview: React.FC<QuizPreviewProps> = ({ questions, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    
  }, [questions]);

  // Ensure questions is an array and has items
  const validQuestions = Array.isArray(questions) ? questions : [];
  if (validQuestions.length === 0) {
    return (
      <Box sx={{ pl: 2, mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          No questions available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {validQuestions.map((q, qIndex) => {
        if (!q || !q.options) {
          return null;
        }
        return (
          <Box 
            key={qIndex} 
            sx={{ 
              p: 2, 
              mb: 1, 
              borderRadius: 1, 
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" color="text.title" sx={{ mb: 1 }}>
              {qIndex + 1}. {q.question}
            </Typography>
            {q.context && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                {q.context}
              </Typography>
            )}
            <Box sx={{ pl: 2 }}>
              {q.options.map((option, optIndex) => {
                return (
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
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}; 