import React from 'react';
import styled from 'styled-components';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
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
  justify-content: center;
  align-items: center;
  min-height: 200px;
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
        </LoadingContainer>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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