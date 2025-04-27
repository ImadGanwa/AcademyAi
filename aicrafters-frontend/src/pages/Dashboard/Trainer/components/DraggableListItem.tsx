import React from 'react';
import { Box, Typography, IconButton, TextField, Button } from '@mui/material';
import styled from 'styled-components';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ListItemContainer = styled(Box)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  gap: 8px;
  background-color: #f7f7f7;

  .drag-handle {
    cursor: grab;
    color: ${({ theme }) => theme.palette.text.secondary};
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
`;

interface DraggableListItemProps {
  id: string;
  content: string;
  isEditing: boolean;
  editValue: string;
  onEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onEditValueChange: (value: string) => void;
}

export const DraggableListItem: React.FC<DraggableListItemProps> = ({
  id,
  content,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onRemove,
  onEditValueChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItemContainer ref={setNodeRef} style={style}>
      <Box {...attributes} {...listeners}>
        <DragIndicatorIcon className="drag-handle" />
      </Box>
      {isEditing ? (
        <Box sx={{ display: 'flex', flex: 1, gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onSave();
              }
            }}
            autoFocus
            sx={{ 
              '& .MuiInputBase-input': {
                color: 'text.secondary'
              }
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={onSave}
            sx={{ color: 'white', minWidth: 'unset' }}
          >
            Save
          </Button>
        </Box>
      ) : (
        <Typography flex={1} color="text.secondary">{content}</Typography>
      )}
      {!isEditing && (
        <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary' }}>
          <EditIcon />
        </IconButton>
      )}
      <IconButton size="small" onClick={onRemove} sx={{ color: 'text.secondary' }}>
        <DeleteOutlineIcon />
      </IconButton>
    </ListItemContainer>
  );
}; 