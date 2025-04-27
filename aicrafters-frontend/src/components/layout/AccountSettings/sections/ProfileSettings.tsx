import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Avatar, 
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { PhotoCamera, Edit } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { RootState } from '../../../../store';
import { authService } from '../../../../services/authService';
import { updateUser } from '../../../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
export const ProfileSettings: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value);
    setError(null);
  };

  const handleImageClick = () => {
    if (!token) {
      toast.error(t('user.errors.loginToUpdateProfileImage'));
      return;
    }
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!token) {
        toast.error(t('user.errors.loginToUpdateProfileImage'));
        return;
      }

      setIsLoading(true);
      setError(null);

      const response = await authService.updateProfileImage(file);
      dispatch(updateUser(response.user));
      
      toast.success(t('user.success.profileImageUpdatedSuccessfully'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('user.errors.failedToUpdateProfileImage');
      setError(errorMessage);
      toast.error(t('user.errors.failedToUpdateProfileImage'));
      
      if (error.response?.status === 401) {
        toast.error(t('user.errors.loginToUpdateProfileImage'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!token) {
      toast.error(t('user.errors.loginToUpdateProfile'));
      return;
    }

    if (!fullName.trim()) {
      setError(t('user.errors.nameRequired'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.updateProfile({ fullName: fullName.trim() });
      
      toast.success(t('user.success.profileUpdatedSuccessfully'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('user.errors.failedToUpdateProfile');
      setError(errorMessage);
      toast.error(t('user.errors.failedToUpdateProfile'));
      
      if (error.response?.status === 401) {
        toast.error(t('user.errors.loginToUpdateProfile'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !token) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'white' }}>
      <Typography variant="h5" sx={{ mb: 3, color: theme.palette.text.title, fontWeight: 600 }}>
        {t('user.profileSettings.title')}
        </Typography>
        
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          mb: 4,
          gap: 3
        }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user.profileImage ? user.profileImage : undefined}
              className="profile-avatar"
              sx={{ 
                width: 120, 
                height: 120, 
                cursor: 'pointer',
                border: `4px solid ${theme.palette.secondary.main}`,
                boxShadow: theme.shadows[3]
              }}
              onClick={handleImageClick}
            />
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark,
                },
              }}
              onClick={handleImageClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <PhotoCamera />
              )}
            </IconButton>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>

          <Box sx={{ flex: 1, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.title, fontWeight: 500 }}>
              {t('user.profileSettings.personalInformation')}
            </Typography>

            <TextField
              fullWidth
              label={t('user.profileSettings.fullName')}
              value={fullName}
              onChange={handleFullNameChange}
              margin="normal"
              error={!!error}
              helperText={error}
              disabled={isLoading}
              sx={{
                mb: 2,
                '& .MuiInputBase-input': {
                  color: theme.palette.text.secondary,
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                },
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.secondary.main,
                  },
                },
              }}
              InputProps={{
                endAdornment: <Edit color="action" />,
              }}
            />

            <TextField
              fullWidth
              label={t('user.profileSettings.email')}
              value={user.email}
              margin="normal"
              disabled
              sx={{
                '& .MuiInputBase-input': {
                  color: theme.palette.text.secondary,
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={isLoading || fullName.trim() === user.fullName}
            sx={{ 
              minWidth: 120,
              padding: "15px 20px",
              '& .MuiButton-label': {
                color: '#FFFFFF',
              },
              '& .MuiCircularProgress-root': {
                color: '#FFFFFF',
              },
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
              t('user.profileSettings.saveChanges')
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 