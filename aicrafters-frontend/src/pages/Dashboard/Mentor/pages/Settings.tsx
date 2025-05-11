import React, { useState } from 'react';
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
} from '@mui/material';
import styled from 'styled-components';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

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
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
`;

const AvatarContainer = styled(Box)`
  position: relative;
  width: fit-content;
  margin: 0 auto 20px;
`;

const AvatarUploadButton = styled(IconButton)`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #3f51b5;
  color: white;
  
  &:hover {
    background-color: #303f9f;
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
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com',
    bio: 'Experienced software engineer with expertise in web development and a passion for mentoring junior developers.',
    headline: 'Senior Software Engineer & Mentor',
    hourlyRate: '75',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
    newSkill: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    messageNotifications: true,
    marketingEmails: false,
  });

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
    // Handle image upload logic here
    console.log('File selected:', event.target.files?.[0]);
  };

  const handleSaveProfile = () => {
    // Here you would send the updated profile data to your backend
    console.log('Saving profile:', profileData);
    // Show success message or handle errors
  };

  const handleSaveNotifications = () => {
    // Here you would send the updated notification settings to your backend
    console.log('Saving notification settings:', notificationSettings);
    // Show success message or handle errors
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings and preferences
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="Profile" />
          <Tab label="Notifications" />
          <Tab label="Account" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SettingsSection>
          <SettingTitle variant="h6">Profile Information</SettingTitle>
          
          <AvatarContainer>
            <ProfileAvatar src="/avatars/profile.jpg" alt={profileData.name} />
            <label htmlFor="profile-image-upload">
              <input
                hidden
                accept="image/*"
                id="profile-image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <AvatarUploadButton size="small" aria-label="upload picture">
                <PhotoCameraIcon />
              </AvatarUploadButton>
            </label>
          </AvatarContainer>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Headline"
                name="headline"
                value={profileData.headline}
                onChange={handleProfileChange}
                margin="normal"
                placeholder="e.g. Senior Software Engineer & Mentor"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                margin="normal"
                multiline
                rows={4}
                placeholder="Tell mentees about your experience and expertise"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate (USD)"
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
              Skills & Expertise
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
                  label="Add a skill"
                  name="newSkill"
                  value={profileData.newSkill}
                  onChange={handleProfileChange}
                  placeholder="e.g. JavaScript, React, Node.js"
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSkill}
                  sx={{ height: '56px' }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveProfile}
            sx={{ mt: 4 }}
          >
            Save Changes
          </Button>
        </SettingsSection>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <SettingsSection>
          <SettingTitle variant="h6">Notification Preferences</SettingTitle>
          <Typography variant="body2" color="text.secondary" paragraph>
            Control how and when you receive notifications from the platform
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
            label="Email Notifications"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            Receive emails about important updates and activity
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
            label="Session Reminders"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            Get reminders before your scheduled mentorship sessions
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
            label="Message Notifications"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
            Receive notifications when you get new messages
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
            label="Marketing Emails"
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 3 }}>
            Receive promotional emails and newsletters
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveNotifications}
          >
            Save Preferences
          </Button>
        </SettingsSection>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <SettingsSection>
          <SettingTitle variant="h6">Account Settings</SettingTitle>
          <Typography variant="body2" color="text.secondary" paragraph>
            Manage your account security and preferences
          </Typography>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Change Password
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}></Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                margin="normal"
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Update Password
          </Button>

          <Divider sx={{ my: 4 }} />

          <Typography variant="subtitle1" gutterBottom>
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
          </Button>
        </SettingsSection>
      </TabPanel>
    </Box>
  );
}; 