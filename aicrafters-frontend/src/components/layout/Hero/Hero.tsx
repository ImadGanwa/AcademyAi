import React from 'react';
import { Box, Typography, Container, Snackbar, Alert } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
// import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { ReactComponent as HeroLogo } from '../../../assets/images/hero-logo.svg';
// import { ReactComponent as EmailIcon } from '../../../assets/icons/email.svg';
import axios from 'axios';
import config from '../../../config';

const HeroSection = styled.section`
  width: 100%;
  background-color: ${props => props.theme.palette.background.default};
  padding: 60px 0;

  @media (max-width: 768px) {
    padding: 30px 0 40px;
  }
`;

const HeroContainer = styled(Container)`
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 60px !important;

  @media (max-width: 768px) {
    flex-direction: column !important;
    gap: 32px !important;
    text-align: center !important;
  }
`;

const ContentWrapper = styled(Box)`
  flex: 1;
  max-width: 600px;

  @media (max-width: 768px) {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const Title = styled(Typography)`
  font-size: 2.5rem !important;
  font-weight: bold !important;
  line-height: 1.2 !important;
  margin-bottom: 24px !important;
  color: #ffffff !important;

  @media (max-width: 768px) {
    font-size: 2rem !important;
    margin-bottom: 16px !important;
  }
`;

const Highlight = styled.span`
  color: ${props => props.theme.palette.secondary.main};
`;

const Description = styled(Typography)`
  font-size: 1.1rem !important;
  color: #ffffff !important;
  margin-bottom: 40px !important;
  line-height: 1.4 !important;
  padding-right: 20px;

  @media (max-width: 768px) {
    padding-right: 0;
    font-size: 1rem !important;
    margin-bottom: 30px !important;
    max-width: 90%;
  }
`;

// const StyledInput = styled(Input)`
//   && {
//     .MuiOutlinedInput-root {
//       background-color: ${props => props.theme.palette.background.secondary};
//       border: 1px solid #203962;
//       border-radius: 8px;

//       &:hover {
//         border-color: ${props => props.theme.palette.primary.main};
//       }
      
//       .MuiOutlinedInput-input {
//         color: white;
//         &::placeholder {
//           color: rgba(255, 255, 255, 0.7);
//           opacity: 1;
//         }
//       }

//       .MuiInputAdornment-root {
//         svg {
//           color: white;
//         }
//       }

//       .MuiOutlinedInput-notchedOutline {
//         border: none;
//       }
//     }
//   }
// `;

const InputWrapper = styled(Box)`
  display: flex;
  gap: 16px;
  max-width: 500px;
  justify-content: flex-start; 
  width: 100%; 

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100%; 
    align-items: center; 

    & > a {
      display: flex; 
      justify-content: center !important; 
      width: 80%; 
      max-width: 300px; 
    }
  }
`;

const StyledLogo = styled(HeroLogo)`
  width: 320px;
  height: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileLogoWrapper = styled(Box)`
  display: none;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    
    svg {
      width: 220px;
      height: auto;
    }
  }
`;

const StyledButton = styled(Button)`
  && {
    min-width: 120px;
    font-size: 1.2rem;
    padding: 12px 40px; 
    border-radius: 30px;
    font-weight: 600;
    
    @media (max-width: 768px) {
      padding: 14px 0; 
      font-size: 1.2rem;
      width: 80%; 
      max-width: 300px;
    }
  }
`;

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubscribe = async () => {
    if (!email) {
      setSnackbar({
        open: true,
        message: t('home.hero.emailRequired'),
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${config.API_URL}/api/newsletter/subscribe`, { email });
      
      setSnackbar({
        open: true,
        message: t('home.hero.subscribeSuccess'),
        severity: 'success'
      });
      setEmail('');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || t('home.hero.subscribeError'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <HeroSection>
      <HeroContainer maxWidth="lg">
        <ContentWrapper>
          <MobileLogoWrapper>
            <HeroLogo />
          </MobileLogoWrapper>
          <Title variant="h1">
            <Highlight>{t('home.hero.titleHighlight')}</Highlight>{' '}
            {t('home.hero.titleEnd')}
          </Title>
          <Description>
            {t('home.hero.description')}
          </Description>
          {/* <InputWrapper>
            <a 
              href="https://adwin.global/join-adwin/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'flex', justifyContent: 'flex-start' }}
            >
              <StyledButton
                variant="contained"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('home.hero.connectToday')}
              </StyledButton>
            </a>
          </InputWrapper> */}
        </ContentWrapper>
        <StyledLogo />
      </HeroContainer>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </HeroSection>
  );
}; 