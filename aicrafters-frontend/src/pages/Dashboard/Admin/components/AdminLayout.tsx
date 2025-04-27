import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.palette.background.default};
`;

const MainContent = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const AdminLayout: React.FC = () => {
  return (
    <LayoutContainer>
      <AdminSidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}; 