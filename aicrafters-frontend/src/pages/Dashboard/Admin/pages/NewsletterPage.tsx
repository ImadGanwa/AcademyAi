import React from 'react';
import styled from 'styled-components';
import { NewsletterSection } from '../../../../components/layout/Admin/NewsletterSection';
import { useTranslation } from 'react-i18next';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: ${props => props.theme.palette.text.title};
  margin: 0;
`;

export const NewsletterPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('admin.newsletter.title')}</PageTitle>
      </PageHeader>
      <NewsletterSection />
    </PageContainer>
  );
}; 