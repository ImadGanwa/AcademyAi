import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/common/Input/Input';
import { IconButton } from '../../components/common/Button/IconButton';
import { ReactComponent as EmailIcon } from '../../assets/icons/email.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/Message.svg';
import { Layout } from '../../components/layout/Layout/Layout';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

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

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setIsSubmitted(true);
      toast.success(t('auth.forgotPassword.emailSent'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('auth.forgotPassword.error');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title={t('auth.forgotPassword.title')}>
      <section style={{ marginBottom: '4rem' }}>
        <Container>
          <Title variant="h4" gutterBottom>
            {t('auth.forgotPassword.title')}
          </Title>

          {!isSubmitted ? (
            <>
              <Description variant="body1">
                {t('auth.forgotPassword.description')}
              </Description>

              <Form onSubmit={handleSubmit}>
                <Input
                  name="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  startIcon={<EmailIcon />}
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
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : t('auth.forgotPassword.resetPassword')}
                </IconButton>
              </Form>
            </>
          ) : (
            <Box textAlign="center">
              <Description variant="body1">
                {t('auth.forgotPassword.checkEmail')}
              </Description>
              <Typography variant="body2" color="textSecondary">
                {t('auth.forgotPassword.checkSpam')}
              </Typography>
            </Box>
          )}
        </Container>
      </section>
    </Layout>
  );
}; 