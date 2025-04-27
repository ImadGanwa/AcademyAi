import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, IconButton, Grid, useTheme, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store';
import { authService } from '../../../../services/authService';
import { updateUser } from '../../../../store/slices/authSlice';
import { toast } from 'react-toastify';
import config from '../../../../config';
import { PasswordSettings } from '../../../../components/common/Settings/PasswordSettings';
import { useTranslation } from 'react-i18next';
const SettingsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled(Paper)`
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const SectionTitle = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.title};
  font-weight: 600;
  margin-bottom: 24px !important;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProfileImageContainer = styled(Box)`
  position: relative;
  width: fit-content;
  margin-bottom: 24px;
`;

const StyledAvatar = styled(Avatar)`
  width: 120px !important;
  height: 120px !important;
  border: 4px solid ${({ theme }) => theme.palette.secondary.main};
`;

const UploadButton = styled(IconButton)`
  position: absolute !important;
  bottom: 0;
  right: 0;
  background-color: ${({ theme }) => theme.palette.secondary.main} !important;
  color: white !important;
  padding: 8px !important;

  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.dark} !important;
  }
` as typeof IconButton;

const FormField = styled(Box)`
  margin-bottom: 20px;
`;

const SaveButton = styled(Button)`
  min-width: 120px;
  margin-top: 16px !important;
  background-color: ${({ theme }) => theme.palette.secondary.main} !important;
  color: white !important;
  padding: 10px 20px !important;
  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.dark} !important;
  }
`;

export const AdminSettings: React.FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageClick = () => {
    if (!token) {
      toast.error(t('trainer.errors.mustBeLoggedInToUpdateProfileImage'));
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const response = await authService.updateProfileImage(file);
      dispatch(updateUser(response.user));
      toast.success(t('trainer.success.profileImageUpdatedSuccessfully'));
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast.error(t('trainer.errors.failedToUpdateProfileImage'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!token) {
      toast.error(t('trainer.errors.mustBeLoggedInToUpdateProfile'));
      return;
    }

    if (!formData.fullName.trim()) {
      setError(t('trainer.errors.nameIsRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.updateProfile({ fullName: formData.fullName.trim() });
      dispatch(updateUser(response.user));
      toast.success(t('trainer.success.profileUpdatedSuccessfully'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('trainer.errors.failedToUpdateProfile');
      setError(errorMessage);
      toast.error(t('trainer.errors.failedToUpdateProfile'));
      
      if (error.response?.status === 401) {
        toast.error(t('trainer.errors.mustBeLoggedInToUpdateProfile'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContainer>
      <Section>
        <SectionTitle variant="h6">
          <PersonIcon /> {t('trainer.profileSettings.title')}
        </SectionTitle>
        <form onSubmit={handleProfileSubmit}>
          <ProfileImageContainer>
            <StyledAvatar
              src={user?.profileImage ? `${config.API_URL}${user.profileImage}` : undefined}
              alt={user?.fullName}
              onClick={handleImageClick}
            />
            <UploadButton onClick={handleImageClick}>
              <PhotoCameraIcon />
            </UploadButton>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </ProfileImageContainer>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormField>
                <TextField
                  label={t('trainer.profileSettings.fullName')}
                  variant="outlined"
                  fullWidth
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  error={!!error}
                  helperText={error}
                  required
                />
              </FormField>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormField>
                <TextField
                  label={t('trainer.profileSettings.email')}
                  variant="outlined"
                  fullWidth
                  value={formData.email}
                  disabled
                />
              </FormField>
            </Grid>
          </Grid>

          <SaveButton
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : t('trainer.profileSettings.saveChanges')}
          </SaveButton>
        </form>
      </Section>

      <Section>
        <SectionTitle variant="h6">
          <SecurityIcon /> {t('trainer.profileSettings.security')}
        </SectionTitle>
        <PasswordSettings />
      </Section>
    </SettingsContainer>
  );
}; 