import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { api } from '../../../../services/api'; // Assuming api service is set up

interface VideoTranscriptDisplayProps {
  courseId: string;
  videoUrl: string;
  isOpen: boolean;
}

const TranscriptContainer = styled(Paper)`
  padding: ${props => props.theme.spacing(2)};
  margin-top: ${props => props.theme.spacing(2)};
  max-height: 400px;
  overflow-y: auto;
  background-color: ${props => props.theme.palette.background.paper};
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
`;

interface TranscriptResponse {
  transcription: string;
  // Add other relevant fields if the API returns more, e.g., language
}

const VideoTranscriptDisplay: React.FC<VideoTranscriptDisplayProps> = ({ courseId, videoUrl, isOpen }) => {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseId && videoUrl) {
      const fetchTranscript = async () => {
        setIsLoading(true);
        setError(null);
        setTranscript(null);
        try {
          // Encode videoUrl if it contains special characters for URL path
          const encodedVideoUrl = encodeURIComponent(videoUrl);
          const response = await api.get<TranscriptResponse>(`/transcriptions/courses/${courseId}/videos/${encodedVideoUrl}`);
          
          if (response.data && response.data.transcription) {
            setTranscript(response.data.transcription);
          } else {
            setError('No transcription content received from the server.');
          }
        } catch (err: any) {
          console.error('Error fetching transcript:', err);
          if (err.response?.status === 404) {
            setError('Transcript not found for this video. It might still be processing or not available.');
          } else {
            setError(err.message || 'Failed to fetch transcript. Please try again later.');
          }
        }
        setIsLoading(false);
      };

      fetchTranscript();
    }
  }, [courseId, videoUrl, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <TranscriptContainer elevation={2}>
      <Typography variant="h6" gutterBottom sx={{ mb: 1.5, fontWeight: 600 }}>
        Video Transcript
      </Typography>
      {isLoading && (
        <LoadingContainer>
          <CircularProgress size={30} />
        </LoadingContainer>
      )}
      {error && (
        <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>{error}</Alert>
      )}
      {transcript && !isLoading && !error && (
        <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontFamily: 'Georgia, serif' }}>
          {transcript}
        </Typography>
      )}
      {!transcript && !isLoading && !error && (
        <Typography variant="body2" color="textSecondary">
          No transcript available or an error occurred.
        </Typography>
      )}
    </TranscriptContainer>
  );
};

export default VideoTranscriptDisplay; 