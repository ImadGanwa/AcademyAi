import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  OutlinedInput,
  ListItemText,
  SelectChangeEvent,
  InputLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { AREAS_OF_INTEREST, PROFESSIONAL_ROLES } from '../../../../../utils/constants';
import { COUNTRIES, availableLanguages } from '../../../../../utils/countryUtils';
import { ProfileAvatar, AvatarWrapper, AvatarContainer, AvatarUploadButton, SettingsSection, SettingTitle } from './StyledComponents';
import { Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  languages: string[];
  country: string;
  professionalInfo: {
    role: string;
    linkedIn: string;
    academicBackground: string;
    experience: string;
  };
  profileImage: File | null;
  currentImageUrl: string;
}

interface ProfileTabProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  formErrors: Record<string, string>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saveLoading: boolean;
  imageLoading: boolean;
  setImageLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  success: string;
  previewImage: string | null;
  setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>;
  handleSaveProfile: () => Promise<void>;
  displayImageUrl: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profileData,
  setProfileData,
  formErrors,
  setFormErrors,
  saveLoading,
  imageLoading,
  setImageLoading,
  error,
  success,
  previewImage,
  setPreviewImage,
  handleSaveProfile,
  displayImageUrl
}) => {
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    // Handle nested professionalInfo fields
    if (name.startsWith('professionalInfo.')) {
      const fieldName = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        professionalInfo: {
          ...prev.professionalInfo,
          [fieldName]: value
        }
      }));
      
      // Clear the corresponding error when the user changes the field
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    } else {
      setProfileData({ ...profileData, [name]: value });
      // Clear the corresponding error when the user changes the field
      if (formErrors[name]) {
        setFormErrors({ ...formErrors, [name]: '' });
      }
    }
  };

  const handleSkillsChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    
    // On autofill we get a stringified value.
    setProfileData(prev => ({
      ...prev,
      expertise: typeof value === 'string' ? value.split(',') : value,
    }));
    
    // Clear skills error when user selects skills
    if (formErrors.expertise) {
      setFormErrors({ ...formErrors, expertise: '' });
    }
  };

  const handleLanguagesChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    
    setProfileData(prev => ({
      ...prev,
      languages: typeof value === 'string' ? value.split(',') : value,
    }));
    
    // Clear languages error when user selects languages
    if (formErrors.languages) {
      setFormErrors({ ...formErrors, languages: '' });
    }
  };

  const handleCountryChange = (event: SelectChangeEvent) => {
    setProfileData(prev => ({
      ...prev,
      country: event.target.value as string,
    }));
    
    // Clear country error when user selects a country
    if (formErrors.country) {
      setFormErrors({ ...formErrors, country: '' });
    }
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setProfileData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        role: event.target.value as string,
      },
    }));
    
    // Clear role error when user selects a role
    if (formErrors['professionalInfo.role']) {
      setFormErrors({ ...formErrors, 'professionalInfo.role': '' });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageLoading(true);
      
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        setFormErrors(prev => ({
          ...prev,
          profileImage: t('mentor.settings.error.invalidImageFile', 'Please select a valid image file (JPEG, PNG, or GIF)') as string
        }));
        setImageLoading(false);
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          profileImage: t('mentor.settings.error.imageTooLarge', 'Image file is too large. Please select an image smaller than 5MB') as string
        }));
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

  // Create a click handler for the camera icon that triggers the file input click
  const handleAvatarClick = () => {
    if (!imageLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <SettingsSection>
      <SettingTitle variant="h6">{t('mentor.settings.profileInformation', 'Profile Information') as string}</SettingTitle>
      
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
            ) : (
              <EditIcon fontSize="medium" />
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
            label={`${t('mentor.settings.fullName', 'Full Name') as string} `}
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            margin="normal"
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={`${t('mentor.settings.emailAddress', 'Email Address') as string} `}
            name="email"
            type="email"
            value={profileData.email}
            onChange={handleProfileChange}
            margin="normal"
            disabled
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth margin="normal" required error={!!formErrors['professionalInfo.role']}>
            <InputLabel id="professional-role-label">
              {`${t('mentor.settings.professionalRole', 'Professional Role') as string} `}
            </InputLabel>
            <Select
              labelId="professional-role-label"
              value={profileData.professionalInfo.role}
              onChange={handleRoleChange}
              label={`${t('mentor.settings.professionalRole', 'Professional Role') as string} `}
            >
              <MenuItem value="" disabled>
                <em>{t('mentor.settings.selectRole', 'Select a professional role') as string}</em>
              </MenuItem>
              {PROFESSIONAL_ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            {formErrors['professionalInfo.role'] && (
              <Typography variant="caption" color="error">
                {formErrors['professionalInfo.role']}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={`${t('mentor.settings.linkedIn', 'LinkedIn Profile') as string} `}
            name="professionalInfo.linkedIn"
            value={profileData.professionalInfo.linkedIn}
            onChange={handleProfileChange}
            margin="normal"
            placeholder="https://linkedin.com/in/your-profile"
            inputProps={{ 
              pattern: "https://linkedin.com/in/.*|https://www.linkedin.com/in/.*|http://linkedin.com/in/.*|http://www.linkedin.com/in/.*" 
            }}
            error={!!formErrors['professionalInfo.linkedIn']}
            helperText={formErrors['professionalInfo.linkedIn']}
            required

          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={
              <>
                {`${t('mentor.settings.bio', 'Bio') as string} `}
                <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>
                  ({profileData.bio.length}/500)
                </span>
              </>
            }
            name="bio"
            value={profileData.bio}
            onChange={handleProfileChange}
            margin="normal"
            multiline
            rows={4}
            placeholder={t('mentor.settings.bioPlaceholder', 'Tell mentees about yourself (max 100 words)') as string}
            inputProps={{ maxLength: 500 }}
            required
            error={!!formErrors.bio}
            helperText={formErrors.bio}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={`${t('mentor.settings.professionalExperience', 'Professional Experience') as string} `}
            name="professionalInfo.experience"
            value={profileData.professionalInfo.experience}
            onChange={handleProfileChange}
            margin="normal"
            multiline
            rows={4}
            placeholder={t('mentor.settings.experiencePlaceholder', 'Describe your professional experience, achievements, and skills') as string}
            required
            error={!!formErrors['professionalInfo.experience']}
            helperText={formErrors['professionalInfo.experience']}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={`${t('mentor.settings.academicBackground', 'Academic Background') as string} `}
            name="professionalInfo.academicBackground"
            value={profileData.professionalInfo.academicBackground}
            onChange={handleProfileChange}
            margin="normal"
            multiline
            rows={4}
            placeholder={t('mentor.settings.academicBackgroundPlaceholder', 'Describe your academic qualifications and background') as string}
            required
            error={!!formErrors['professionalInfo.academicBackground']}
            helperText={formErrors['professionalInfo.academicBackground']}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <FormControl fullWidth margin="normal" required error={!!formErrors.expertise}>
          <InputLabel id="areas-expertise-label">
            {`${t('mentor.settings.areasOfExpertise', 'Areas of Expertise') as string} `}
          </InputLabel>
          <Select
            labelId="areas-expertise-label"
            multiple
            value={profileData.expertise}
            onChange={handleSkillsChange}
            input={<OutlinedInput label={`${t('mentor.settings.areasOfExpertise', 'Areas of Expertise') as string} `} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {AREAS_OF_INTEREST.map((area) => (
              <MenuItem key={area} value={area}>
                <Checkbox checked={profileData.expertise.indexOf(area) > -1} />
                <ListItemText primary={area} />
              </MenuItem>
            ))}
          </Select>
          {formErrors.expertise && (
            <Typography variant="caption" color="error">
              {formErrors.expertise}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth margin="normal" required error={!!formErrors.languages}>
          <InputLabel id="languages-label">
            {`${t('mentor.settings.languages', 'Languages') as string} `}
          </InputLabel>
          <Select
            labelId="languages-label"
            multiple
            value={profileData.languages}
            onChange={handleLanguagesChange}
            input={<OutlinedInput label={`${t('mentor.settings.languages', 'Languages') as string} `} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {availableLanguages.map((language) => (
              <MenuItem key={language} value={language}>
                <Checkbox checked={profileData.languages.indexOf(language) > -1} />
                <ListItemText primary={language} />
              </MenuItem>
            ))}
          </Select>
          {formErrors.languages && (
            <Typography variant="caption" color="error">
              {formErrors.languages}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth margin="normal" required error={!!formErrors.country}>
          <InputLabel id="country-label">
            {`${t('mentor.settings.country', 'Country') as string} `}
          </InputLabel>
          <Select
            labelId="country-label"
            value={profileData.country}
            onChange={handleCountryChange}
            label={`${t('mentor.settings.country', 'Country') as string} `}
          >
            <MenuItem value="" disabled>
              <em>{t('mentor.settings.selectCountry', 'Select a country') as string}</em>
            </MenuItem>
            {COUNTRIES.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
          {formErrors.country && (
            <Typography variant="caption" color="error">
              {formErrors.country}
            </Typography>
          )}
        </FormControl>
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
  );
};

export default ProfileTab;

 