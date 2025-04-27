import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface SectionHeaderProps {
  id: string;
  title: string;
  isCollapsed?: boolean;
  isEditing: boolean;
  editTitle: string;
  onToggleCollapse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditTitleChange: (title: string) => void;
  onSaveTitle: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  id,
  title,
  isCollapsed = false,
  isEditing,
  editTitle,
  onToggleCollapse,
  onEdit,
  onDelete,
  onEditTitleChange,
  onSaveTitle,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={onToggleCollapse}
          sx={{ p: 0.5 }}
        >
          {isCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </IconButton>
        
        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              size="small"
              sx={{ 
                minWidth: 200,
                '& .MuiInputBase-input': {
                  color: 'text.secondary'
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'secondary.main'
                  }
                }
              }}
              autoFocus
            />
            <Button
              variant="contained"
              size="small"
              onClick={onSaveTitle}
              sx={{ 
                minWidth: 'auto', 
                px: 2,
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'secondary.dark'
                }
              }}
            >
              Save
            </Button>
          </Box>
        ) : (
          <Typography variant="h6" sx={{ color: 'text.title' }}>
            {title}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton
          size="small"
          onClick={onEdit}
          sx={{ p: 1 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{ p: 1 }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}; 