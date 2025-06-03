import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/common/Input/Input';
import { IconButton } from '../../components/common/Button/IconButton';
// import { ReactComponent as Logo } from '../../assets/images/dark-logo.svg';
import { ReactComponent as EmailIcon } from '../../assets/icons/email.svg';
import { ReactComponent as LockIcon } from '../../assets/icons/password.svg';
import { ReactComponent as GoogleIcon } from '../../assets/icons/google.svg';
import { ReactComponent as LinkedInIcon } from '../../assets/icons/linkedin.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/Message.svg';
// import { SocialSignInButton } from '../../components/common/Button/SocialSignInButton';
import { RouterLink } from '../../components/common/RouterLink/RouterLink';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { Layout } from '../../components/layout/Layout/Layout';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import {useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initiateLinkedInLogin } from '../../utils/auth';
import { setCredentials } from '../../store/slices/authSlice';
// import { LinkedIn } from 'react-linkedin-login-oauth2';

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

// const LogoWrapper = styled(Box)`
//   display: flex;
//   align-items: baseline;
//   justify-content: space-evenly;
//   margin-top: 4rem;
//   margin-bottom: 3rem;

//   & svg {
//   height: 3rem;
//     width: 11rem;
//   }

//   @media (max-width: 768px) {
//     margin-top: 3rem;
//     margin-bottom: 2rem;
//   }
// `;

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
    background: ${props => props.theme.palette.secondary.main};
    color: white;
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
    
    &:hover {
      background: ${props => props.theme.palette.secondary.dark};
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
    // Check for expired token notification
    const urlParams = new URLSearchParams(location.search);
    const expired = urlParams.get('expired');
    if (expired === 'true') {
      toast.warning(t('auth.sessionExpired', 'Your session has expired. Please log in again.') as string);
    }

    // Add event listener for messages from popup
    const handleAuthMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'linkedin-auth-success') {
        // Set authentication state in parent window
        if (event.data.authData) {
          // Dispatch credentials to parent window's Redux store
          dispatch(setCredentials({
            user: event.data.authData.user,
            token: event.data.authData.token
          }));
        }
        
        toast.success(t('auth.linkedinLoginSuccess'));
        redirectAfterLogin(event.data.user);
      }
      
      if (event.data?.type === 'linkedin-auth-error') {
        toast.error(event.data.error || t('auth.linkedinLoginFailed'));
      }
    };

    window.addEventListener('message', handleAuthMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [location, dispatch, t]);

  const redirectAfterLogin = (user: any) => {
    // Check if there's a mentor booking redirect
    const bookingMentorId = localStorage.getItem('bookingMentorId');
    if (bookingMentorId) {
      localStorage.removeItem('bookingMentorId');
      const currentLang = location.pathname.split('/')[1] || 'en';
      navigate(`/mentorship/book/${bookingMentorId}`);
      return;
    }

    // Check if we need to redirect to trace section
    const redirectToTrace = localStorage.getItem('redirectAfterLogin') === 'traceSection';
    
    // Determine dashboard path based on user role
    let dashboardPath;
    switch (user.role) {
      case 'admin':
        dashboardPath = '/dashboard/admin';
        break;
      case 'trainer':
        dashboardPath = '/dashboard/trainer';
        break;
      case 'mentor':
        dashboardPath = '/dashboard/mentor';
        break;
      default:
        dashboardPath = '/dashboard/user/learning';
    }

    // Get the current language from the URL
    const lang = location.pathname.split('/')[1] || 'en';
    
    if (redirectToTrace) {
      localStorage.removeItem('redirectAfterLogin');
      // Use setItem to pass the information that we want to scroll to trace section
      localStorage.setItem('scrollToTrace', 'true');
      // Redirect to home
      navigate(`/${lang}`);
    } else {
      navigate(`/${lang}${dashboardPath}`);
    }
  };

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

        redirectAfterLogin(response.user);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      
      const response = await authService.googleLogin(credentialResponse.credential);
      
      if (response.user) {
        toast.success(response.message || 'Successfully logged in with Google');
        redirectAfterLogin(response.user);
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

  const handleLinkedInLogin = () => {
    initiateLinkedInLogin();
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
              icon={<EmailIcon />}
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
              icon={<LockIcon />}
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
            <Box className="google-login-container" display="flex" justifyContent="center" width="100%">
              <div style={{ position: 'relative', width: '250px', height: '42px' }}>
                {/* Custom styled button (visual only) */}
                <button
                  className="google-button-visual"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    color: '#757575',
                    border: '1px solid #dddddd',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    pointerEvents: 'none', // Make this non-interactive
                    zIndex: 1
                  }}
                >
                  <GoogleIcon />
                  {t('auth.loginWithGoogle')}
                </button>
                
                {/* Actual Google Login button (transparent overlay) */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    opacity: 0.01, // Nearly invisible but still interactive
                  }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    type="standard"
                    theme="filled_blue"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="250px"
                    locale={location.pathname.split('/')[1] || 'en'}
                  />
                </div>
              </div>
            </Box>

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
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  width: '250px',
                  height: '42px'
                }}
              >
                <LinkedInIcon />
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