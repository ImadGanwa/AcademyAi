import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminOverview } from './pages/AdminOverview';
import { UserManagement } from './pages/UserManagement';
import { CourseManagement } from './pages/CourseManagement';
import { CategoryManagement } from './pages/CategoryManagement';
import { AdminSettings } from './pages/AdminSettings';
import { CertificateSettings } from './pages/CertificateSettings';
import { NewsletterPage } from './pages/NewsletterPage';
import { Notifications } from './pages/Notifications';
import OrganizationManagement from './pages/OrganizationManagement';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Layout } from '../../../components/layout/Layout/Layout';
import { Courses } from '../Trainer/pages/Courses';
import { AddCourse } from '../Trainer/pages/AddCourse';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${props => props.theme.palette.background.paper};
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout title="Admin Dashboard">
      <DashboardContainer>
        <AdminSidebar />
        <ContentWrapper>
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users/*" element={<UserManagement />} />
            <Route path="organizations" element={<OrganizationManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="my-courses" element={<Courses />} />
            <Route path="my-courses/add" element={<AddCourse />} />
            <Route path="my-courses/edit/:courseId" element={<AddCourse />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="certificate-settings" element={<CertificateSettings />} />
            <Route path="newsletter" element={<NewsletterPage />} />
          </Routes>
        </ContentWrapper>
      </DashboardContainer>
    </Layout>
  );
}; 