import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableContentFormProps {
  id: string;
  children: React.ReactNode;
}

export const SortableContentForm = ({ id, children }: SortableContentFormProps) => {
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
    position: 'relative' as const,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        p: 2,
        mb: 2,
        border: 1,
        borderColor: isDragging ? 'secondary.main' : 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        '&:hover': {
          borderColor: 'secondary.main',
          '& .drag-handle': {
            opacity: 1,
          },
        },
        boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.1)' : 'none',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box
          className="drag-handle"
          sx={{
            cursor: 'grab',
            opacity: 0.5,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: '#ffffff',
            },
          }}
          {...listeners}
        >
          <DragIndicatorIcon />
        </Box>
        <Box sx={{ flex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
}; 