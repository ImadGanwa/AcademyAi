import React, { useState, useEffect } from 'react';
import { TextField, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Container, Title, Section, SectionTitle, Form, FieldGroup, ActionButton } from './styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { textFieldStyles } from './styles';
import { authService } from '../../../../services/authService';
import { toast } from 'react-toastify';
import { PasswordStrengthIndicator } from '../../../common/Input/PasswordStrengthIndicator';
import { api } from '../../../../services/api';
import { useTranslation } from 'react-i18next';
export const PasswordSettings: React.FC = () => {
  const theme = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const { t } = useTranslation();
  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const response = await api.get('/user/has-password');
        setHasPassword(response.data.hasPassword);
      } catch (error) {
        console.error('Error checking password status:', error);
      }
    };
    checkPasswordStatus();
  }, []);

  const validatePassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 40) {
      setError(prev => ({ ...prev, newPassword: t('user.errors.passwordLength') }));
      return false;
    }

    if (!/\d/.test(password)) {
      setError(prev => ({ ...prev, newPassword: t('user.errors.passwordMustContainAtLeastOneNumber') }));
      return false;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      setError(prev => ({ ...prev, newPassword: t('user.errors.passwordMustContainBothLowercaseAndUppercaseLetters') }));
      return false;
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError(prev => ({ ...prev, newPassword: t('user.errors.passwordMustContainAtLeastOneSpecialCharacter') }));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError({});

    if (hasPassword && !currentPassword) {
      setError(prev => ({ ...prev, currentPassword: t('user.errors.currentPasswordRequired') }));
      return;
    }

    if (!newPassword) {
      setError(prev => ({ ...prev, newPassword: t('user.errors.newPasswordRequired') }));
      return;
    }

    if (!confirmPassword) {
      setError(prev => ({ ...prev, confirmPassword: t('user.errors.pleaseConfirmYourNewPassword') }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(prev => ({ ...prev, confirmPassword: t('user.errors.passwordsDoNotMatch') }));
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    try {
      setIsLoading(true);
      if (hasPassword) {
        await authService.updatePassword(currentPassword, newPassword);
      } else {
        await api.post('/user/set-password', { password: newPassword });
        setHasPassword(true);
      }
      toast.success(t('user.success.passwordUpdatedSuccessfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('user.errors.failedToUpdatePassword');
      if (error.response?.status === 401) {
        setError(prev => ({ ...prev, currentPassword: t('user.errors.currentPasswordIncorrect') }));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title variant="h1">{t('user.passwordSettings.title')}</Title>
      
      <Section elevation={0}>
        <SectionTitle variant="h2">
          {hasPassword ? t('user.passwordSettings.changePassword') : t('user.passwordSettings.setPassword')}
        </SectionTitle>
        <Form onSubmit={handleSubmit}>
          {hasPassword && (
            <FieldGroup>
              <TextField
                label={t('user.passwordSettings.currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setError(prev => ({ ...prev, currentPassword: '' }));
                }}
                error={!!error.currentPassword}
                helperText={error.currentPassword}
                sx={textFieldStyles(theme)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FieldGroup>
          )}
          <FieldGroup>
            <TextField
              label={t('user.passwordSettings.newPassword')}
              type={showNewPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError(prev => ({ ...prev, newPassword: '' }));
              }}
              error={!!error.newPassword}
              helperText={error.newPassword}
              sx={textFieldStyles(theme)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <PasswordStrengthIndicator password={newPassword} />
            <TextField
              label={t('user.passwordSettings.confirmNewPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(prev => ({ ...prev, confirmPassword: '' }));
              }}
              error={!!error.confirmPassword}
              helperText={error.confirmPassword}
              sx={textFieldStyles(theme)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FieldGroup>
          <ActionButton
            type="submit"
            variant="contained"
            startIcon={!isLoading && <LockOutlinedIcon />}
            disabled={isLoading}
            sx={{
              color: '#FFFFFF !important',
              '&:hover': {
                bgcolor: theme.palette.secondary.dark,
                color: '#FFFFFF !important',
              },
              '&.Mui-disabled': {
                bgcolor: theme.palette.action.disabledBackground,
                color: 'rgba(255, 255, 255, 0.7) !important',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              hasPassword ? t('user.passwordSettings.updatePassword') : t('user.passwordSettings.setPassword')
            )}
          </ActionButton>
        </Form>
      </Section>
    </Container>
  );
}; 