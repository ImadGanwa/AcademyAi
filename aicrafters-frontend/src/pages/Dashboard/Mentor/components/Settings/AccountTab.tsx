import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SettingsSection, SettingTitle } from './StyledComponents';
import { authService } from '../../../../../services/authService';
import { toast } from 'react-toastify';

const AccountTab: React.FC = () => {
  const { t } = useTranslation();
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Password validation function
  const validatePassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 40) {
      setErrors(prev => ({ ...prev, newPassword: 'Password must be between 8 and 40 characters' }));
      return false;
    }

    if (!/\d/.test(password)) {
      setErrors(prev => ({ ...prev, newPassword: 'Password must contain at least one number' }));
      return false;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      setErrors(prev => ({ ...prev, newPassword: 'Password must contain both lowercase and uppercase letters' }));
      return false;
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setErrors(prev => ({ ...prev, newPassword: 'Password must contain at least one special character' }));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUpdateSuccess(false);
    setErrors({});
    
    // Validation
    if (!currentPassword) {
      setErrors(prev => ({ ...prev, currentPassword: 'Current password is required' }));
      return;
    }

    if (!newPassword) {
      setErrors(prev => ({ ...prev, newPassword: 'New password is required' }));
      return;
    }

    if (!confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your new password' }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // The backend is designed to update the password even if email sending fails
      // We just need to handle the success case from the database update
      const response = await authService.updatePassword(currentPassword, newPassword);
      
      setUpdateSuccess(true);
      toast.success('Password updated successfully');
      
      // Clear form values on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      // Specifically handle 401 errors (unauthorized - current password incorrect)
      if (error.response?.status === 401) {
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect'
        }));
      } 
      // Handle timeout errors specifically
      else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        // Even though the request timed out, the backend might have successfully updated the password
        // Show a different message to the user
        toast.info('Your request took longer than expected, but your password may have been updated successfully. Please try logging in with your new password.');
        
        // Reset the form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      else {
        // Handle other errors
        const errorMessage = error.response?.data?.message || 'Failed to update password';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection>
      <SettingTitle variant="h6">{t('mentor.settings.accountSettings', 'Account Settings') as string}</SettingTitle>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('mentor.settings.accountDescription', 'Manage your account security and preferences') as string}
      </Typography>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        {t('mentor.settings.changePassword', 'Change Password') as string}
      </Typography>
      
      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Password updated successfully
        </Alert>
      )}
      
      {errors.currentPassword && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.currentPassword}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              margin="normal"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setErrors(prev => ({ ...prev, currentPassword: '' }));
              }}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
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
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              margin="normal"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors(prev => ({ ...prev, newPassword: '' }));
              }}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              margin="normal"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
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
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 2, display: 'block' }}>
          Password must have at least 8 characters, include uppercase and lowercase letters, a number, and a special character.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 2 }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
        >
          {loading 
            ? "Updating..." 
            : "Update Password"}
        </Button>
      </form>

      <Divider sx={{ my: 4 }} />
    </SettingsSection>
  );
};

export default AccountTab; 