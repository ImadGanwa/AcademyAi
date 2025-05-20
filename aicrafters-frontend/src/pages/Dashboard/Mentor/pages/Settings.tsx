import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  InputAdornment,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import styled from 'styled-components';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getMentorProfile, updateMentorProfile } from '../../../../api/mentor';
import { useTranslation } from 'react-i18next';
import { authService } from '../../../../services/authService';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfileAvatar = styled(Avatar)`
  && {
    width: 200px !important;
    height: 200px !important;
    object-fit: cover !important;
    border: 4px solid #f0f0f0 !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
    transition: transform 0.2s !important;
    border-radius: 50% !important;
    overflow: hidden !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    
    &:hover {
      transform: scale(1.02) !important;
    }
  }
`;

const AvatarWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const AvatarContainer = styled(Box)`
  position: relative;
  margin-bottom: 15px;
  cursor: pointer;
  border-radius: 50%;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
  }
  
  &:hover:before {
    opacity: 1;
  }
  
  &:hover button {
    transform: translate(25%, 25%) scale(1.1);
  }
`;

const AvatarUploadButton = styled(IconButton)`
  && {
    position: absolute !important;
    bottom: 10px !important;
    right: 10px !important;
    background-color: ${props => props.theme.palette.secondary.main} !important;
    color: white !important;
    width: 50px !important;
    height: 50px !important;
    transform: translate(25%, 25%) !important;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2) !important;
    transition: transform 0.3s ease, background-color 0.3s ease !important;
    z-index: 2 !important;
    
    &:hover {
      background-color: ${props => props.theme.palette.secondary.main} !important;
    }
  }
`;

const SettingsSection = styled(Paper)`
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
`;

const SettingTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 16px;
`;

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    headline: '',
    hourlyRate: '',
    skills: [] as string[],
    newSkill: '',
    profileImage: null as File | null,
    currentImageUrl: '',
  });
  
  // Account state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    messageNotifications: true,
    marketingEmails: false,
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const displayImageUrl = useMemo(() => {
    if (previewImage) {
      return previewImage;
    }
    
    if (profileData.currentImageUrl && profileData.currentImageUrl !== '') {
      if (profileData.currentImageUrl.startsWith('/') && !profileData.currentImageUrl.startsWith('//')) {
        const baseUrl = process.env.REACT_APP_API_URL || '';
        return `${baseUrl}${profileData.currentImageUrl}`;
      }
      return profileData.currentImageUrl;
    }
    
    return '/avatars/profile.jpg';
  }, [previewImage, profileData.currentImageUrl]);

  useEffect(() => {
    fetchMentorProfile();
  }, []);

  const fetchMentorProfile = async () => {
    setLoading(true);
    setError('');
    
    console.log('Fetching mentor profile...');
    
    try {
      const response = await getMentorProfile();
      console.log('Mentor profile API response:', response);
      
      if (response.success) {
        const profile = response.data.profile || {};
        const { fullName, email, profileImage } = response.data;
        
        console.log('Mentor profile data:', profile);
        console.log('Profile image URL:', profileImage);
        
        // Reset preview when fetching new data
        setPreviewImage(null);
        
        setProfileData({
          name: fullName || '',
          email: email || '',
          bio: profile.bio || '',
          headline: profile.title || '',
          hourlyRate: profile.hourlyRate?.toString() || '',
          skills: profile.skills?.map((skill: any) => skill.name) || [],
          newSkill: '',
          profileImage: null,
          currentImageUrl: profileImage || '',
        });
        
        console.log('Profile data set successfully');
      } else {
        console.error('API returned success:false', response.error);
        setError(t('mentor.settings.error.loadFailed', 'Failed to load mentor profile. Please try again later.') as string);
      }
    } catch (err) {
      console.error('Error fetching mentor profile:', err);
      setError(t('mentor.settings.error.loadFailed', 'Failed to load mentor profile. Please try again later.') as string);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setNotificationSettings({ ...notificationSettings, [name]: checked });
  };

  const handleAddSkill = () => {
    if (profileData.newSkill.trim() !== '' && !profileData.skills.includes(profileData.newSkill)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, profileData.newSkill],
        newSkill: '',
      });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageLoading(true);
      
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        setError(t('mentor.settings.error.invalidImageFile', 'Please select a valid image file (JPEG, PNG, or GIF)') as string);
        setImageLoading(false);
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('mentor.settings.error.imageTooLarge', 'Image file is too large. Please select an image smaller than 5MB') as string);
        setImageLoading(false);
        return;
      }
      
      // Store the file in state
      setProfileData({
        ...profileData,
        profileImage: file,
      });
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setImageLoading(false);
      
      // Clean up the URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  };

  const handleRemoveImage = () => {
    // Clean up any object URLs to prevent memory leaks
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    
    setPreviewImage(null);
    setProfileData({
      ...profileData,
      profileImage: null,
      currentImageUrl: '', // Clear the current image URL to indicate we want to remove it
    });
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare data for API - format skills properly for backend processing
      const skillObjects = profileData.skills.map(name => ({ name }));
      console.log('Original skills array:', profileData.skills);
      console.log('Transformed skills objects:', skillObjects);
      
      const updateData: any = {
        bio: profileData.bio,
        title: profileData.headline,
        hourlyRate: Number(profileData.hourlyRate),
        // Format skills as array of objects with names to ensure backend can process them correctly
        skills: skillObjects,
      };
      
      console.log('updateData with skills:', JSON.stringify(updateData));
      
      // If profileImage is present, add it to the form data
      if (profileData.profileImage) {
        updateData.profileImage = profileData.profileImage;
      }
      
      // If currentImageUrl is explicitly set to empty string, it means we want to remove the image
      if (profileData.currentImageUrl === '') {
        updateData.removeProfileImage = true;
      }
      
      console.log('Prepared update data for API:', updateData);
      
      const response = await updateMentorProfile(updateData);
      console.log('Update profile API response:', response);
      
      if (response.success) {
        setSuccess(t('mentor.settings.success.profileUpdated', 'Profile updated successfully') as string);
        console.log('Profile updated successfully');
        // Refresh data
        fetchMentorProfile();
      } else {
        console.error('API returned success:false on update', response.error);
        const apiError = response.error || 'Unknown error';
        setError(t('mentor.settings.error.updateFailed', { error: apiError } as any) as string);
      }
    } catch (err: any) {
      console.error('Error updating mentor profile:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      setError(t('mentor.settings.error.updateFailed', { error: errorMsg } as any) as string);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    // Here you would send the updated notification settings to your backend
    console.log('Saving notification settings:', notificationSettings);
    // Show success message or handle errors
    setSuccess(t('mentor.settings.success.notificationsSaved', 'Notification preferences saved successfully') as string);
  };

  // Create a click handler for the camera icon that triggers the file input click
  const handleAvatarClick = () => {
    if (!imageLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Password validation function
  const validatePassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 40) {
      setPasswordErrors(prev => ({ ...prev, newPassword: t('user.errors.passwordLength') }));
      return false;
    }

    if (!/\d/.test(password)) {
      setPasswordErrors(prev => ({ ...prev, newPassword: t('user.errors.passwordMustContainAtLeastOneNumber') }));
      return false;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      setPasswordErrors(prev => ({ ...prev, newPassword: t('user.errors.passwordMustContainBothLowercaseAndUppercaseLetters') }));
      return false;
    }

    // eslint-disable-next-line no-useless-escape
    if (!/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setPasswordErrors(prev => ({ ...prev, newPassword: t('user.errors.passwordMustContainAtLeastOneSpecialCharacter') }));
      return false;
    }

    return true;
  };

  // Handle password update
  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordErrors({});

    if (!currentPassword) {
      setPasswordErrors(prev => ({ ...prev, currentPassword: t('user.errors.currentPasswordRequired') }));
      return;
    }

    if (!newPassword) {
      setPasswordErrors(prev => ({ ...prev, newPassword: t('user.errors.newPasswordRequired') }));
      return;
    }

    if (!confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: t('user.errors.pleaseConfirmYourNewPassword') }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: t('user.errors.passwordsDoNotMatch') }));
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.updatePassword(currentPassword, newPassword);
      toast.success(t('user.success.passwordUpdatedSuccessfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('user.errors.failedToUpdatePassword');
      if (error.response?.status === 401) {
        setPasswordErrors(prev => ({ ...prev, currentPassword: t('user.errors.currentPasswordIncorrect') }));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('mentor.settings.title', 'Settings') as string}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('mentor.settings.accountDescription', 'Manage your account settings and preferences') as string}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label={t('mentor.settings.tabs.profile', 'Profile') as string} />
          <Tab label={t('mentor.settings.tabs.notifications', 'Notifications') as string} />
          <Tab label={t('mentor.settings.tabs.account', 'Account') as string} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SettingsSection>
          <SettingTitle variant="h6">{t('mentor.settings.profileInformation', 'Profile Information') as string}</SettingTitle>
          
          <AvatarWrapper>
            <AvatarContainer onClick={handleAvatarClick}>
              {imageLoading ? (
                <Box 
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    bgcolor: '#f0f0f0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <CircularProgress size={80} />
                </Box>
              ) : (
                <ProfileAvatar 
                  src={displayImageUrl}
                  alt={profileData.name || t('mentor.settings.profile', 'Profile') as string} 
                  onError={(e) => {
                    console.error('Failed to load image:', displayImageUrl);
                    // If image fails to load, fallback to default
                    (e.target as HTMLImageElement).src = '/avatars/profile.jpg';
                  }}
                />
              )}
              <input
                ref={fileInputRef}
                hidden
                accept="image/*"
                id="profile-image-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={imageLoading}
              />
              <AvatarUploadButton 
                size="large" 
                aria-label={t('mentor.settings.uploadPhoto', 'Upload photo') as string}
                disabled={imageLoading}
              >
                {imageLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : profileData.currentImageUrl || previewImage ? (
                  <EditIcon fontSize="medium" />
                ) : (
                  <AddIcon fontSize="medium" />
                )}
              </AvatarUploadButton>
            </AvatarContainer>

            {(previewImage || (profileData.currentImageUrl && profileData.currentImageUrl !== '')) && (
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                startIcon={<DeleteIcon />}
                sx={{ 
                  mt: 1, 
                  fontWeight: 500,
                  borderRadius: '20px',
                  px: 2
                }}
                onClick={handleRemoveImage}
                disabled={imageLoading || saveLoading}
              >
                {t('mentor.settings.removePhoto', 'Remove photo') as string}
              </Button>
            )}
          </AvatarWrapper>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('mentor.settings.fullName', 'Full Name') as string}
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                margin="normal"
                disabled  // Name should be edited in account settings
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('mentor.settings.emailAddress', 'Email Address') as string}
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                margin="normal"
                disabled  // Email should be edited in account settings
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('mentor.settings.professionalHeadline', 'Professional Headline') as string}
                name="headline"
                value={profileData.headline}
                onChange={handleProfileChange}
                margin="normal"
                placeholder={t('mentor.settings.headlinePlaceholder', 'e.g. Senior Software Engineer & Mentor') as string}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('mentor.settings.bio', 'Bio') as string}
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                margin="normal"
                multiline
                rows={4}
                placeholder={t('mentor.settings.bioPlaceholder', 'Tell mentees about your experience and expertise') as string}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('mentor.settings.hourlyRate', 'Hourly Rate (USD)') as string}
                name="hourlyRate"
                value={profileData.hourlyRate}
                onChange={handleProfileChange}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('mentor.settings.skillsExpertise', 'Skills & Expertise') as string}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {profileData.skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                />
              ))}
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs>
                <TextField
                  fullWidth
                  label={t('mentor.settings.addSkill', 'Add a skill') as string}
                  name="newSkill"
                  value={profileData.newSkill}
                  onChange={handleProfileChange}
                  placeholder={t('mentor.settings.skillPlaceholder', 'e.g. JavaScript, React, Node.js') as string}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSkill}
                  sx={{ height: '56px' }}
                >
                  {t('mentor.settings.add', 'Add') as string}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={saveLoading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveProfile}
            sx={{ mt: 4 }}
            disabled={saveLoading || imageLoading}
          >
            {saveLoading ? t('mentor.settings.saving', 'Saving...') as string : t('mentor.settings.saveChanges', 'Save Changes') as string}
          </Button>
        </SettingsSection>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SettingsSection>
          <SettingTitle variant="h6">{t('mentor.settings.notificationPreferences', 'Notification Preferences') as string}</SettingTitle>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('mentor.settings.notificationDescription', 'Control how and when you receive notifications from the platform') as string}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationChange}
                name="emailNotifications"
                color="primary"
              />
            }
            label={t('mentor.settings.emailNotifications', 'Email Notifications') as string}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            {t('mentor.settings.emailNotificationsDesc', 'Receive emails about important updates and activity') as string}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.sessionReminders}
                onChange={handleNotificationChange}
                name="sessionReminders"
                color="primary"
              />
            }
            label={t('mentor.settings.sessionReminders', 'Session Reminders') as string}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            {t('mentor.settings.sessionRemindersDesc', 'Get reminders before your scheduled mentorship sessions') as string}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.messageNotifications}
                onChange={handleNotificationChange}
                name="messageNotifications"
                color="primary"
              />
            }
            label={t('mentor.settings.messageNotifications', 'Message Notifications') as string}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            {t('mentor.settings.messageNotificationsDesc', 'Receive notifications when you get new messages') as string}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.marketingEmails}
                onChange={handleNotificationChange}
                name="marketingEmails"
                color="primary"
              />
            }
            label={t('mentor.settings.marketingEmails', 'Marketing Emails') as string}
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
            {t('mentor.settings.marketingEmailsDesc', 'Receive promotional emails and newsletters') as string}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveNotifications}
          >
            {t('mentor.settings.savePreferences', 'Save Preferences') as string}
          </Button>
        </SettingsSection>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <SettingsSection>
          <SettingTitle variant="h6">{t('mentor.settings.accountSettings', 'Account Settings') as string}</SettingTitle>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('mentor.settings.accountDescription', 'Manage your account security and preferences') as string}
          </Typography>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            {t('mentor.settings.changePassword', 'Change Password') as string}
          </Typography>
          <form onSubmit={handleUpdatePassword}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('user.passwordSettings.currentPassword', 'Current Password') as string}
                  type={showCurrentPassword ? "text" : "password"}
                  margin="normal"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                  }}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
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
                  label={t('user.passwordSettings.newPassword', 'New Password') as string}
                  type={showNewPassword ? "text" : "password"}
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword}
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
                  label={t('user.passwordSettings.confirmNewPassword', 'Confirm New Password') as string}
                  type={showConfirmPassword ? "text" : "password"}
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
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

            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ mt: 3 }}
              disabled={passwordLoading}
              startIcon={passwordLoading ? <CircularProgress size={24} color="inherit" /> : null}
            >
              {passwordLoading ? t('mentor.settings.saving', 'Updating...') as string : t('user.passwordSettings.updatePassword', 'Update Password') as string}
            </Button>
          </form>

          <Divider sx={{ my: 4 }} />

          {/* <Typography variant="subtitle1" gutterBottom>
            Delete Account
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 1 }}
          >
            Delete My Account
          </Button> */}
        </SettingsSection>
      </TabPanel>
    </Box>
  );
}; 