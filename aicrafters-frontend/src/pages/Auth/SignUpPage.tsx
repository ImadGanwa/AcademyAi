import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import { Input } from '../../components/common/Input/Input';
import { IconButton } from '../../components/common/Button/IconButton';
import { ReactComponent as EmailIcon } from '../../assets/icons/email.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/Message.svg';
import { ReactComponent as LockIcon } from '../../assets/icons/password.svg';
import { ReactComponent as GoogleIcon } from '../../assets/icons/google.svg';
import { ReactComponent as LinkedInIcon } from '../../assets/icons/linkedin.svg';
import { RouterLink } from '../../components/common/RouterLink/RouterLink';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { PasswordStrengthIndicator } from '../../components/common/Input/PasswordStrengthIndicator';
import { Layout } from '../../components/layout/Layout/Layout';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { initiateLinkedInLogin } from '../../utils/auth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  max-width: 450px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);
  margin-top: 40px;
  margin-bottom: 40px;
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

const StyledLink = styled(RouterLink)`
  color: ${({ theme }) => theme.palette.text.title};
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    text-decoration: underline;
  }
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


const StyledIconButton = styled(IconButton)`
  && {
    background: ${({ theme }) => theme.palette.secondary.main};
    color: white;
    padding: 12px;
    font-size: 16px;
    border-radius: 8px;
    
    &:hover {
      background: ${({ theme }) => theme.palette.secondary.dark};
    }
  }
`;


const StyledLoginLink = styled(RouterLink)`
  color: ${({ theme }) => theme.palette.primary.main};
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TermsText = styled(Typography)`
  text-align: center;
  color: ${({ theme }) => theme.palette.text.title};
  font-size: 0.8rem !important;
  margin-top: 16px;
  padding: 1rem 4rem 0;
`;

const SignupTitle = styled(Typography)`
  && {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.palette.text.title};
    margin-bottom: 1rem;
    padding: 0 2rem .8rem;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

const RecaptchaWrapper = styled(Box)`
  margin: 20px 0;
  display: flex;
  justify-content: center;
`;

export const SignUpPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const localizedNavigate = useLocalizedNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    marketingConsent: false,
    recaptchaToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
    recaptcha?: string;
    general?: string;
  }>({});

  useEffect(() => {
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
        
        toast.success(t('auth.linkedinSignupSuccess', 'Successfully signed up with LinkedIn'));
        
        // Determine dashboard path based on user role
        let dashboardPath;
        switch (event.data.user.role) {
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
        navigate(`/${lang}${dashboardPath}`);
      }
      
      if (event.data?.type === 'linkedin-auth-error') {
        toast.error(event.data.error || t('auth.linkedinSignupFailed', 'LinkedIn signup failed'));
      }
    };

    window.addEventListener('message', handleAuthMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [navigate, location.pathname, t, dispatch]);

  const handleRecaptchaChange = (token: string | null) => {
    setFormData(prev => ({ ...prev, recaptchaToken: token || '' }));
    if (errors.recaptcha) {
      setErrors(prev => ({ ...prev, recaptcha: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and numbers';
    }

    if (!formData.recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const response = await authService.register(formData);

      // Store email in localStorage for potential resend verification
      localStorage.setItem('pendingVerificationEmail', formData.email);
      
      toast.success(t('auth.verificationEmailSent'));
      localizedNavigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setErrors(prev => ({ ...prev, general: errorMessage }));
      
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setFormData(prev => ({ ...prev, recaptchaToken: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      const response = await authService.googleLogin(credentialResponse.credential);
      
      if (response.user) {
        toast.success(response.message || 'Successfully signed up with Google');
        
        // Determine dashboard path based on user role
        let dashboardPath;
        switch (response.user.role) {
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
        navigate(`/${lang}${dashboardPath}`);
      }
    } catch (error: any) {
      console.error('Google signup error:', error);
      console.error('Error details:', {
        response: error.response,
        message: error.message,
        stack: error.stack
      });
      toast.error(t('auth.googleSignupFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google signup failed');
    toast.error(t('auth.googleSignupFailed'));
  };

  const handleLinkedInLogin = () => {
    initiateLinkedInLogin();
  };

  return (
    <Layout title="Sign Up">
      <section style={{marginBottom: '4rem'}}>
        <Container>
          <SignupTitle variant="h4" gutterBottom align="center">
            {t('auth.signup.title')}
          </SignupTitle>

          {errors.general && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {errors.general}
            </Typography>
          )}

          <Form onSubmit={handleSubmit}>
            <Input
              name="fullName"
              type="text"
              placeholder={t('auth.signup.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={handleInputChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              icon={<MessageIcon />}
              disabled={loading}
            />
            <Input
              name="email"
              type="email"
              placeholder={t('auth.signup.emailPlaceholder')}
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              icon={<EmailIcon />}
              disabled={loading}
            />
            <Input
              name="password"
              type="password"
              placeholder={t('auth.signup.passwordPlaceholder')}
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              icon={<LockIcon />}
              disabled={loading}
            />
            <PasswordStrengthIndicator password={formData.password} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleInputChange}
                id="marketingConsent"
              />
              <label htmlFor="marketingConsent">
                {t('auth.signup.marketingConsent')}
              </label>
            </Box>

            <RecaptchaWrapper>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ''}
                onChange={handleRecaptchaChange}
              />
            </RecaptchaWrapper>
            {errors.recaptcha && (
              <Typography color="error" variant="caption">
                {errors.recaptcha}
              </Typography>
            )}

            <StyledIconButton
              type="submit"
              disabled={loading}
              loading={loading}
            >
              {loading ? t('common.loading') : t('auth.signup.submit')}
            </StyledIconButton>
          </Form>

          <OrDivider>
            <span>{t('auth.signup.or')}</span>
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
                  {t('auth.signupWithGoogle')}
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
                    text="signup_with"
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
                {t('auth.signupWithLinkedin')}
              </button>
            </div>
          </Box>

          <TermsText>
            <StyledLink to="/terms">{t('auth.signup.termsOfService')}</StyledLink>
            {' '} {t('auth.signup.and')} {' '}
            <StyledLink to="/privacy">{t('auth.signup.privacyPolicy')}</StyledLink>.
          </TermsText>

          <Box mt={4} textAlign="center">
            <Typography variant="body2">
              {t('auth.signup.alreadyHaveAccount')}
              <StyledLink to="/login" style={{color: theme.palette.secondary.main, fontWeight: 'bold'}}>
                {t('auth.signup.signIn')}
              </StyledLink>
            </Typography>
          </Box>
        </Container>
      </section>
    </Layout>
  );
}; 