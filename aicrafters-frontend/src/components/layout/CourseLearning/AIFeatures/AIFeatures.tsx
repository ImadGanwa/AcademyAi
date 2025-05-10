import React, { useState } from 'react';
import styled from 'styled-components';
import { Tab, Tabs, Box, Paper, IconButton, useMediaQuery, Fab, Drawer } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MindMap from './MindMap';
import Transcription from './Transcription';
import TrainerChat from './TrainerChat';

// Define our tab panels and their content
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      style={{ height: '100%', display: value === index ? 'block' : 'none' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `ai-tab-${index}`,
    'aria-controls': `ai-tabpanel-${index}`,
  };
}

const Container = styled.div<{ isExpanded: boolean }>`
  background-color: #f9f9f9;
  border-radius: 12px;
  max-height: ${props => props.isExpanded ? 'calc(90vh - 64px)' : '40px'};
  height: ${props => props.isExpanded ? 'calc(90vh - 64px)' : '40px'};
  overflow: hidden;
  transition: max-height 0.3s ease, height 0.3s ease;
  position: relative;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
  border-radius: 12px 12px 0 0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Content = styled.div<{ isExpanded: boolean }>`
  height: calc(100% - 40px);
  display: ${props => props.isExpanded ? 'flex' : 'none'};
  flex-direction: column;
`;

const TabsContainer = styled.div`
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
`;

const StyledTabs = styled(Tabs)`
  & .MuiTabs-indicator {
    height: 3px;
  }
`;

const StyledTab = styled(Tab)`
  text-transform: none;
  font-weight: 600;
  min-height: 48px;
`;

const TabContent = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  padding: 16px;
`;

const MobileFab = styled(Fab)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
`;

interface AIFeaturesProps {
  courseId: string;
  videoUrl: string;
}

const AIFeatures: React.FC<AIFeaturesProps> = ({ courseId, videoUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMobileOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  const renderContent = () => (
    <>
      <TabsContainer>
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <StyledTab label="AI Assistant" {...a11yProps(0)} />
          <StyledTab label="Transcript & Summary" {...a11yProps(1)} />
          <StyledTab label="Mind Map" {...a11yProps(2)} />
        </StyledTabs>
      </TabsContainer>
      <TabContent>
        <TabPanel value={activeTab} index={0}>
          <TrainerChat 
            courseId={courseId} 
            videoUrl={videoUrl}
            onClose={isMobile ? handleMobileClose : undefined}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Transcription 
            courseId={courseId} 
            videoUrl={videoUrl}
            onClose={isMobile ? handleMobileClose : undefined}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <MindMap 
            courseId={courseId} 
            videoUrl={videoUrl}
            onClose={isMobile ? handleMobileClose : undefined}
          />
        </TabPanel>
      </TabContent>
    </>
  );

  // Mobile version with drawer
  if (isMobile) {
    return (
      <>
        <MobileFab
          color="primary"
          aria-label="AI features"
          onClick={handleMobileOpen}
        >
          <PsychologyIcon />
        </MobileFab>
        
        <Drawer
          anchor="bottom"
          open={mobileOpen}
          onClose={handleMobileClose}
          PaperProps={{
            sx: {
              height: 'calc(100% - 56px)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
            }
          }}
        >
          {renderContent()}
        </Drawer>
      </>
    );
  }

  // Desktop version with expandable panel
  return (
    <Container isExpanded={isExpanded}>
      <Header onClick={toggleExpand}>
        <Title>
          <PsychologyIcon fontSize="small" />
          AI Learning Tools
        </Title>
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Header>
      <Content isExpanded={isExpanded}>
        {renderContent()}
      </Content>
    </Container>
  );
};

export default AIFeatures; 