import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { Footer } from '../Footer/Footer';

const LayoutContainer = styled.div`
  min-height: calc(100vh - 64px); // Subtract navbar height
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const pageTitle = title ? `AiCrafters - ${title}` : 'AiCrafters';
  
  return (
    <LayoutContainer>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <Main>{children}</Main>
      <Footer />
    </LayoutContainer>
  );
}; 