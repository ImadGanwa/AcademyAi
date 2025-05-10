import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Paper, Typography, CircularProgress, Tabs, Tab, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../services/api';

const TranscriptionContainer = styled(Paper)<{ isFullscreen: boolean }>`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: ${props => props.isFullscreen ? '100%' : '100%'};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: ${props => props.isFullscreen ? 'fixed' : 'relative'};
  top: ${props => props.isFullscreen ? '0' : 'auto'};
  left: ${props => props.isFullscreen ? '0' : 'auto'};
  right: ${props => props.isFullscreen ? '0' : 'auto'};
  bottom: ${props => props.isFullscreen ? '0' : 'auto'};
  z-index: ${props => props.isFullscreen ? '9999' : '1'};
  background-color: white;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled(Typography)`
  font-weight: 600;
  color: ${props => props.theme.palette.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  font-size: 0.95rem;
  white-space: pre-wrap;
  line-height: 1.6;
`;

const ErrorMessage = styled(Typography)`
  color: ${props => props.theme.palette.error.main};
  margin: 16px 0;
  text-align: center;
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  min-width: 100px;
  font-weight: 500;
`;

const SummarySection = styled.div`
  margin-bottom: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SummaryTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.palette.primary.main};
`;

const SummaryContent = styled(Typography)`
  white-space: pre-line;
  line-height: 1.6;
`;

interface TranscriptionProps {
  courseId: string;
  videoUrl: string;
  onClose?: () => void;
}

type TabType = 'transcription' | 'summaries';

interface TranscriptionData {
  transcription: string;
  videoSummary?: string;
  sectionSummary?: string;
  courseSummary?: string;
}

const Transcription: React.FC<TranscriptionProps> = ({ courseId, videoUrl, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('transcription');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TranscriptionData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const encodedVideoUrl = encodeURIComponent(videoUrl);
        
        // Fetch transcription
        const transcriptionResponse = await api.get(`/api/transcriptions/courses/${courseId}/videos/${encodedVideoUrl}`);
        
        if (!transcriptionResponse.data?.transcription) {
          throw new Error('No transcription found');
        }
        
        let summaries = {};
        
        try {
          // Fetch summaries if available
          const summaryResponse = await api.get(`/api/summaries/courses/${courseId}/videos/${encodedVideoUrl}`);
          if (summaryResponse.data) {
            summaries = {
              videoSummary: summaryResponse.data.videoSummary,
              sectionSummary: summaryResponse.data.sectionSummary,
              courseSummary: summaryResponse.data.courseSummary,
            };
          }
        } catch (summaryError) {
          console.log('No summaries available, continuing with transcription only');
        }
        
        setData({
          transcription: transcriptionResponse.data.transcription,
          ...summaries
        });
        
      } catch (err: any) {
        console.error('Transcription error:', err);
        setError(err.message || 'Failed to load transcription');
        setActiveTab('transcription');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, videoUrl]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <CircularProgress />
        </div>
      );
    }

    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    if (!data) {
      return <ErrorMessage>No data available</ErrorMessage>;
    }

    if (activeTab === 'transcription') {
      return (
        <ContentContainer>
          {data.transcription}
        </ContentContainer>
      );
    }

    // Summaries tab
    return (
      <ContentContainer>
        {data.videoSummary && (
          <SummarySection>
            <SummaryTitle variant="h6">Video Summary</SummaryTitle>
            <SummaryContent variant="body2">{data.videoSummary}</SummaryContent>
          </SummarySection>
        )}
        
        {data.sectionSummary && (
          <SummarySection>
            <SummaryTitle variant="h6">Section Summary</SummaryTitle>
            <SummaryContent variant="body2">{data.sectionSummary}</SummaryContent>
          </SummarySection>
        )}
        
        {data.courseSummary && (
          <SummarySection>
            <SummaryTitle variant="h6">Course Summary</SummaryTitle>
            <SummaryContent variant="body2">{data.courseSummary}</SummaryContent>
          </SummarySection>
        )}
        
        {!data.videoSummary && !data.sectionSummary && !data.courseSummary && (
          <ErrorMessage>No summaries available</ErrorMessage>
        )}
      </ContentContainer>
    );
  };

  return (
    <TranscriptionContainer isFullscreen={isFullscreen}>
      <Header>
        <Title variant="h6">
          <DescriptionIcon color="primary" />
          Transcription & Summaries
        </Title>
        <Controls>
          <IconButton onClick={toggleFullscreen} size="small">
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Controls>
      </Header>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{ marginBottom: 2 }}
      >
        <StyledTab value="transcription" label="Transcription" />
        <StyledTab value="summaries" label="Summaries" disabled={!data?.videoSummary && !data?.sectionSummary && !data?.courseSummary} />
      </Tabs>
      
      <Divider sx={{ marginBottom: 2 }} />
      
      {renderContent()}
    </TranscriptionContainer>
  );
};

export default Transcription; 