import React from 'react';
import styled from 'styled-components';
import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CartItemsList } from '../../components/layout/Cart/CartItemsList';
import { CartSummary } from '../../components/layout/Cart/CartSummary';
import { useLanguageRoute } from '../../hooks/useLanguageRoute';

const PageWrapper = styled(Container)`
  padding: 40px;
  max-width: 1200px !important;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 0;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 40px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MainContent = styled.div`
  width: 66%;

  @media (max-width: 768px) {
    padding-right: 0;
    width: 100%;
  }
`;

const SideContent = styled.div`
  width: 34%;
  background: #FFFFFF;
  border-radius: 12px;
  height: fit-content;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PageTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: bold !important;
  color: ${props => props.theme.palette.text.title} !important;
  margin: 24px 0 30px !important;

  @media (max-width: 768px) {
    font-size: 1.5rem !important;
  }
`;

export const CartPage: React.FC = () => {
  const { t } = useTranslation();
  useLanguageRoute();

  return (
    <PageWrapper maxWidth="lg">
      <PageTitle variant="h1">
        {t('common.cart.title')}
      </PageTitle>
      <ContentWrapper>
        <MainContent>
          <CartItemsList />
        </MainContent>
        <SideContent>
          <CartSummary />
        </SideContent>
      </ContentWrapper>
    </PageWrapper>
  );
}; 