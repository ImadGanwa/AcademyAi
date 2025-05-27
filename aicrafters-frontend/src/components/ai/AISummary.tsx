import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import MarkdownRenderer from '../common/MarkdownRenderer';

const SummaryContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const SummaryHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background-color: ${props => props.theme.palette.primary.main};
  color: #fff;
`;

const StyledTabs = styled(Tabs)`
  background-color: #f0f2f7;
  
  .MuiTab-root {
    text-transform: none;
    font-weight: 500;
    min-width: 100px;
    transition: all 0.2s;
  }
`;

const SummaryContent = styled(Box)`
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

const MessageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 16px;
`;

interface AISummaryProps {
  summaries: {
    videoSummary: string | null;
    sectionSummary: string;
    courseSummary: string;
  };
  loading: boolean;
  error: string | null;
}

export const AISummary: React.FC<AISummaryProps> = ({
  summaries,
  loading,
  error
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <CircularProgress size={30} />
          <Typography variant="body2" color="textSecondary">
            Loading summary...
          </Typography>
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
    
    const currentSummary = 
      activeTab === 0 ? summaries.videoSummary :
      activeTab === 1 ? summaries.sectionSummary :
      summaries.courseSummary;
    
    if (!currentSummary) {
      const tabNames = ['video', 'section', 'course'];
      const tabName = tabNames[activeTab];
      
      // Special handling for video summary
      if (activeTab === 0) {
        return (
          <MessageContainer>
            <Alert severity="info" sx={{ width: '100%' }}>
              No video summary available. 
            </Alert>
          </MessageContainer>
        );
      }
      
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            No {tabName} summary available.
          </Alert>
        </Box>
      );
    }
    
    return <MarkdownRenderer content={currentSummary} />;
  };
  
  return (
    <SummaryContainer elevation={0}>
      <SummaryHeader>
        <Typography variant="subtitle1" fontWeight={600}>
          Summary
        </Typography>
      </SummaryHeader>
      
      <StyledTabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        aria-label="summary tabs"
      >
        <Tab 
          label="Video" 
          id="summary-tab-0" 
          aria-controls="summary-tabpanel-0"
        />
        <Tab 
          label="Section" 
          id="summary-tab-1" 
          aria-controls="summary-tabpanel-1" 
        />
        <Tab 
          label="Course" 
          id="summary-tab-2" 
          aria-controls="summary-tabpanel-2" 
        />
      </StyledTabs>
      
      <SummaryContent
        role="tabpanel"
        id={`summary-tabpanel-${activeTab}`}
        aria-labelledby={`summary-tab-${activeTab}`}
      >
        {renderContent()}
      </SummaryContent>
    </SummaryContainer>
  );
};

export default AISummary; 