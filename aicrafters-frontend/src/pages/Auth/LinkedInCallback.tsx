import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { Layout } from '../../components/layout/Layout/Layout';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LinkedInCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      const savedState = localStorage.getItem('linkedinState');

      // Check for errors from LinkedIn
      if (errorParam || errorDescription) {
        const errorMessage = `LinkedIn login failed: ${errorDescription || errorParam}`;
        setError(errorMessage);
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'linkedin-auth-error', error: errorMessage }, window.location.origin);
            window.close();
          }
        }, 2000);
        return;
      }

      // Check if code exists
      if (!code) {
        const errorMessage = 'LinkedIn authentication failed - no code received';
        setError(errorMessage);
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'linkedin-auth-error', error: errorMessage }, window.location.origin);
            window.close();
          }
        }, 2000);
        return;
      }

      // Verify state to prevent CSRF
      if (state !== savedState) {
        const errorMessage = 'Invalid authentication state';
        setError(errorMessage);
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'linkedin-auth-error', error: errorMessage }, window.location.origin);
            window.close();
          }
        }, 2000);
        return;
      }

      try {
        // Process the LinkedIn authentication
        const response = await authService.linkedinLogin(code);
        
        if (response.user) {
          setSuccess(true);
          
          // Notify the opener window and close
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'linkedin-auth-success',
                user: response.user
              }, window.location.origin);
              window.close();
            }
          }, 1500);
        }
      } catch (error: any) {
        console.error('LinkedIn Authentication Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        
        const errorMessage = error.response?.data?.message || 'LinkedIn login failed. Please try again.';
        setError(errorMessage);
        
        setTimeout(() => {
          if (window.opener) {
            window.opener.postMessage({ type: 'linkedin-auth-error', error: errorMessage }, window.location.origin);
            window.close();
          }
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleLinkedInCallback();
  }, [navigate, location.pathname]);

  return (
    <Layout title="LinkedIn Authentication">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        p={4}
      >
        {isProcessing ? (
          <>
            <CircularProgress size={60} />
            <Typography variant="h6" mt={3}>
              Processing LinkedIn Authentication...
            </Typography>
          </>
        ) : error ? (
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        ) : (
          <Typography variant="h6" color="primary">
            Authentication successful! Closing window...
          </Typography>
        )}
      </Box>
    </Layout>
  );
};

export default LinkedInCallback; 