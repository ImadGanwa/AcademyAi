import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { Mentor } from '../card/MentorCard';

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
  gap: 16px;
  width: 100%;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterSelect = styled(FormControl)`
  flex: 1;
  max-width: 280px;
  
  .MuiOutlinedInput-root {
    background-color: #fff;
    border-radius: 50px;
    height: 48px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .MuiSelect-select {
      padding: 12px 20px;
      padding-right: 40px !important;
      font-size: 1rem;
      color: #424242;
    }

    .MuiOutlinedInput-notchedOutline {
      border: 1px solid #E0E0E0;
    }

    .MuiSelect-icon {
      right: 12px;
      color: #757575;
    }

    &:hover, &.Mui-focused {
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
      }
    }
  }

  .MuiInputLabel-root {
    color: #757575;
    font-size: 1rem;
    
    &.Mui-focused {
      color: ${props => props.theme.palette.primary.main};
    }

    &.MuiInputLabel-shrink {
      display: none;
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
        if (mentor.countryFlag) {
          // Extract country code from URL like "https://flagcdn.com/w20/us.png"
          const countryCode = mentor.countryFlag.split('/').pop()?.split('.')[0];
          if (countryCode) {
            uniqueCountries.add(countryCode);
          }
        }
      });
      
      const countryOptions = Array.from(uniqueCountries).map(code => ({
        value: code,
        label: getCountryName(code)
      }));
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

  // Helper function to get country name from code
  const getCountryName = (code: string): string => {
    // This is a simplified implementation
    // In a real app, you'd use a library like i18n-iso-countries or a lookup table
    const countryMap: Record<string, string> = {
      'us': 'United States',
      'uk': 'United Kingdom',
      'ca': 'Canada',
      'au': 'Australia',
      'in': 'India',
      'fr': 'France',
      'de': 'Germany',
      'jp': 'Japan',
      'es': 'Spain',
      'sn': 'Senegal'
      // Add more as needed
    };
    
    return countryMap[code] || code.toUpperCase();
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    console.log('DynamicFilters - Category selected:', value);
    onCategoryChange(value);
  };
  
  const handleSkillChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    console.log('DynamicFilters - Skill selected:', value);
    onSkillChange(value);
  };
  
  const handleCountryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    console.log('DynamicFilters - Country selected:', value);
    onCountryChange(value);
  };
  
  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as string;
    console.log('DynamicFilters - Language selected:', value);
    onLanguageChange(value);
  };

  return (
    <FiltersRow>
      <FilterSelect variant="outlined" fullWidth>
        <InputLabel>{t('mentor.categoryLabel', { defaultValue: 'Category' }) as string}</InputLabel>
        <Select
          value={category}
          onChange={handleCategoryChange}
          label={t('mentor.categoryLabel', { defaultValue: 'Category' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <MenuItem value="">{t('mentor.allCategories', { defaultValue: 'All Categories' }) as string}</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {t(`mentor.categories.${cat.value}`, { defaultValue: cat.label }) as string}
            </MenuItem>
          ))}
        </Select>
      </FilterSelect>
      
      <FilterSelect variant="outlined" fullWidth>
        <InputLabel>{t('mentor.skillLabel', { defaultValue: 'Skill' }) as string}</InputLabel>
        <Select
          value={skill}
          onChange={handleSkillChange}
          label={t('mentor.skillLabel', { defaultValue: 'Skill' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <MenuItem value="">{t('mentor.allSkills', { defaultValue: 'All Skills' }) as string}</MenuItem>
          {skills.map((sk) => (
            <MenuItem key={sk.value} value={sk.value}>
              {t(`mentor.skills.${sk.value}`, { defaultValue: sk.label }) as string}
            </MenuItem>
          ))}
        </Select>
      </FilterSelect>
      
      <FilterSelect variant="outlined" fullWidth>
        <InputLabel>{t('mentor.countryLabel', { defaultValue: 'Country' }) as string}</InputLabel>
        <Select
          value={country}
          onChange={handleCountryChange}
          label={t('mentor.countryLabel', { defaultValue: 'Country' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <MenuItem value="">{t('mentor.allCountries', { defaultValue: 'All Countries' }) as string}</MenuItem>
          {countries.map((country) => (
            <MenuItem key={country.value} value={country.value}>
              {t(`mentor.countries.${country.value}`, { defaultValue: country.label }) as string}
            </MenuItem>
          ))}
        </Select>
      </FilterSelect>
      
      <FilterSelect variant="outlined" fullWidth>
        <InputLabel>{t('mentor.languageLabel', { defaultValue: 'Language' }) as string}</InputLabel>
        <Select
          value={language}
          onChange={handleLanguageChange}
          label={t('mentor.languageLabel', { defaultValue: 'Language' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <MenuItem value="">{t('mentor.allLanguages', { defaultValue: 'All Languages' }) as string}</MenuItem>
          {languages.map((lang) => (
            <MenuItem key={lang.value} value={lang.value}>
              {t(`mentor.languages.${lang.value}`, { defaultValue: lang.label }) as string}
            </MenuItem>
          ))}
        </Select>
      </FilterSelect>
    </FiltersRow>
  );
}; 