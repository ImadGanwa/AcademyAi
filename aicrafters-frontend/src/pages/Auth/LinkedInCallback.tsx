import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LinkedInCallback: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    // Send message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'linkedinCallback',
        code,
        state
      }, window.location.origin);
      window.close();
    }
  }, [location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Processing LinkedIn login...</p>
    </div>
  );
};

export default LinkedInCallback; 