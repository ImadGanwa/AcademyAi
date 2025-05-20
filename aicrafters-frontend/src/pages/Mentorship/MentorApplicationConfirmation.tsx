import React from 'react';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { Layout } from '../../components/layout/Layout/Layout';
import { useTranslation } from 'react-i18next';

// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: #fff;
`;

const ConfirmationCard = styled.div`
  max-width: 600px;
  width: 100%;
  margin: 40px 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Title = styled(Typography)`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.title};
  margin-bottom: 15px;
  text-align: center;
`;

const Subtitle = styled(Typography)`
  font-size: 18px;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.6;
`;

const ImageContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 20px 0 40px;
  display: flex;
  justify-content: center;
`;

const InfoContainer = styled.div`
  background-color: ${props => `${props.theme.palette.primary.main}08`};
  border-radius: 8px;
  padding: 25px;
  width: 100%;
  margin: 20px 0;
`;

const NextStepTitle = styled(Typography)`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.palette.text.title};
  margin-bottom: 15px;
`;

const NextStepList = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
  
  & li {
    margin-bottom: 10px;
    color: ${props => props.theme.palette.text.secondary};
    line-height: 1.5;
  }
  
  & li::marker {
    color: ${props => props.theme.palette.primary.main};
  }
`;

const MentorApplicationConfirmation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout title={t('mentorship.applicationSubmittedTitle') as string}>
      <PageContainer>
        <ConfirmationCard>
          <Title variant="h2">
            {t('mentorship.applicationSubmittedThankYou')}
          </Title>
          
          <Subtitle>
            {t('mentorship.applicationSubmittedSubtitle')}
          </Subtitle>
          
          <ImageContainer>
            <img 
              src="/mentor_confirm.png" 
              alt={t('mentorship.alt.mentorApplicationConfirmation', 'Mentor application confirmation') as string} 
              style={{ width: '100%', height: 'auto' }}
            />
          </ImageContainer>
          
          <InfoContainer>
            <NextStepTitle>{t('mentorship.applicationNextStepsTitle')}</NextStepTitle>
            <NextStepList>
              <li>{t('mentorship.applicationNextStep1')}</li>
              <li>{t('mentorship.applicationNextStep2')}</li>
              <li>{t('mentorship.applicationNextStep3')}</li>
            </NextStepList>
          </InfoContainer>
        </ConfirmationCard>
      </PageContainer>
    </Layout>
  );
};

export default MentorApplicationConfirmation; 