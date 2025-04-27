import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import styled from 'styled-components';
import ConstructionIcon from '@mui/icons-material/Construction';
import TimerIcon from '@mui/icons-material/Timer';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Layout } from '../../components/layout/Layout/Layout';
import { useTranslation } from 'react-i18next';

interface PlaceholderPageProps {
  pageName: string;
}

const StyledContainer = styled(Container)`
  padding: 64px 24px;
  min-height: calc(100vh - 300px); // Adjust based on your header/footer height
`;

const ContentPaper = styled(Paper)`
  padding: 48px;
  text-align: center;
  background-color: ${props => props.theme.palette.background.paper};
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const IconWrapper = styled(Box)`
  margin-bottom: 24px;
  svg {
    font-size: 64px;
    color: ${props => props.theme.palette.primary.main};
  }
`;

const Title = styled(Typography)`
  && {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    background: linear-gradient(45deg, ${props => props.theme.palette.primary.main}, ${props => props.theme.palette.secondary.main});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Subtitle = styled(Typography)`
  && {
    font-size: 1.25rem;
    color: ${props => props.theme.palette.text.secondary};
    margin-bottom: 32px;
  }
`;

const FeaturesContainer = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 48px;
  flex-wrap: wrap;
`;

const FeatureBox = styled(Box)`
  text-align: center;
  max-width: 250px;

  svg {
    font-size: 32px;
    color: ${props => props.theme.palette.primary.main};
    margin-bottom: 16px;
  }
`;

const FeatureTitle = styled(Typography)`
  && {
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.theme.palette.text.primary};
  }
`;

const FeatureDescription = styled(Typography)`
  && {
    color: ${props => props.theme.palette.text.secondary};
    font-size: 0.875rem;
  }
`;

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ pageName }) => {
  const { t } = useTranslation();
  return (
    <Layout title={pageName}>
      <StyledContainer maxWidth="lg">
        <ContentPaper elevation={0}>
          <IconWrapper>
            <ConstructionIcon />
          </IconWrapper>
          <Title variant="h1">
            {pageName}
          </Title>
          <Subtitle variant="h5">
            {t('placeholder.subtitle')}
          </Subtitle>

          <FeaturesContainer>
            <FeatureBox>
              <TimerIcon />
              <FeatureTitle variant="h6">
                {t('placeholder.comingSoon')}
              </FeatureTitle>
              <FeatureDescription>
                {t('placeholder.featureDescription')}
              </FeatureDescription>
            </FeatureBox>

            <FeatureBox>
              <NotificationsActiveIcon />
              <FeatureTitle variant="h6">
                {t('placeholder.stayTuned')}
              </FeatureTitle>
              <FeatureDescription>
                {t('placeholder.featureDescription')}
              </FeatureDescription>
            </FeatureBox>
          </FeaturesContainer>
        </ContentPaper>
      </StyledContainer>
    </Layout>
  );
}; 