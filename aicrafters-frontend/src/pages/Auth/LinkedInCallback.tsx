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
      console.log('LinkedIn callback processing started');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      const savedState = localStorage.getItem('linkedinState');

      console.log('LinkedIn callback params:', { code: !!code, state, errorParam, errorDescription });

      // Check for errors from LinkedIn
      if (errorParam || errorDescription) {
        const errorMessage = `LinkedIn login failed: ${errorDescription || errorParam}`;
        setError(errorMessage);
        setTimeout(() => {
          if (window.opener) {
            console.log('Sending error message to parent');
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
            console.log('Sending error message to parent');
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
            console.log('Sending error message to parent');
            window.opener.postMessage({ type: 'linkedin-auth-error', error: errorMessage }, window.location.origin);
            window.close();
          }
        }, 2000);
        return;
      }

      try {
        console.log('Processing LinkedIn authentication with code');
        // Process the LinkedIn authentication
        const response = await authService.linkedinLogin(code);
        
        console.log('LinkedIn auth response:', { 
          hasUser: !!response.user, 
          hasToken: !!response.token,
          userRole: response.user?.role,
          userId: response.user?.id 
        });
        
        if (response.user && response.token) {
          setSuccess(true);
          
          // Clear LinkedIn state from localStorage
          localStorage.removeItem('linkedinState');
          
          console.log('Preparing to send success message to parent');
          
          // Notify the opener window with complete auth data
          if (window.opener) {
            const messageData = { 
              type: 'linkedin-auth-success',
              user: response.user,
              token: response.token,
              authData: {
                user: response.user,
                token: response.token
              }
            };
            
            console.log('Sending success message to parent:', messageData);
            
            // Send message multiple times to ensure it's received
            const sendMessage = () => {
              try {
                window.opener.postMessage(messageData, window.location.origin);
                console.log('Message sent to parent window');
              } catch (error) {
                console.error('Error sending message to parent:', error);
              }
            };
            
            // Send immediately
            sendMessage();
            
            // Send again after a short delay
            setTimeout(sendMessage, 100);
            setTimeout(sendMessage, 500);
            
            // Close after ensuring messages are sent
            setTimeout(() => {
              console.log('Closing popup window');
              window.close();
            }, 3000);
          } else {
            console.error('No window.opener found');
          }
        } else {
          throw new Error('Invalid response format - missing user or token');
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
            console.log('Sending error message to parent');
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