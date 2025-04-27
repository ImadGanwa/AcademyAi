import React from 'react';
import { IconButton } from './IconButton';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';
interface GoogleSignInButtonProps {
  onClick?: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <IconButton
      icon={<GoogleIcon />}
      variant="outlined"
      onClick={onClick}
      fullWidth
    >
      {t('auth.signin.googleSignIn')}
    </IconButton>
  );
}; 