import React, { useEffect, useState } from 'react';
import { Box, FormControl, TextField, Autocomplete } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { Mentor } from '../card/MentorCard';
import { getCountryName, getCountryCode } from '../../../../utils/countryUtils';

// Define unique filter options
interface FilterOption {
  value: string;
  label: string;
}

interface DynamicFiltersProps {
  mentors: Mentor[];
  onCategoryChange: (value: string) => void;
  onSkillChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  category: string;
  skill: string;
  country: string;
  language: string;
}

const FiltersRow = styled(Box)`
  display: flex;
  gap: 20px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 10px;
  
  @media (max-width: 1024px) {
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 0;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const FilterContainer = styled(Box)`
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    min-width: 100%;
  }
`;

const StyledAutocomplete = styled(Autocomplete<FilterOption, false, false, false>)`
  && {
    .MuiOutlinedInput-root {
      background: #ffffff;
      border-radius: 16px;
      height: 56px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      padding-right: 48px !important;

      .MuiAutocomplete-input {
        padding: 16px 20px !important;
        font-size: 1rem;
        color: #2c3e50;
        font-weight: 500;
      }

      .MuiOutlinedInput-notchedOutline {
        border: 2px solid #e8ecef;
        transition: border-color 0.3s ease;
      }

      .MuiAutocomplete-endAdornment {
        right: 16px;
        
        .MuiAutocomplete-popupIndicator {
          color: #6c757d;
          transition: all 0.3s ease;
          
          .MuiSvgIcon-root {
            font-size: 24px;
          }
        }
      }

      &:hover {
        .MuiOutlinedInput-notchedOutline {
          border-color: ${props => props.theme.palette.primary.main};
        }
        
        .MuiAutocomplete-popupIndicator {
          color: ${props => props.theme.palette.primary.main};
          transform: rotate(180deg);
        }
      }

      &.Mui-focused {
        border-color: ${props => props.theme.palette.primary.main};
        
        .MuiOutlinedInput-notchedOutline {
          border-color: ${props => props.theme.palette.primary.main};
          border-width: 2px;
        }
        
        .MuiAutocomplete-popupIndicator {
          color: ${props => props.theme.palette.primary.main};
          transform: rotate(180deg);
        }
      }
      
      @media (max-width: 768px) {
        height: 52px;
        border-radius: 12px;
        padding-right: 44px !important;
        
        .MuiAutocomplete-input {
          padding: 14px 18px !important;
          font-size: 0.95rem;
        }
        
        .MuiAutocomplete-endAdornment {
          right: 14px;
          
          .MuiSvgIcon-root {
            font-size: 22px;
          }
        }
      }
      
      @media (max-width: 480px) {
        height: 48px;
        padding-right: 40px !important;
        
        .MuiAutocomplete-input {
          padding: 12px 16px !important;
          font-size: 0.9rem;
        }
        
        .MuiAutocomplete-endAdornment {
          right: 12px;
          
          .MuiSvgIcon-root {
            font-size: 20px;
          }
        }
      }
    }

    .MuiInputLabel-root {
      color: #6c757d;
      font-size: 1rem;
      font-weight: 500;
      transform: translate(20px, 18px) scale(1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.Mui-focused {
        color: ${props => props.theme.palette.primary.main};
        transform: translate(20px, -9px) scale(0.85);
      }

      &.MuiInputLabel-shrink {
        transform: translate(20px, -9px) scale(0.85);
        background: #ffffff;
        padding: 0 8px;
        border-radius: 4px;
      }
      
      @media (max-width: 768px) {
        font-size: 0.95rem;
        transform: translate(18px, 16px) scale(1);
        
        &.Mui-focused, &.MuiInputLabel-shrink {
          transform: translate(18px, -9px) scale(0.85);
        }
      }
      
      @media (max-width: 480px) {
        font-size: 0.9rem;
        transform: translate(16px, 14px) scale(1);
        
        &.Mui-focused, &.MuiInputLabel-shrink {
          transform: translate(16px, -9px) scale(0.85);
        }
      }
    }
  }

  .MuiPaper-root {
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid #e8ecef;
    margin-top: 8px;
    
    @media (max-width: 768px) {
      border-radius: 12px;
      margin-top: 6px;
    }
  }
  
  .MuiAutocomplete-listbox {
    padding: 8px;
    
    @media (max-width: 768px) {
      padding: 6px;
    }
    
    .MuiAutocomplete-option {
      padding: 12px 20px;
      font-size: 0.95rem;
      color: ${props => props.theme.palette.primary.main};
      transition: all 0.2s ease;
      border-radius: 8px;
      margin: 2px 8px;
      
      &:hover {
        background: ${props => props.theme.palette.primary.main}15;
        color: ${props => props.theme.palette.primary.main};
        transform: translateX(4px);
      }
      
      &[aria-selected="true"] {
        background: ${props => props.theme.palette.primary.main};
        color: white;
        font-weight: 600;
        
        &:hover {
          background: ${props => props.theme.palette.primary.dark};
          transform: translateX(4px);
        }
      }
      
      @media (max-width: 768px) {
        padding: 10px 18px;
        font-size: 0.9rem;
        margin: 1px 6px;
      }
      
      @media (max-width: 480px) {
        padding: 8px 16px;
        font-size: 0.85rem;
        margin: 1px 4px;
      }
    }
  }
`;

export const DynamicFilters: React.FC<DynamicFiltersProps> = ({
  mentors,
  onCategoryChange,
  onSkillChange,
  onCountryChange,
  onLanguageChange,
  category,
  skill,
  country,
  language
}) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [skills, setSkills] = useState<FilterOption[]>([]);
  const [countries, setCountries] = useState<FilterOption[]>([]);
  const [languages, setLanguages] = useState<FilterOption[]>([]);

  // Extract unique filter options from mentors data
  useEffect(() => {
    if (mentors && mentors.length > 0) {
      // Extract and deduplicate categories 
      // Note: Using titles for categories as a proxy for now
      const uniqueCategories = new Set<string>();
      mentors.forEach(mentor => {
        if (mentor.title) {
          // For category value, use a simplified version of the title
          const categoryValue = mentor.title.toLowerCase().replace(/\s+/g, '');
          uniqueCategories.add(categoryValue);
        }
      });
      
      const categoryOptions = Array.from(uniqueCategories).map(catValue => {
        // Find a mentor with this category to get the original title
        const mentor = mentors.find(m => m.title.toLowerCase().replace(/\s+/g, '') === catValue);
        return {
          value: catValue,
          label: mentor?.title || catValue
        };
      });
      
      setCategories(categoryOptions);
      
      // Extract and deduplicate skills
      const uniqueSkills = new Set<string>();
      mentors.forEach(mentor => {
        mentor.skills.forEach(skill => {
          const skillValue = skill.name.toLowerCase().replace(/\s+/g, '');
          uniqueSkills.add(skillValue);
        });
      });
      
      const skillOptions = Array.from(uniqueSkills).map(skillValue => {
        // Find a mentor with this skill to get the original skill name
        const mentor = mentors.find(m => 
          m.skills.some(s => s.name.toLowerCase().replace(/\s+/g, '') === skillValue)
        );
        const skill = mentor?.skills.find(s => s.name.toLowerCase().replace(/\s+/g, '') === skillValue);
        
        return {
          value: skillValue,
          label: skill?.name || skillValue
        };
      });
      
      setSkills(skillOptions);
      
      // Extract and deduplicate countries
      const uniqueCountries = new Set<string>();
      mentors.forEach(mentor => {
        if (mentor.country) {
          // Store the country code as value for consistent filtering
          let countryCode = mentor.country;
          // If it's already a full name, convert to code
          if (mentor.country.length > 3) {
            countryCode = getCountryCode(mentor.country);
          }
          uniqueCountries.add(countryCode);
        } else if (mentor.countryFlag) {
          // Fallback to extracting from countryFlag URL for backward compatibility
          const countryCode = mentor.countryFlag.split('/').pop()?.split('.')[0];
          if (countryCode) {
            uniqueCountries.add(countryCode.toUpperCase());
          }
        }
      });
      
      const countryOptions = Array.from(uniqueCountries).map(countryCode => {
        const countryName = getCountryName(countryCode);
        return {
          value: countryCode, // Use country code as value for consistent filtering
          label: countryName  // Display full country name to user
        };
      });
      
      setCountries(countryOptions);
      
      // Extract and deduplicate languages
      const uniqueLanguages = new Set<string>();
      mentors.forEach(mentor => {
        mentor.languages.forEach(lang => {
          const langValue = lang.name.toLowerCase().replace(/\s+/g, '');
          uniqueLanguages.add(langValue);
        });
      });
      
      const languageOptions = Array.from(uniqueLanguages).map(langValue => {
        // Find a mentor with this language to get the original language name
        const mentor = mentors.find(m => 
          m.languages.some(l => l.name.toLowerCase().replace(/\s+/g, '') === langValue)
        );
        const language = mentor?.languages.find(l => l.name.toLowerCase().replace(/\s+/g, '') === langValue);
        
        return {
          value: langValue,
          label: language?.name || langValue
        };
      });
      
      setLanguages(languageOptions);
    }
  }, [mentors]);

  const handleCategoryChange = (event: React.SyntheticEvent, value: FilterOption | null) => {
    const selectedValue = value?.value || '';
    console.log('DynamicFilters - Category selected:', selectedValue);
    onCategoryChange(selectedValue);
  };
  
  const handleSkillChange = (event: React.SyntheticEvent, value: FilterOption | null) => {
    const selectedValue = value?.value || '';
    console.log('DynamicFilters - Skill selected:', selectedValue);
    onSkillChange(selectedValue);
  };
  
  const handleCountryChange = (event: React.SyntheticEvent, value: FilterOption | null) => {
    const selectedValue = value?.value || '';
    console.log('DynamicFilters - Country selected:', selectedValue);
    onCountryChange(selectedValue);
  };
  
  const handleLanguageChange = (event: React.SyntheticEvent, value: FilterOption | null) => {
    const selectedValue = value?.value || '';
    console.log('DynamicFilters - Language selected:', selectedValue);
    onLanguageChange(selectedValue);
  };

  // Helper function to find current value object
  const findOptionByValue = (options: FilterOption[], value: string): FilterOption | null => {
    return options.find(option => option.value === value) || null;
  };

  return (
    <FiltersRow>
      <FilterContainer>
        <StyledAutocomplete
          options={categories}
          value={findOptionByValue(categories, category)}
          onChange={handleCategoryChange}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          popupIcon={<ArrowDownIcon />}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('mentor.professionalRoleLabel', { defaultValue: 'Professional Role' }) as string}
              placeholder={t('mentor.professionalRoleLabel', { defaultValue: 'Professional Role' }) as string}
              variant="outlined"
              fullWidth
            />
          )}
        />
      </FilterContainer>
      
      <FilterContainer>
        <StyledAutocomplete
          options={skills}
          value={findOptionByValue(skills, skill)}
          onChange={handleSkillChange}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          popupIcon={<ArrowDownIcon />}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('mentor.skillLabel', { defaultValue: 'Skill' }) as string}
              placeholder={t('mentor.skillLabel', { defaultValue: 'Skill' }) as string}
              variant="outlined"
              fullWidth
            />
          )}
        />
      </FilterContainer>
      
      <FilterContainer>
        <StyledAutocomplete
          options={countries}
          value={findOptionByValue(countries, country)}
          onChange={handleCountryChange}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          popupIcon={<ArrowDownIcon />}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('mentor.countryLabel', { defaultValue: 'Country' }) as string}
              placeholder={t('mentor.countryLabel', { defaultValue: 'Country' }) as string}
              variant="outlined"
              fullWidth
            />
          )}
        />
      </FilterContainer>
      
      <FilterContainer>
        <StyledAutocomplete
          options={languages}
          value={findOptionByValue(languages, language)}
          onChange={handleLanguageChange}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          popupIcon={<ArrowDownIcon />}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('mentor.languageLabel', { defaultValue: 'Language' }) as string}
              placeholder={t('mentor.languageLabel', { defaultValue: 'Language' }) as string}
              variant="outlined"
              fullWidth
            />
          )}
        />
      </FilterContainer>
    </FiltersRow>
  );
}; 