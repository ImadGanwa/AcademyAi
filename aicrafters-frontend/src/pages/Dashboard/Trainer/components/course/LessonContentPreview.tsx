import React from 'react';
import { Box, Typography } from '@mui/material';

interface LessonContent {
  type: 'text' | 'media';
  content?: string;
}

interface LessonContentPreviewProps {
  content: LessonContent;
}

export const LessonContentPreview: React.FC<LessonContentPreviewProps> = ({ content }) => {
  if (content.type !== 'text' || !content.content) {
    return null;
  }

  return (
    <Box sx={{ pl: 2, mt: 1 }}>
      <Box sx={{ 
        p: 2, 
        borderRadius: 1, 
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider' 
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Type: Text Content
        </Typography>
        <Box sx={{ mt: 2 }}>
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        </Box>
      </Box>
    </Box>
  );
}; 