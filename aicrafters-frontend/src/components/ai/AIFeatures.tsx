import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Tabs, Tab, IconButton, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import AIChat from './AIChat';
import AITranscript from './AITranscript';
import AISummary from './AISummary';
import AIMindMap from './AIMindMap';
import { useAIFeatures } from '../../hooks/useAIFeatures';

const AIFeaturesContainer = styled(Box)<{ expanded: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  height: ${props => props.expanded ? '100%' : '56px'};
  transition: height 0.3s ease-in-out;
  border-radius: 10px;
  overflow: hidden;
  background: ${props => props.theme.palette.background.paper};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
`;

const TabContainer = styled(Box)`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
  width: 100%;
`;

const StyledTabs = styled(Tabs)`
  flex: 1;
  
  .MuiTab-root {
    color: rgba(255, 255, 255, 0.7);
    text-transform: none;
    min-width: 0;
    padding: 16px;
    transition: all 0.2s;
    flex: 1;
    
    &.Mui-selected {
      color: white;
    }
  }
  
  .MuiTabs-indicator {
    background-color: white;
  }
`;

const ContentContainer = styled(Box)`
  flex: 1;
  overflow: hidden;
`;

const ToggleButton = styled(IconButton)`
  position: absolute;
  right: 16px;
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
  z-index: 100;
  padding: 4px;
  width: 24px;
  height: 24px;
  bottom: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.palette.primary.dark};
  }
`;

interface AIFeaturesProps {
  courseId: string;
  videoUrl: string;
}

export const AIFeatures: React.FC<AIFeaturesProps> = ({ courseId, videoUrl }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Initialize AI features
  const {
    // Chat
    messages,
    chatLoading,
    chatError,
    sendMessage,
    
    // Transcript
    transcript,
    transcriptLoading,
    transcriptError,
    fetchTranscript,
    
    // Summaries
    summaries,
    summariesLoading, 
    summariesError,
    fetchSummaries,
    
    // Mind Map
    mindMap,
    mindMapLoading,
    mindMapError,
    fetchMindMap,
  } = useAIFeatures({ courseId, videoUrl });
  
  // Handle tab change and fetch data if needed
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Fetch data based on selected tab if not already loaded
    if (newValue === 1 && !transcript && !transcriptLoading) {
      fetchTranscript();
    } else if (newValue === 2 && !summaries.videoSummary && !summariesLoading) {
      fetchSummaries();
    } else if (newValue === 3 && !mindMap && !mindMapLoading) {
      fetchMindMap();
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const renderContent = () => {
    if (!expanded) return null;
    
    switch (activeTab) {
      case 0:
        return (
          <AIChat
            messages={messages}
            loading={chatLoading}
            error={chatError}
            onSendMessage={sendMessage}
          />
        );
      case 1:
        return (
          <AITranscript
            transcript={transcript}
            loading={transcriptLoading}
            error={transcriptError}
          />
        );
      case 2:
        return (
          <AISummary
            summaries={summaries}
            loading={summariesLoading}
            error={summariesError}
          />
        );
      case 3:
        return (
          <AIMindMap
            mindMap={mindMap}
            loading={mindMapLoading}
            error={mindMapError}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <AIFeaturesContainer expanded={expanded}>
      <TabContainer>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab 
            icon={<SmartToyOutlinedIcon fontSize="small" />} 
            label={!isMobile ? "AI Coach" : undefined}
            aria-label="AI Coach"
          />
          <Tab 
            icon={<TextSnippetOutlinedIcon fontSize="small" />} 
            label={!isMobile ? "Transcript" : undefined}
            aria-label="Transcript"
          />
          <Tab 
            icon={<SummarizeOutlinedIcon fontSize="small" />} 
            label={!isMobile ? "Summary" : undefined}
            aria-label="Summary"
          />
          <Tab 
            icon={<AccountTreeOutlinedIcon fontSize="small" />} 
            label={!isMobile ? "Mind Map" : undefined}
            aria-label="Mind Map"
          />
        </StyledTabs>
        
        {!isMobile && (
          <IconButton 
            size="small" 
            onClick={toggleExpanded}
            sx={{ 
              color: 'white', 
              mr: 1,
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        )}
      </TabContainer>
      
      <ContentContainer>
        {renderContent()}
      </ContentContainer>
      
      {isMobile && (
        <ToggleButton onClick={toggleExpanded} size="small">
          {expanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />}
        </ToggleButton>
      )}
    </AIFeaturesContainer>
  );
};

export default AIFeatures; 