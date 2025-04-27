import React, { useState, useEffect } from 'react';
import { TextField, CircularProgress, IconButton, InputAdornment, Box, Typography, Paper } from '@mui/material';
import styled from 'styled-components';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';
import { PasswordStrengthIndicator } from '../Input/PasswordStrengthIndicator';
import { useTranslation } from 'react-i18next';

const Container = styled(Box)`
  width: 100%;
`;

const Section = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
`;

const SectionTitle = styled(Typography)`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.palette.text.title};
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FieldGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: ${props => props.theme.palette.secondary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: fit-content;

  &:hover {
    background-color: ${props => props.theme.palette.secondary.dark};
  }

  &:disabled {
    background-color: ${props => props.theme.palette.action.disabledBackground};
    cursor: not-allowed;
  }
`;

const textFieldStyles = (theme: any) => ({
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.secondary.main,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.secondary.main,
  },
});

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
      setError(prev => ({ ...prev, newPassword: t('trainer.errors.passwordLength') }));
      return false;
    }

    if (!/\d/.test(password)) {
      setError(prev => ({ ...prev, newPassword: t('trainer.errors.passwordMustContainAtLeastOneNumber') }));
      return false;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      setError(prev => ({ ...prev, newPassword: t('trainer.errors.passwordMustContainBothLowercaseAndUppercaseLetters') }));
      return false;
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError(prev => ({ ...prev, newPassword: t('trainer.errors.passwordMustContainAtLeastOneSpecialCharacter') }));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError({});

    if (hasPassword && !currentPassword) {
      setError(prev => ({ ...prev, currentPassword: t('trainer.errors.currentPasswordRequired') }));
      return;
    }

    if (!newPassword) {
      setError(prev => ({ ...prev, newPassword: t('trainer.errors.newPasswordRequired') }));
      return;
    }

    if (!confirmPassword) {
      setError(prev => ({ ...prev, confirmPassword: t('trainer.errors.confirmPasswordRequired') }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(prev => ({ ...prev, confirmPassword: t('trainer.errors.passwordsDoNotMatch') }));
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    try {
      setIsLoading(true);
      if (hasPassword) {
        await api.put('/user/password', { currentPassword, newPassword });
      } else {
        await api.post('/user/set-password', { password: newPassword });
        setHasPassword(true);
      }
      toast.success(t('trainer.success.passwordUpdatedSuccessfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('trainer.errors.failedToUpdatePassword');
      if (error.response?.status === 401) {
        setError(prev => ({ ...prev, currentPassword: t('trainer.errors.currentPasswordIncorrect') }));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Section elevation={0}>
        <SectionTitle variant="h6">
          {hasPassword ? t('trainer.profileSettings.changePassword') : t('trainer.profileSettings.setPassword')}
        </SectionTitle>
        <Form onSubmit={handleSubmit}>
          {hasPassword && (
            <FieldGroup>
              <TextField
                label={t('trainer.profileSettings.currentPassword')}
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
              label={t('trainer.profileSettings.newPassword')}
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
              label={t('trainer.profileSettings.confirmNewPassword')}
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
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <LockOutlinedIcon />
                {hasPassword ? t('trainer.profileSettings.updatePassword') : t('trainer.profileSettings.setPassword')}
              </>
            )}
          </ActionButton>
        </Form>
      </Section>
    </Container>
  );
}; 