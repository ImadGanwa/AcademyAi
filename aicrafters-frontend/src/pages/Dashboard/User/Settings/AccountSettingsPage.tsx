import React from 'react';
import styled from 'styled-components';
import { Container } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout } from '../../../../components/layout/Layout/Layout';
import { AccountSettingsSidebar } from '../../../../components/layout/AccountSettings/AccountSettingsSidebar';
import { AccountSettingsContent } from '../../../../components/layout/AccountSettings/AccountSettingsContent';
import { RootState } from '../../../../store';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme.palette.background.paper};
`;

const MainContentWrapper = styled(Container)`
  display: flex !important;
  gap: 24px;
  padding: 48px 24px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 24px 16px;
    gap: 24px;
  }
`;

export const AccountSettingsPage: React.FC = () => {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return null;
  }

  return (
    <Layout title="Account Settings">
      <PageWrapper>
        <MainContentWrapper maxWidth="lg">
          <AccountSettingsSidebar />
          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="*" element={<AccountSettingsContent />} />
          </Routes>
        </MainContentWrapper>
      </PageWrapper>
    </Layout>
  );
}; 