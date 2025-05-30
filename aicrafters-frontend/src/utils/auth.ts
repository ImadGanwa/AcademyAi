import { toast } from 'react-toastify';

/**
 * Initiates the LinkedIn OAuth login flow
 * Opens a popup window for LinkedIn authorization
 */
export const initiateLinkedInLogin = () => {
  const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    toast.error('LinkedIn configuration is missing');
    return;
  }
  
  const scope = 'openid profile email';
  const state = Math.random().toString(36).substring(7);
  
  // Store state for CSRF protection
  localStorage.setItem('linkedinState', state);
  
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
          
          // The callback page will handle the authentication
          // Keep the popup open so the user can see progress
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
    toast.error('Popup blocked. Please allow popups for this site.');
  }
}; 