import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  styled,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MindMap from './MindMap';

interface MindMapModalProps {
  open: boolean;
  onClose: () => void;
  markdown: string;
  title?: string;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(0), // Adjusted for full bleed content
    overflow: 'hidden', // Ensure content doesn't overflow dialog padding
  },
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '1200px', // Max width
    height: '80vh', // Default height
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2.5),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  minHeight: '300px', // Ensure loading takes some space
});

const ErrorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  color: theme.palette.error.main,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
}));

const MindMapModal: React.FC<MindMapModalProps> = ({ open, onClose, markdown, title }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // Changed to sm for better mobile experience
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);
  
  useEffect(() => {
    if (open) {
      setInternalLoading(true);
      setInternalError(null);
      
      if (!markdown || markdown.trim() === '' || markdown.includes('No content available')) {
        setInternalError('No mind map data available. Please ensure the video has a transcription and try generating again.');
        setInternalLoading(false); // Stop loading if there is an error
        return;
      }
      
      // Simulate a loading period for MindMap component to initialize
      const timer = setTimeout(() => {
        setInternalLoading(false);
      }, 500); // Increased timeout slightly
      
      return () => clearTimeout(timer);
    }
  }, [open, markdown]);
  
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      aria-labelledby="mind-map-dialog-title"
    >
      <StyledDialogTitle id="mind-map-dialog-title">
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>{title || 'Mind Map'}</Typography>
        <CloseButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </StyledDialogTitle>
      <DialogContent dividers sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {internalLoading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : internalError ? (
          <ErrorContainer>
            <Typography variant="h5" component="div" color="error" sx={{ mb: 1}}>
              Could not load Mind Map
            </Typography>
            <Typography variant="body1">
              {internalError}
            </Typography>
          </ErrorContainer>
        ) : (
          <MindMap markdown={markdown} />
        )}
      </DialogContent>
    </StyledDialog>
  );
};

export default MindMapModal; 