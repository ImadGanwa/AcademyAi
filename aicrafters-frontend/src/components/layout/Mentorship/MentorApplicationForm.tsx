import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Chip, FormControl, FormControlLabel,  Checkbox, useTheme, MenuItem, Select, SelectChangeEvent, CircularProgress, Alert, Snackbar } from '@mui/material';
import styled from 'styled-components';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { applyToBecomeMentor } from '../../../api/mentor';

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
  justify-content: space-between;
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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    linkedinUrl: '',
    country: '',
    professionalRole: '',
    academicBackground: '',
    areasOfInterest: ['Digital Marketing', 'Data Science'],
    hasInternationalExperience: false,
    desiredDuration: '1h',
    mentorPreferences: {
      internationalExperience: false,
      fundingAgency: false,
      internationalOrganization: false
    },
    bio: '',
    expertise: [] as string[],
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
  
  // List of available languages
  const availableLanguages = [
    'English', 'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 
    'Chinese', 'Japanese', 'Russian', 'Hindi', 'Italian', 'Swahili'
  ].filter(lang => !selectedLanguages.includes(lang));
  
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
  
  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = async () => {
    // Transform form data to match API expectations
    const applicationData = {
      fullName: formData.fullName,
      email: formData.email,
      bio: formData.bio || `${formData.fullName} is a ${formData.professionalRole} with expertise in ${formData.areasOfInterest.join(', ')}.`,
      expertise: formData.areasOfInterest,
      experience: formData.experience || formData.academicBackground,
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
        academicBackground: formData.academicBackground
      },
      preferences: {
        sessionDuration: formData.desiredDuration,
        ...formData.mentorPreferences
      },
      countries: [formData.country]
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
      <FormTitle variant="h4">Join our growing network of mentors</FormTitle>
      <StepIndicator currentStep={currentStep} />
      
      {currentStep === 1 && (
        <form>
          <FormField>
            <FieldLabel>Full Name</FieldLabel>
            <TextField 
              fullWidth
              placeholder="John Doe"
              variant="outlined"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>Email</FieldLabel>
            <TextField 
              fullWidth
              placeholder="email@example.com"
              variant="outlined"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>LinkedIn URL</FieldLabel>
            <TextField 
              fullWidth
              placeholder="LinkedIn profile"
              variant="outlined"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
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
            <FieldLabel>Country of Residence</FieldLabel>
            <FormControl fullWidth variant="outlined">
              <TextField
                select
                fullWidth
                placeholder="Select a country"
                variant="outlined"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="" disabled>Select a country</option>
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
                <option value="KE">Kenya</option>
                <option value="ZA">South Africa</option>
              </TextField>
            </FormControl>
          </FormField>
          
          <FormField>
            <FieldLabel>Languages Spoken</FieldLabel>
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
            <FormControl fullWidth variant="outlined">
              <Select
                displayEmpty
                value={newLanguage}
                onChange={handleLanguageChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: theme.palette.text.secondary }}>Select a language</span>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select a language</em>
                </MenuItem>
                {availableLanguages.map((language) => (
                  <MenuItem key={language} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormField>
          
          <ButtonContainer>
            <Box /> {/* Empty box for spacing */}
            <NextButton 
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
            >
              Next
            </NextButton>
          </ButtonContainer>
        </form>
      )}
      
      {currentStep === 2 && (
        <form>
          <FormField>
            <FieldLabel>Desired Professional Role</FieldLabel>
            <TextField 
              fullWidth
              placeholder="e.g., Product Manager, UX Designer"
              variant="outlined"
              name="professionalRole"
              value={formData.professionalRole}
              onChange={handleInputChange}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>Academic Background</FieldLabel>
            <TextField 
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your academic and professional background"
              variant="outlined"
              name="academicBackground"
              value={formData.academicBackground}
              onChange={handleInputChange}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>Areas of Interest</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
              {formData.areasOfInterest.map((area) => (
                <LanguageChip
                  key={area}
                  label={area}
                  onDelete={() => {
                    setFormData(prev => ({
                      ...prev,
                      areasOfInterest: prev.areasOfInterest.filter(a => a !== area)
                    }));
                  }}
                />
              ))}
            </div>
            <TextField 
              fullWidth
              placeholder="Type an area of interest and press Enter"
              variant="outlined"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={handleAddInterest}
            />
          </FormField>
          
          <FormField>
            <FieldLabel>International Experience</FieldLabel>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.hasInternationalExperience}
                  onChange={handleCheckboxChange}
                  name="hasInternationalExperience"
                  color="primary"
                />
              }
              label="Yes, I have international work experience"
            />
          </FormField>
          
          <ButtonContainer>
            <BackButton 
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
            >
              Previous
            </BackButton>
            <NextButton 
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
            >
              Next
            </NextButton>
          </ButtonContainer>
        </form>
      )}
      
      {currentStep === 3 && (
        <form>
          <FormField>
            <FieldLabel>Desired Duration</FieldLabel>
            <RadioOptionContainer>
              <RadioOption 
                selected={formData.desiredDuration === '1h'}
                onClick={() => handleDurationChange('1h')}
              >
                <Typography variant="body1" fontWeight={500}>1h over 1 month</Typography>
              </RadioOption>
              <RadioOption 
                selected={formData.desiredDuration === '2-3h'}
                onClick={() => handleDurationChange('2-3h')}
              >
                <Typography variant="body1" fontWeight={500}>2-3h over 2 months</Typography>
              </RadioOption>
              <RadioOption 
                selected={formData.desiredDuration === '4-5h'}
                onClick={() => handleDurationChange('4-5h')}
              >
                <Typography variant="body1" fontWeight={500}>4-5h over 4 months</Typography>
              </RadioOption>
              <RadioOption 
                selected={formData.desiredDuration === '6h+'}
                onClick={() => handleDurationChange('6h+')}
              >
                <Typography variant="body1" fontWeight={500}>6h over 6 months</Typography>
              </RadioOption>
            </RadioOptionContainer>
          </FormField>
          
          <FormField>
            <FieldLabel>Mentor Preferences</FieldLabel>
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
                label="Mentor with international experience"
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
                label="Funding agency experience"
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
                label="International organization background"
              />
            </Box>
          </FormField>
          
          <ButtonContainer>
            <BackButton 
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={submitting}
            >
              Back
            </BackButton>
            <SubmitButton 
              endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : undefined} 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
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