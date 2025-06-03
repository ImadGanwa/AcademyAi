import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Chip, FormControl, FormControlLabel,  Checkbox, useTheme, MenuItem, Select, SelectChangeEvent, CircularProgress, Alert, Snackbar, OutlinedInput, ListItemText } from '@mui/material';
import styled from 'styled-components';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { applyToBecomeMentor } from '../../../api/mentor';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, getCountryCode, availableLanguages } from '../../../utils/countryUtils';
import { PROFESSIONAL_ROLES, AREAS_OF_INTEREST } from '../../../utils/constants';

// Styled components
const FormSection = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 50px auto 80px;
  background-color: ${props => props.theme.palette.background.paper};
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const StepIndicator = styled.div<{ currentStep: number }>`
  width: 100%;
  height: 4px;
  background-color: #e2e8f0;
  margin-bottom: 30px;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    display: block;
    width: ${props => `${(props.currentStep / 3) * 100}%`};
    height: 100%;
    background-color: ${props => props.theme.palette.primary.main};
    transition: width 0.3s ease;
  }
`;

const FormTitle = styled(Typography)`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.palette.text.title};
  margin-bottom: 30px;
  text-align: center;
`;

const FormField = styled.div`
  margin-bottom: 20px;
`;

const FieldLabel = styled(Typography)`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 8px;
  
  .required {
    color: ${props => props.theme.palette.error.main};
    margin-left: 2px;
  }
`;

const LanguageChip = styled(Chip)`
  margin-right: 5px;
  margin-bottom: 5px;
  background-color: ${props => `${props.theme.palette.primary.main}15`};
  color: ${props => props.theme.palette.primary.main};
  font-weight: 500;
  
  .MuiChip-deleteIcon {
    color: ${props => props.theme.palette.primary.main};
  }
`;

const ButtonContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
`;

const NextButton = styled(Button)`
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  
  &:hover {
    background-color: ${props => props.theme.palette.primary.dark};
  }
`;

const BackButton = styled(Button)`
  background-color: transparent;
  color: ${props => props.theme.palette.text.secondary};
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.palette.divider};
  
  &:hover {
    background-color: ${props => `${props.theme.palette.divider}30`};
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${props => props.theme.palette.success.main};
  color: white;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  
  &:hover {
    background-color: ${props => props.theme.palette.success.dark};
  }
`;

const RadioOptionContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
`;

const RadioOption = styled(Box)<{ selected: boolean }>`
  padding: 16px;
  border: 1px solid ${props => props.selected ? props.theme.palette.primary.main : props.theme.palette.divider};
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? `${props.theme.palette.primary.main}10` : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.palette.primary.main};
    background-color: ${props => `${props.theme.palette.primary.main}05`};
  }
`;

interface MentorApplicationFormProps {
  onSubmitSuccess?: () => void;
}

const MentorApplicationForm: React.FC<MentorApplicationFormProps> = ({ onSubmitSuccess }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [newLanguage, setNewLanguage] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    linkedinUrl: '',
    country: '',
    bio: '',
    professionalRole: '',
    academicBackground: '',
    areasOfInterest: [] as string[],
    hasInternationalExperience: false,
    desiredDuration: '1h',
    mentorPreferences: {
      internationalExperience: false,
      fundingAgency: false,
      internationalOrganization: false
    },
    experience: '',
    hourlyRate: 50,
    availability: {
      weekdays: true,
      weekends: false,
      mornings: true,
      afternoons: false,
      evenings: false
    }
  });
  
  // Extract the language prefix from the current URL
  const langPrefix = location.pathname.split('/')[1];
  
  // Filter out already selected languages
  const filteredLanguages = availableLanguages.filter(lang => !selectedLanguages.includes(lang));
  
  const handleLanguageDelete = (languageToDelete: string) => {
    setSelectedLanguages((languages) => 
      languages.filter((language) => language !== languageToDelete)
    );
  };
  
  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value && !selectedLanguages.includes(value)) {
      setSelectedLanguages(prev => [...prev, value]);
    }
    setNewLanguage(''); // Reset selection
  };
  
  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim() !== '') {
      e.preventDefault();
      if (!formData.areasOfInterest.includes(newInterest.trim())) {
        setFormData(prev => ({
          ...prev,
          areasOfInterest: [...prev.areasOfInterest, newInterest.trim()]
        }));
      }
      setNewInterest('');
    }
  };
  
  const handleAreasOfInterestChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    
    setFormData(prev => ({
      ...prev,
      areasOfInterest: typeof value === 'string' ? value.split(',') : value,
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDurationChange = (value: string) => {
    setFormData(prev => ({ ...prev, desiredDuration: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'hasInternationalExperience') {
      setFormData(prev => ({ ...prev, hasInternationalExperience: checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        mentorPreferences: {
          ...prev.mentorPreferences,
          [name]: checked
        }
      }));
    }
  };
  
  const validateForm = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = t('mentor.applicationForm.errors.fullNameRequired', 'Full name is required') as string;
        isValid = false;
      } else if (formData.fullName.length > 100) {
        newErrors.fullName = t('mentor.applicationForm.errors.fullNameTooLong', 'Full name must be 100 characters or less') as string;
        isValid = false;
      }
      
      if (!formData.email.trim()) {
        newErrors.email = t('mentor.applicationForm.errors.emailRequired', 'Email is required') as string;
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = t('mentor.applicationForm.errors.emailInvalid', 'Please enter a valid email address') as string;
        isValid = false;
      }
      
      if (!formData.linkedinUrl.trim()) {
        newErrors.linkedinUrl = t('mentor.applicationForm.errors.linkedinRequired', 'LinkedIn URL is required') as string;
        isValid = false;
      }
      
      if (!formData.country.trim()) {
        newErrors.country = t('mentor.applicationForm.errors.countryRequired', 'Country is required') as string;
        isValid = false;
      }
      
      if (!formData.bio.trim()) {
        newErrors.bio = t('mentor.applicationForm.errors.bioRequired', 'Bio is required') as string;
        isValid = false;
      } else if (formData.bio.length > 500) {
        newErrors.bio = t('mentor.applicationForm.errors.bioTooLong', 'Bio must be 500 characters or less') as string;
        isValid = false;
      }
    }
    
    if (step === 2) {
      if (!formData.professionalRole.trim()) {
        newErrors.professionalRole = t('mentor.applicationForm.errors.professionalRoleRequired', 'Professional role is required') as string;
        isValid = false;
      }
      
      if (!formData.experience.trim()) {
        newErrors.experience = t('mentor.applicationForm.errors.experienceRequired', 'Professional experience is required') as string;
        isValid = false;
      } else if (formData.experience.length > 500) {
        newErrors.experience = t('mentor.applicationForm.errors.experienceTooLong', 'Professional experience must be 500 characters or less') as string;
        isValid = false;
      }
      
      if (!formData.academicBackground.trim()) {
        newErrors.academicBackground = t('mentor.applicationForm.errors.academicBackgroundRequired', 'Academic background is required') as string;
        isValid = false;
      } else if (formData.academicBackground.length > 500) {
        newErrors.academicBackground = t('mentor.applicationForm.errors.academicBackgroundTooLong', 'Academic background must be 500 characters or less') as string;
        isValid = false;
      }
      
      if (formData.areasOfInterest.length === 0) {
        newErrors.areasOfInterest = t('mentor.applicationForm.errors.areasOfInterestRequired', 'At least one area of interest is required') as string;
        isValid = false;
      }
    }
    
    setFormErrors(newErrors);
    return isValid;
  };
  
  const handleNext = () => {
    if (validateForm(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async () => {
    if (!validateForm(currentStep)) {
      return;
    }
    
    // Transform form data to match API expectations
    const applicationData = {
      fullName: formData.fullName,
      email: formData.email,
      bio: formData.bio,
      skills: formData.areasOfInterest,
      hourlyRate: Number(formData.hourlyRate),
      availability: {
        weekdays: formData.availability.weekdays,
        weekends: formData.availability.weekends,
        mornings: formData.availability.mornings,
        afternoons: formData.availability.afternoons,
        evenings: formData.availability.evenings
      },
      languages: selectedLanguages,
      professionalInfo: {
        role: formData.professionalRole,
        linkedIn: formData.linkedinUrl,
        academicBackground: formData.academicBackground,
        experience: formData.experience
      },
      preferences: {
        sessionDuration: formData.desiredDuration,
        ...formData.mentorPreferences
      },
      countries: [getCountryCode(formData.country)]
    };
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Submit form data to backend
      const response = await applyToBecomeMentor(applicationData);
      console.log('Application submitted successfully:', response);
      
      // Extract the language prefix from the current URL
      const langPrefix = location.pathname.split('/')[1];
      
      // Navigate to confirmation page with correct language prefix
      navigate(`/${langPrefix}/mentorship/application-confirmation`);
      
      // Call onSubmitSuccess callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit your application. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <FormSection>
      <FormTitle variant="h4">{t('mentor.applicationForm.title', 'Join our growing network of mentors') as string}</FormTitle>
      <StepIndicator currentStep={currentStep} />
      
      {currentStep === 1 && (
        <form>
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.fullName', 'Full Name') as string}
              <span className="required">*</span>
              <span style={{ marginLeft: '8px', fontSize: '12px', color: theme.palette.text.secondary }}>
                ({formData.fullName.length}/100 {t('mentor.applicationForm.characters', 'characters') as string})
              </span>
            </FieldLabel>
            <TextField 
              fullWidth
              placeholder={t('mentor.applicationForm.fullNamePlaceholder', 'John Doe') as string}
              variant="outlined"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              error={!!formErrors.fullName}
              helperText={formErrors.fullName}
              inputProps={{ maxLength: 100 }}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.email', 'Email') as string}
              <span className="required">*</span>
            </FieldLabel>
            <TextField 
              fullWidth
              placeholder={t('mentor.applicationForm.emailPlaceholder', 'email@example.com') as string}
              variant="outlined"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.bio', 'Biography') as string}
              <span className="required">*</span>
              <span style={{ marginLeft: '8px', fontSize: '12px', color: theme.palette.text.secondary }}>
                ({formData.bio.length}/500 {t('mentor.applicationForm.characters', 'characters') as string})
              </span>
            </FieldLabel>
            <TextField 
              fullWidth
              multiline
              rows={4}
              placeholder={t('mentor.applicationForm.bioPlaceholder', 'Briefly describe yourself, your background, and your expertise (max 100 words)') as string}
              variant="outlined"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              required
              error={!!formErrors.bio}
              helperText={formErrors.bio}
              inputProps={{ maxLength: 500 }}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.linkedinUrl', 'LinkedIn URL') as string}
              <span className="required">*</span>
            </FieldLabel>
            <TextField 
              fullWidth
              placeholder={t('mentor.applicationForm.linkedinUrlPlaceholder', 'LinkedIn profile') as string}
              variant="outlined"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              required
              error={!!formErrors.linkedinUrl}
              helperText={formErrors.linkedinUrl}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 1 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </Box>
                ),
              }}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.country', 'Country') as string}
              <span className="required">*</span>
            </FieldLabel>
            <FormControl fullWidth error={!!formErrors.country}>
              <Select
                displayEmpty
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                variant="outlined"
                required
                error={!!formErrors.country}
              >
                <MenuItem value="" disabled>
                  {t('mentor.applicationForm.selectCountry', 'Select a country') as string}
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
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentorship.applicationForm.languagesSpokenLabel', 'Languages Spoken') as string}
              <span className="required">*</span>
            </FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
              {selectedLanguages.map((language) => (
                <LanguageChip
                  key={language}
                  label={language}
                  onDelete={() => handleLanguageDelete(language)}
                  disabled={language === 'English' && selectedLanguages.length === 1}
                />
              ))}
            </div>
            <FormControl fullWidth variant="outlined" required>
              <Select
                displayEmpty
                value={newLanguage}
                onChange={handleLanguageChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: theme.palette.text.secondary }}>{t('mentor.applicationForm.selectLanguage', 'Select a language') as string}</span>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="" disabled>
                  <em>{t('mentor.applicationForm.selectLanguage', 'Select a language') as string}</em>
                </MenuItem>
                {filteredLanguages.map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
          
          <ButtonContainer>
            <NextButton 
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
            >
              {t('mentor.applicationForm.next', 'Next') as string}
            </NextButton>
          </ButtonContainer>
        </form>
      )}
      
      {currentStep === 2 && (
        <form>
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.professionalRole', 'Desired Professional Role') as string}
              <span className="required">*</span>
            </FieldLabel>
            <FormControl fullWidth error={!!formErrors.professionalRole}>
              <Select
                displayEmpty
                value={formData.professionalRole}
                onChange={(e) => setFormData({...formData, professionalRole: e.target.value})}
                variant="outlined"
                required
                error={!!formErrors.professionalRole}
              >
                <MenuItem value="" disabled>
                  {t('mentor.applicationForm.selectRole', 'Select a professional role') as string}
                </MenuItem>
                {PROFESSIONAL_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.professionalRole && (
                <Typography variant="caption" color="error">
                  {formErrors.professionalRole}
                </Typography>
              )}
            </FormControl>
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.experience', 'Professional Experience') as string}
              <span className="required">*</span>
              <span style={{ marginLeft: '8px', fontSize: '12px', color: theme.palette.text.secondary }}>
                ({formData.experience.length}/500 {t('mentor.applicationForm.characters', 'characters') as string})
              </span>
            </FieldLabel>
            <TextField 
              fullWidth
              multiline
              rows={4}
              placeholder={t('mentor.applicationForm.experiencePlaceholder', 'Describe your professional experience, achievements, and skills') as string}
              variant="outlined"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              required
              error={!!formErrors.experience}
              helperText={formErrors.experience}
              inputProps={{ maxLength: 500 }}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.academicBackground', 'Academic Background') as string}
              <span className="required">*</span>
              <span style={{ marginLeft: '8px', fontSize: '12px', color: theme.palette.text.secondary }}>
                ({formData.academicBackground.length}/500 {t('mentor.applicationForm.characters', 'characters') as string})
              </span>
            </FieldLabel>
            <TextField 
              fullWidth
              multiline
              rows={4}
              placeholder={t('mentor.applicationForm.academicBackgroundPlaceholder', 'Describe your academic qualifications and background') as string}
              variant="outlined"
              name="academicBackground"
              value={formData.academicBackground}
              onChange={handleInputChange}
              required
              error={!!formErrors.academicBackground}
              helperText={formErrors.academicBackground}
              inputProps={{ maxLength: 500 }}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.areasOfInterest', 'Areas of Interest') as string}
              <span className="required">*</span>
            </FieldLabel>
            <FormControl fullWidth error={!!formErrors.areasOfInterest}>
              <Select
                multiple
                displayEmpty
                value={formData.areasOfInterest}
                onChange={handleAreasOfInterestChange}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                required
                error={!!formErrors.areasOfInterest}
              >
                <MenuItem disabled value="">
                  <em>{t('mentor.applicationForm.selectAreasOfInterest', 'Select areas of interest') as string}</em>
                </MenuItem>
                {AREAS_OF_INTEREST.map((area) => (
                  <MenuItem key={area} value={area}>
                    <Checkbox checked={formData.areasOfInterest.indexOf(area) > -1} />
                    <ListItemText primary={area} />
                  </MenuItem>
                ))}
              </Select>
              {formErrors.areasOfInterest && (
                <Typography variant="caption" color="error">
                  {formErrors.areasOfInterest}
                </Typography>
              )}
            </FormControl>
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.internationalExperience', 'International Experience') as string}
            </FieldLabel>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.hasInternationalExperience}
                  onChange={handleCheckboxChange}
                  name="hasInternationalExperience"
                  color="primary"
                />
              }
              label={t('mentor.applicationForm.hasInternationalExperience', 'Yes, I have international work experience') as string}
            />
          </FormField>
          
          <ButtonContainer>
            <BackButton 
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              {t('mentor.applicationForm.previous', 'Previous') as string}
            </BackButton>
            <NextButton 
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
            >
              {t('mentor.applicationForm.next', 'Next') as string}
            </NextButton>
          </ButtonContainer>
        </form>
      )}
      
      {currentStep === 3 && (
        <form>
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.desiredDuration', 'Desired Session Duration') as string}
            </FieldLabel>
            <RadioOptionContainer>
              <RadioOption 
                selected={formData.desiredDuration === '1h'}
                onClick={() => handleDurationChange('1h')}
              >
                <Typography variant="body1" fontWeight={500}>{t('mentor.applicationForm.duration.1h', '1h over 1 month') as string}</Typography>
              </RadioOption>
              <RadioOption 
                selected={formData.desiredDuration === '2-3h'}
                onClick={() => handleDurationChange('2-3h')}
              >
                <Typography variant="body1" fontWeight={500}>{t('mentor.applicationForm.duration.2-3h', '2-3h over 2 months') as string}</Typography>
              </RadioOption>
              <RadioOption 
                selected={formData.desiredDuration === '4-5h'}
                onClick={() => handleDurationChange('4-5h')}
              >
                <Typography variant="body1" fontWeight={500}>{t('mentor.applicationForm.duration.4-5h', '4-5h over 4 months') as string}</Typography>
              </RadioOption>
              <RadioOption 
                selected={formData.desiredDuration === '6h+'}
                onClick={() => handleDurationChange('6h+')}
              >
                <Typography variant="body1" fontWeight={500}>{t('mentor.applicationForm.duration.6h+', '6h over 6 months') as string}</Typography>
              </RadioOption>
            </RadioOptionContainer>
          </FormField>
          
          <FormField>
            <FieldLabel>
              {t('mentor.applicationForm.mentorPreferences', 'Mentor Preferences') as string}
            </FieldLabel>
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.mentorPreferences.internationalExperience}
                    onChange={handleCheckboxChange}
                    name="internationalExperience"
                    color="primary"
                  />
                }
                label={t('mentor.applicationForm.internationalExperiencePreference', 'Mentor with international experience') as string}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.mentorPreferences.fundingAgency}
                    onChange={handleCheckboxChange}
                    name="fundingAgency"
                    color="primary"
                  />
                }
                label={t('mentor.applicationForm.fundingAgency', 'Funding agency experience') as string}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.mentorPreferences.internationalOrganization}
                    onChange={handleCheckboxChange}
                    name="internationalOrganization"
                    color="primary"
                  />
                }
                label={t('mentor.applicationForm.internationalOrganization', 'International organization background') as string}
              />
            </Box>
          </FormField>
          
          <ButtonContainer>
            <BackButton 
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={submitting}
            >
              {t('mentor.applicationForm.back', 'Back') as string}
            </BackButton>
            <SubmitButton 
              endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : undefined} 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? t('mentor.applicationForm.submitting', 'Submitting...') as string : t('mentor.applicationForm.submitApplication', 'Submit Application') as string}
            </SubmitButton>
          </ButtonContainer>
          
          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
        </form>
      )}
    </FormSection>
  );
};

export default MentorApplicationForm; 