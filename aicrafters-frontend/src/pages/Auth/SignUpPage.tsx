import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import { Input } from '../../components/common/Input/Input';
import { IconButton } from '../../components/common/Button/IconButton';
import { ReactComponent as EmailIcon } from '../../assets/icons/email.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/Message.svg';
import { ReactComponent as LockIcon } from '../../assets/icons/password.svg';
import { RouterLink } from '../../components/common/RouterLink/RouterLink';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { PasswordStrengthIndicator } from '../../components/common/Input/PasswordStrengthIndicator';
import { Layout } from '../../components/layout/Layout/Layout';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';

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
    // Handle LinkedIn callback
    const handleLinkedInCallback = async () => {

      // Only process if this is the LinkedIn callback path
      if (!window.location.pathname.includes('/auth/linkedin/callback')) {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const error_description = urlParams.get('error_description');
      const savedState = localStorage.getItem('linkedinState');


      if (error || error_description) {
        toast.error(`LinkedIn login failed: ${error_description || error}`);
        navigate('/signup');
        return;
      }

      if (!code) {
        toast.error('LinkedIn authentication failed - no code received');
        navigate('/signup');
        return;
      }

      if (state !== savedState) {
       
        toast.error('Invalid authentication state');
        navigate('/signup');
        return;
      }

      try {
        setLoading(true);
        
        const response = await authService.linkedinLogin(code);
        
       

        if (response.user) {
          let dashboardPath = '/dashboard/user/learning';
          
          if (response.user.role === 'admin') {
            dashboardPath = '/dashboard/admin';
          } else if (response.user.role === 'trainer') {
            dashboardPath = '/dashboard/trainer';
          } else if (response.user.role === 'mentor') {
            dashboardPath = '/dashboard/mentor';
          }

          const lang = location.pathname.split('/')[1] || 'en';
          const targetPath = `/${lang}${dashboardPath}`;
          toast.success('LinkedIn login successful');
          navigate(targetPath);
          return;
        }
      } catch (error: any) {
        console.error('LinkedIn Authentication Error:', {
          message: error.message,
          response: {
            data: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
            headers: error.response?.headers
          },
          request: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data,
            headers: error.config?.headers
          }
        });
        toast.error('LinkedIn login failed. Please try again.');
        navigate('/signup');
        return;
      } finally {
        setLoading(false);
      }
    };

    handleLinkedInCallback().catch(error => {
      console.error('Unhandled LinkedIn callback error:', error);
      toast.error('An unexpected error occurred');
      navigate('/signup');
    });
  }, [location, navigate]);

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
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

    const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/auth/linkedin/callback'
      : process.env.REACT_APP_LINKEDIN_REDIRECT_URI;

   

    if (!clientId || !redirectUri) {
      console.error('Missing LinkedIn configuration');
      toast.error('LinkedIn configuration is incomplete');
      return;
    }

    const scope = 'profile email openid';
    const state = Math.random().toString(36).substring(7);
    
    const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    // Store state in localStorage to verify callback
    localStorage.setItem('linkedinState', state);

    // Redirect to LinkedIn authorization
    window.location.href = linkedinUrl;
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
            <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                context="signup"
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