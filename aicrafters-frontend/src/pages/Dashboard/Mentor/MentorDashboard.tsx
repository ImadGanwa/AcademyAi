import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout/Layout';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';
import { MentorSidebar } from './components/MentorSidebar';
import { Mentees } from './pages/Mentees';
import { Messages } from './pages/Messages';
import { Availability } from './pages/Availability';
import { Settings } from './pages/Settings';
import { useTranslation } from 'react-i18next';

const DashboardContainer = styled(Box)`
  display: flex;
  min-height: 100vh;
  background: #FFFFFF;
  position: relative;
`;

const MainContent = styled(Box)<{ $isSidebarOpen: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 24px;
  background: #FFFFFF;
  margin-left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '0' : '0')};
  transition: margin-left 0.3s ease;

  @media (max-width: 1024px) {
    padding: 16px;
    margin-left: 0;
  }
`;

const ContentWrapper = styled(Box)`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const MobileMenuButton = styled(IconButton)`
  display: none !important;
  position: fixed !important;
  top: 80px;
  left: 20px;
  z-index: 1200;
  background: none !important;
  color: ${({ theme }) => theme.palette.text.title} !important;
  padding: 8px !important;

  @media (max-width: 1024px) {
    display: flex !important;
  }
`;

export const MentorDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <Layout title={t('mentorship.dashboardTitle', 'Mentor Dashboard') as string}>
      <DashboardContainer>
        <MentorSidebar
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
          onToggle={handleSidebarToggle}
        />
        <MobileMenuButton onClick={handleMobileSidebarToggle}>
          <MenuIcon />
        </MobileMenuButton>
        <MainContent $isSidebarOpen={isSidebarOpen}>
          <ContentWrapper>
            <Routes>
              <Route path="/" element={<Navigate to="mentees" replace />} />
              <Route path="mentees" element={<Mentees />} />
              <Route path="messages" element={<Messages />} />
              <Route path="availability" element={<Availability />} />
              <Route path="settings/*" element={<Settings />} />
            </Routes>
          </ContentWrapper>
        </MainContent>
      </DashboardContainer>
    </Layout>
  );
}; 