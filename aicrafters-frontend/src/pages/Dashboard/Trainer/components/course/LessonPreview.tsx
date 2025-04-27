import React from 'react';
import { Box, Typography } from '@mui/material';

interface LessonContent {
  id: string;
  title: string;
  type: 'text' | 'media';
  content?: string;
  mediaUrl?: string;
}

interface LessonPreviewProps {
  content: LessonContent;
}

export const LessonPreview: React.FC<LessonPreviewProps> = ({ content }) => {
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
          Type: {content.type === 'text' ? 'Text Content' : 'Media Content'}
        </Typography>
        {content.type === 'text' && content.content && (
          <Box sx={{ mt: 2 }}>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}; 