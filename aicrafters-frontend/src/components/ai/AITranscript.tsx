import React from 'react';
import styled from 'styled-components';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import MarkdownRenderer from '../common/MarkdownRenderer';

const TranscriptContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const TranscriptHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background-color: ${props => props.theme.palette.primary.main};
  color: #fff;
`;

const TranscriptContent = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9fafc;
  
  p {
    margin-bottom: 16px;
    line-height: 1.7;
  }
`;

const LoadingContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  gap: 16px;
`;

interface AITranscriptProps {
  transcript: string;
  loading: boolean;
  error: string | null;
}

export const AITranscript: React.FC<AITranscriptProps> = ({
  transcript,
  loading,
  error
}) => {
  
  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <CircularProgress size={30} />
          <Typography variant="body2" color="textSecondary">
            Loading transcript...
          </Typography>
        </LoadingContainer>
      );
    }
    
    if (error) {
      const isProcessing = error.toLowerCase().includes('processing') || 
                           error.toLowerCase().includes('check back');
      
      return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity={isProcessing ? "info" : "error"} 
            sx={{ mb: 2 }}
          >
            {error.includes('token') ? 
              'Authentication error: Please log in again or contact support.' : 
              error}
          </Alert>
          
          {isProcessing && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                This video transcript is being generated. Please check back soon.
              </Typography>
            </Box>
          )}
        </Box>
      );
    }
    
    if (!transcript) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            No transcript available for this video.
          </Alert>
        </Box>
      );
    }
    
    return <MarkdownRenderer content={transcript} />;
  };
  
  return (
    <TranscriptContainer elevation={0}>
      <TranscriptHeader>
        <Typography variant="subtitle1" fontWeight={600}>
          Transcript
        </Typography>
      </TranscriptHeader>
      
      <TranscriptContent>
        {renderContent()}
      </TranscriptContent>
    </TranscriptContainer>
  );
};

export default AITranscript; 