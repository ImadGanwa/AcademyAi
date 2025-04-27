import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Input } from '../../components/common/Input/Input';
import { IconButton } from '../../components/common/Button/IconButton';
import { ReactComponent as MessageIcon } from '../../assets/icons/Message.svg';
import { Layout } from '../../components/layout/Layout/Layout';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  max-width: 450px;
  width: 90%;
  margin: 20px auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 20px;
    margin: 10px auto;
  }
`;

const Title = styled(Typography)`
  color: ${props => props.theme.palette.text.title};
  margin-bottom: 24px !important;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Description = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  text-align: center;
  margin-bottom: 24px !important;
`;

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { token } = useParams<{ token: string }>();
  const navigate = useLocalizedNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 40) {
      setError(t('auth.errors.passwordLength'));
      return false;
    }

    if (!/\d/.test(password)) {
      setError(t('auth.errors.passwordMustContainAtLeastOneNumber'));
      return false;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      setError(t('auth.errors.passwordMustContainBothLowercaseAndUppercaseLetters'));
      return false;
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError(t('auth.errors.passwordMustContainAtLeastOneSpecialCharacter'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!password) {
      setError(t('auth.errors.newPasswordRequired'));
      return;
    }

    if (!confirmPassword) {
      setError(t('auth.errors.pleaseConfirmYourNewPassword'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordsDoNotMatch'));
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    setIsLoading(true);

    try {
      if (!token) {
        throw new Error('Reset token is missing');
      }

      await authService.resetPassword(token, password);
      toast.success(t('auth.resetPassword.success'));
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('auth.resetPassword.error');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={t('auth.resetPassword.title')}>
      <section style={{ marginBottom: '4rem' }}>
        <Container>
          <Title variant="h4" gutterBottom>
            {t('auth.resetPassword.title')}
          </Title>

          <Description variant="body1">
            {t('auth.resetPassword.description')}
          </Description>

          <Form onSubmit={handleSubmit}>
            <Input
              name="password"
              type="password"
              placeholder={t('auth.resetPassword.newPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              error={!!error}
              showPasswordStrength
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder={t('auth.resetPassword.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              error={!!error}
              helperText={error}
            />
            <IconButton
              type="submit"
              variant="contained"
              fullWidth
              icon={<MessageIcon />}
              loading={isLoading}
            >
              {t('auth.resetPassword.submit')}
            </IconButton>
          </Form>
        </Container>
      </section>
    </Layout>
  );
}; 