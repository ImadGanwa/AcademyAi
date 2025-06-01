import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';

import { getMentorProfile, updateMentorProfile } from '../../../../api/mentor';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { 
  ProfileTab, 
  NotificationsTab, 
  AccountTab,
  TabPanel,
} from '../components/Settings';
import { availableLanguages } from '../../../../utils/countryUtils';



// Type definitions
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

interface NotificationSettings {
  emailNotifications: boolean;
  sessionReminders: boolean;
  messageNotifications: boolean;
  marketingEmails: boolean;
}

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
    expertise: [],
    languages: [],
    country: '',
    professionalInfo: {
      role: '',
      linkedIn: '',
      academicBackground: '',
      experience: '',
    },
    profileImage: null,
    currentImageUrl: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
        console.log('Professional info from API:', profile.professionalInfo);
        console.log('Experience from API:', profile.experience);
        
        // Reset preview when fetching new data
        setPreviewImage(null);
        
        // Process skills array - ensure we extract string names from any objects
        const processedSkills = Array.isArray(profile.skills) 
          ? profile.skills.map((skill: any) => {
              // If skill is an object with a name property, return the name
              if (skill && typeof skill === 'object' && 'name' in skill) {
                return skill.name;
              }
              // If skill is already a string, return it directly
              if (typeof skill === 'string') {
                return skill;
              }
              // Otherwise, convert to string
              return String(skill);
            })
          : [];
        
        // Process languages array - ensure we extract string values
        const processedLanguages = Array.isArray(profile.languages)
          ? profile.languages.map((lang: any) => {
              // If language is an object, try to extract a meaningful string
              if (lang && typeof lang === 'object') {
                if ('name' in lang) return lang.name;
                if ('value' in lang) return lang.value;
                return String(lang);
              }
              // If language is already a string, return it directly
              return String(lang);
            })
          : ['English'];
        
        // Process country value - ensure it's a string
        let processedCountry = '';
        if (profile.country) {
          if (typeof profile.country === 'object' && 'name' in profile.country) {
            processedCountry = profile.country.name;
          } else if (typeof profile.country === 'string') {
            processedCountry = profile.country;
          } else {
            processedCountry = String(profile.country);
          }
        }
        
        // Extract professional info from profile
        const professionalInfo = profile.professionalInfo || {};
        
        setProfileData({
          name: fullName || '',
          email: email || '',
          bio: profile.bio || '',
          expertise: processedSkills,
          languages: processedLanguages,
          country: processedCountry,
          professionalInfo: {
            role: professionalInfo.role || '',
            linkedIn: professionalInfo.linkedIn || profile.socialLinks?.linkedin || '',
            experience: professionalInfo.experience || '',
            academicBackground: professionalInfo.academicBackground || ''
          },
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


  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setError('');
    setSuccess('');
    setFormErrors({});
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (!profileData.name.trim()) {
      newErrors.name = t('mentor.settings.errors.nameRequired', 'Full name is required') as string;
      isValid = false;
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = t('mentor.settings.errors.emailRequired', 'Email is required') as string;
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = t('mentor.settings.errors.emailInvalid', 'Please enter a valid email address') as string;
      isValid = false;
    }
    
    if (!profileData.professionalInfo.role.trim()) {
      newErrors['professionalInfo.role'] = t('mentor.settings.errors.roleRequired', 'Professional role is required') as string;
      isValid = false;
    }
    
    if (!profileData.bio.trim()) {
      newErrors.bio = t('mentor.settings.errors.bioRequired', 'Bio is required') as string;
      isValid = false;
    }
    
    // Fix error with professionalInfo.experience - add null/undefined check before calling trim
    const experience = profileData.professionalInfo?.experience || '';
    if (!experience.trim()) {
      newErrors['professionalInfo.experience'] = t('mentor.settings.errors.experienceRequired', 'Professional experience is required') as string;
      isValid = false;
    }
    
    if (!profileData.professionalInfo.academicBackground.trim()) {
      newErrors['professionalInfo.academicBackground'] = t('mentor.settings.errors.academicBackgroundRequired', 'Academic background is required') as string;
      isValid = false;
    }
    
    if (profileData.expertise.length === 0) {
      newErrors.expertise = t('mentor.settings.errors.skillsRequired', 'At least one area of expertise is required') as string;
      isValid = false;
    }
    
    if (profileData.languages.length === 0) {
      newErrors.languages = t('mentor.settings.errors.languagesRequired', 'At least one language is required') as string;
      isValid = false;
    }
    
    if (!profileData.country.trim()) {
      newErrors.country = t('mentor.settings.errors.countryRequired', 'Country is required') as string;
      isValid = false;
    }
    
    setFormErrors(newErrors);
    
    if (!isValid) {
      setSaveLoading(false);
      setError(t('mentor.settings.error.validationFailed', 'Please fill in all required fields') as string);
      return;
    }
    
    try {
      // Prepare data for API
      const updateData: any = {
        fullName: profileData.name, // Use name as fullName for the API
        bio: profileData.bio,
        expertise: profileData.expertise,
        languages: profileData.languages,
        country: profileData.country,
        professionalInfo: {
          role: profileData.professionalInfo.role,
          linkedIn: profileData.professionalInfo.linkedIn || '',
          academicBackground: profileData.professionalInfo.academicBackground,
          experience: profileData.professionalInfo.experience
        }
      };
      
      console.log('Prepared update data for API:', updateData);
      
      // If profileImage is present, add it to the form data
      if (profileData.profileImage) {
        updateData.profileImage = profileData.profileImage;
      }
      
      // If currentImageUrl is explicitly set to empty string, it means we want to remove the image
      if (profileData.currentImageUrl === '') {
        updateData.removeProfileImage = true;
      }
      
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
        {t('mentor.settings.title', 'Settings')}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="settings tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              px: 3
            }
          }}
        >
          <Tab label={t('mentor.settings.tabs.profile', 'Profile')} />
          <Tab label={t('mentor.settings.tabs.notifications', 'Notifications')} />
          <Tab label={t('mentor.settings.tabs.account', 'Account')} />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <ProfileTab 
              profileData={profileData}
              setProfileData={setProfileData}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              saveLoading={saveLoading}
              imageLoading={imageLoading}
              setImageLoading={setImageLoading}
              error={error}
              success={success}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              handleSaveProfile={handleSaveProfile}
              displayImageUrl={displayImageUrl}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <NotificationsTab 
              notificationSettings={notificationSettings}
              setNotificationSettings={setNotificationSettings}
              handleSaveNotifications={handleSaveNotifications}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <AccountTab />
          </TabPanel>
        </>
      )}
    </Box>
  );
}; 