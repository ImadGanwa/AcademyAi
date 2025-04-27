import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/common/Input/Input';
import { IconButton } from '../../components/common/Button/IconButton';
import { ReactComponent as Logo } from '../../assets/images/dark-logo.svg';
import { ReactComponent as EmailIcon } from '../../assets/icons/email.svg';
import { ReactComponent as GoogleIcon } from '../../assets/icons/google.svg';
import { ReactComponent as LinkedInIcon } from '../../assets/icons/linkedin.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/Message.svg';
import { SocialSignInButton } from '../../components/common/Button/SocialSignInButton';
import { RouterLink } from '../../components/common/RouterLink/RouterLink';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { Layout } from '../../components/layout/Layout/Layout';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LinkedIn } from 'react-linkedin-login-oauth2';

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  max-width: 450px;
  width: 90%;
  margin: 20px auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 20px;
    margin: 10px auto;
  }
`;

const LogoWrapper = styled(Box)`
  display: flex;
  align-items: baseline;
  justify-content: space-evenly;
  margin-top: 4rem;
  margin-bottom: 3rem;

  & svg {
  height: 3rem;
    width: 11rem;
  }

  @media (max-width: 768px) {
    margin-top: 3rem;
    margin-bottom: 2rem;
  }
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OrDivider = styled(Box)`
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #98A2B3;
  font-size: 14px;
  width: 100%;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #E4E7EC;
    margin: 0 16px;
  }
`;

const StyledLink = styled(RouterLink)`
  color: ${({ theme }) => theme.palette.primary.main};
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StyledSpan = styled.span`
  color: ${({ theme }) => theme.palette.primary.main};
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StyledIconButton = styled(IconButton)`
  && {
    background: #D710C1;
    color: white;
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
    
    &:hover {
      background: #b0009c;
    }
  }
`;

const LoginTitle = styled(Typography)`
  && {
    font-weight: bold;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.palette.text.title};
    margin-bottom: 1rem;
    padding: 0 2rem .8rem;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useLocalizedNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openOrgInfo, setOpenOrgInfo] = useState(false);

  useEffect(() => {
    // Handle LinkedIn OAuth callback
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    if (code) {
      handleLinkedInCallback(code);
    }
  }, [location]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.user) {
        // Check if email is verified
        if (!response.user.isEmailVerified) {
          toast.error(t('auth.emailNotVerified'));
          setIsLoading(false);
          return;
        }

        let dashboardPath;
        switch (response.user.role) {
          case 'admin':
            dashboardPath = '/dashboard/admin';
            break;
          case 'trainer':
            dashboardPath = '/dashboard/trainer';
            break;
          default:
            dashboardPath = '/dashboard/user/learning';
        }
        navigate(dashboardPath);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      
      const response = await authService.googleLogin(credentialResponse.credential);
      
      if (response.user) {
        toast.success(response.message || 'Successfully logged in with Google');
        
        // Determine dashboard path based on user role
        let dashboardPath;
        switch (response.user.role) {
          case 'admin':
            dashboardPath = '/dashboard/admin';
            break;
          case 'trainer':
            dashboardPath = '/dashboard/trainer';
            break;
          default:
            dashboardPath = '/dashboard/user/learning';
        }

        // Get the current language from the URL
        const lang = location.pathname.split('/')[1] || 'en';
        navigate(`/${lang}${dashboardPath}`);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      console.error('Error details:', {
        response: error.response,
        message: error.message,
        stack: error.stack
      });
      toast.error(t('auth.googleLoginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    toast.error(t('auth.googleLoginFailed'));
  };

  const handleLinkedInCallback = async (code: string) => {
    try {
      setIsLoading(true);
      
      const response = await authService.linkedinLogin(code);
      
      if (response.user) {
        toast.success(t('auth.linkedinLoginSuccess'));
        
        // Determine dashboard path based on user role
        let dashboardPath;
        switch (response.user.role) {
          case 'admin':
            dashboardPath = '/dashboard/admin';
            break;
          case 'trainer':
            dashboardPath = '/dashboard/trainer';
            break;
          default:
            dashboardPath = '/dashboard/user/learning';
        }

        // Get the current language from the URL
        const lang = location.pathname.split('/')[1] || 'en';
        navigate(`/${lang}${dashboardPath}`);
      }
    } catch (error) {
      toast.error(t('auth.linkedinLoginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = () => {
    const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
    const redirectUri = 'https://aicrafters.aicademy.com/auth/linkedin/callback';
    const scope = 'openid profile email';
    const state = Math.random().toString(36).substring(7);

    
    const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    // Calculate center position for the popup
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2 + window.screenX;
    const top = window.innerHeight / 2 - height / 2 + window.screenY;

    // Open popup
    const popup = window.open(
      linkedinUrl,
      'LinkedIn Login',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,location=yes`
    );

    if (popup) {
      // Poll for changes
      const pollTimer = setInterval(() => {
        try {
          // Check if popup is closed
          if (popup.closed) {
            clearInterval(pollTimer);
            return;
          }

          // Check if URL contains the callback
          const currentUrl = popup.location.href;
          
          if (currentUrl.includes('/auth/linkedin/callback')) {
            clearInterval(pollTimer);
            
            const urlParams = new URLSearchParams(new URL(currentUrl).search);
            const code = urlParams.get('code');
            const returnedState = urlParams.get('state');

            // Verify state to prevent CSRF
            if (code && returnedState === state) {
              handleLinkedInCallback(code);
            } else {
              toast.error(t('auth.linkedinLoginFailed'));
            }
            
            popup.close();
          }
        } catch (error) {
          // Ignore cross-origin errors
          if (error instanceof DOMException && error.name === 'SecurityError') {
            return;
          }
        }
      }, 500);

      // Cleanup on window close
      window.addEventListener('beforeunload', () => {
        clearInterval(pollTimer);
        if (!popup.closed) popup.close();
      });
    } else {
      toast.error(t('auth.popupBlocked'));
    }
  };

  const handleOpenOrgInfo = (e: React.MouseEvent<HTMLSpanElement>) => {
    setOpenOrgInfo(true);
  };

  const handleCloseOrgInfo = () => {
    setOpenOrgInfo(false);
  };

  return (
    <Layout title="Login">
      <section style={{marginBottom: '4rem'}}>
        <Container>
          <LoginTitle variant="h4" gutterBottom align="center" className='login-title'>
            {t('auth.login.title')}
          </LoginTitle>

          <Form onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startIcon={<EmailIcon />}
              fullWidth
              required
              error={!!error}
              helperText={error}
            />

            <Input
              name="password"
              type="password"
              placeholder={t('auth.signup.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              error={!!error}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: -1, mb: 1 }}>
              <RouterLink to="/forgot-password" style={{ color: theme.palette.secondary.main, textDecoration: 'none', fontSize: '0.875rem' }}>
                {t('auth.login.forgotPassword')}
              </RouterLink>
            </Box>

            <StyledIconButton
              type="submit"
              variant="contained"
              fullWidth
              icon={<MessageIcon />}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : t('auth.login.continueWithEmail')}
            </StyledIconButton>
          </Form>

          <OrDivider>
            <span>{t('common.or')}</span>
          </OrDivider>
        
          <Box width="100%" display="flex" flexDirection="column" gap={2}>
            <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                context="signin"
              />
            </div>

            <div className="linkedin-login-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button
                onClick={handleLinkedInLogin}
                className="linkedin-button"
                style={{
                  backgroundColor: '#0077B5',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                {t('auth.loginWithLinkedin')}
              </button>
            </div>
          </Box>

          <Typography variant="body2" sx={{ marginTop: '1rem' }}>
            {t('auth.login.organizationLogin')} <StyledSpan onClick={handleOpenOrgInfo}>{t('auth.login.organizationText')}</StyledSpan>
          </Typography>

          {/* Organization Info Dialog */}
          <Dialog
            open={openOrgInfo}
            onClose={handleCloseOrgInfo}
            aria-labelledby="org-info-dialog-title"
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle id="org-info-dialog-title" sx={{ 
              textAlign: 'center',
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }}>
              {t('auth.login.organizationLoginTitle')}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('auth.login.organizationLoginDescription')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('auth.login.organizationLoginDescription2')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t('auth.login.organizationLoginDescription3')}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                onClick={handleCloseOrgInfo}
                variant="contained"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {t('auth.login.organizationLoginButton')}
              </Button>
            </DialogActions>
          </Dialog>

          <hr style={{ width: '100%', border: '.5px solid #E4E7EC', marginTop: '2rem' }} />
          <Box mt={4} textAlign="center">
            <Typography variant="body2">
              {t('auth.login.noAccount')}{' '}
              <StyledLink to="/signup" style={{color: theme.palette.secondary.main, fontWeight: 'bold'}}>{t('auth.login.signupLink')}</StyledLink>
            </Typography>
          </Box>
        </Container>
      </section>
    </Layout>
  );
}; 