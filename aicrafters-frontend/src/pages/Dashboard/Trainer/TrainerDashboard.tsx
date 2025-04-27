import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Outlet, Routes, Route, Navigate } from 'react-router-dom';
import { TrainerSidebar } from './components/TrainerSidebar';
import { Layout } from '../../../components/layout/Layout/Layout';
import styled from 'styled-components';
import MenuIcon from '@mui/icons-material/Menu';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Courses } from './pages/Courses';
import { Users } from './pages/Users';
import { AddCourse } from './pages/AddCourse';

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

export const TrainerDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    <Layout title="Trainer Dashboard">
      <DashboardContainer>
        <TrainerSidebar
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
              <Route path="/" element={<Navigate to="courses" replace />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/add" element={<AddCourse />} />
              <Route path="courses/edit/:courseId" element={<AddCourse />} />
              <Route path="users" element={<Users />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings/*" element={<Settings />} />
            </Routes>
          </ContentWrapper>
        </MainContent>
      </DashboardContainer>
    </Layout>
  );
}; 