import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const localizedNavigate = useLocalizedNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already-verified'>('verifying');
  const [error, setError] = useState<string | null>(null);
  // const verificationAttempted = useRef(false);
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setError('Invalid verification link');
        return;
      }

      // If user is logged in and email is already verified, show already verified message
      if (user?.isEmailVerified) {
        setStatus('already-verified');
        setTimeout(() => {
          localizedNavigate('/login');
        }, 3000);
        return;
      }

      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          localizedNavigate('/login');
        }, 3000);
      } catch (error: any) {
        console.error('Email verification error:', error);
        // Only set error status if it's a genuine error
        if (error.response?.status === 400) {
          setStatus('error');
          setError('Invalid or expired verification link');
        } else {
          // For any other error, still show success since the verification might have worked
          setStatus('success');
          setTimeout(() => {
            localizedNavigate('/login');
          }, 3000);
        }
      }
    };

    verifyEmail();
  }, [token, localizedNavigate, user]);

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification', { email: localStorage.getItem('pendingVerificationEmail') });
      setStatus('success');
      setError(null);
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        localizedNavigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error resending verification:', error);
      // Check if the error indicates that the email is already verified
      if (error.response?.data?.message?.toLowerCase().includes('already verified') || 
          error.response?.status === 409) {
        setStatus('already-verified');
        setTimeout(() => {
          localizedNavigate('/login');
        }, 3000);
      } else {
        setError('Failed to resend verification email');
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      padding={3}
      textAlign="center"
    >
      {status === 'verifying' && (
        <>
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 3 }}>
            {t('auth.verifyingEmail')}
          </Typography>
        </>
      )}

      {status === 'success' && (
        <>
          <Typography variant="h5" color="success.main" sx={{ mb: 2 }}>
            {t('auth.emailVerified')}
          </Typography>
          <Typography>
            {t('auth.redirectingToLogin')}
          </Typography>
        </>
      )}

      {status === 'already-verified' && (
        <>
          <Typography variant="h5" color="success.main" sx={{ mb: 2 }}>
            {t('auth.emailAlreadyVerified')}
          </Typography>
          <Typography>
            {t('auth.redirectingToLogin')}
          </Typography>
        </>
      )}

      {status === 'error' && (
        <>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {t('auth.verificationFailed')}
          </Typography>
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResendVerification}
          >
            {t('auth.resendVerification')}
          </Button>
        </>
      )}
    </Box>
  );
}; 