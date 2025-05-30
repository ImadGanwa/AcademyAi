import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { Mentor } from '../card/MentorCard';
import { getCountryName } from '../../../../utils/countryUtils';

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

const FilterSelect = styled(FormControl)`
  flex: 1;
  min-width: 200px;
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    min-width: 100%;
  }
  
  .MuiOutlinedInput-root {
    background: #ffffff;
    border-radius: 16px;
    height: 56px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;

    .MuiSelect-select {
      padding: 16px 20px;
      padding-right: 48px !important;
      font-size: 1rem;
      color: #2c3e50;
      font-weight: 500;
      display: flex;
      align-items: center;
    }

    .MuiOutlinedInput-notchedOutline {
      border: 2px solid #e8ecef;
      transition: border-color 0.3s ease;
    }

    .MuiSelect-icon {
      right: 16px;
      color: #6c757d;
      font-size: 24px;
      transition: all 0.3s ease;
    }

    &:hover {
      .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
      }
      
      .MuiSelect-icon {
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
      
      .MuiSelect-icon {
        color: ${props => props.theme.palette.primary.main};
        transform: rotate(180deg);
      }
    }
    
    @media (max-width: 768px) {
      height: 52px;
      border-radius: 12px;
      
      .MuiSelect-select {
        padding: 14px 18px;
        padding-right: 44px !important;
        font-size: 0.95rem;
      }
      
      .MuiSelect-icon {
        right: 14px;
        font-size: 22px;
      }
    }
    
    @media (max-width: 480px) {
      height: 48px;
      
      .MuiSelect-select {
        padding: 12px 16px;
        padding-right: 40px !important;
        font-size: 0.9rem;
      }
      
      .MuiSelect-icon {
        right: 12px;
        font-size: 20px;
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

  .MuiSelect-select:focus {
    background: transparent;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  && {
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
    
    &.Mui-selected {
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
`;

const StyledSelect = styled(Select<string>)`
  && {
    .MuiSelect-select {
      &:focus {
        background: transparent;
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
  
  .MuiList-root {
    padding: 8px;
    
    @media (max-width: 768px) {
      padding: 6px;
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
          // Convert country code to full name for display
          const countryName = getCountryName(mentor.country);
          uniqueCountries.add(countryName);
        } else if (mentor.countryFlag) {
          // Fallback to extracting from countryFlag URL for backward compatibility
          const countryCode = mentor.countryFlag.split('/').pop()?.split('.')[0];
          if (countryCode) {
            const countryName = getCountryName(countryCode);
            uniqueCountries.add(countryName);
          }
        }
      });
      
      const countryOptions = Array.from(uniqueCountries).map(country => ({
        value: country,
        label: country
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
        <InputLabel>{t('mentor.professionalRoleLabel', { defaultValue: 'Professional Role' }) as string}</InputLabel>
        <StyledSelect
          value={category}
          onChange={handleCategoryChange}
          label={t('mentor.professionalRoleLabel', { defaultValue: 'Professional Role' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <StyledMenuItem value="">{t('mentor.allProfessionalRoles', { defaultValue: 'All Professional Roles' }) as string}</StyledMenuItem>
          {categories.map((cat) => (
            <StyledMenuItem key={cat.value} value={cat.value}>
              {t(`mentor.categories.${cat.value}`, { defaultValue: cat.label }) as string}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </FilterSelect>
      
      <FilterSelect variant="outlined" fullWidth>
        <InputLabel>{t('mentor.skillLabel', { defaultValue: 'Skill' }) as string}</InputLabel>
        <StyledSelect
          value={skill}
          onChange={handleSkillChange}
          label={t('mentor.skillLabel', { defaultValue: 'Skill' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <StyledMenuItem value="">{t('mentor.allSkills', { defaultValue: 'All Skills' }) as string}</StyledMenuItem>
          {skills.map((sk) => (
            <StyledMenuItem key={sk.value} value={sk.value}>
              {t(`mentor.skills.${sk.value}`, { defaultValue: sk.label }) as string}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </FilterSelect>
      
      <FilterSelect variant="outlined" fullWidth>
        <InputLabel>{t('mentor.countryLabel', { defaultValue: 'Country' }) as string}</InputLabel>
        <StyledSelect
          value={country}
          onChange={handleCountryChange}
          label={t('mentor.countryLabel', { defaultValue: 'Country' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <StyledMenuItem value="">{t('mentor.allCountries', { defaultValue: 'All Countries' }) as string}</StyledMenuItem>
          {countries.map((countryItem) => (
            <StyledMenuItem key={countryItem.value} value={countryItem.value}>
              {t(`mentor.countries.${countryItem.value}`, { defaultValue: countryItem.label }) as string}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </FilterSelect>
      
      <FilterSelect variant="outlined" fullWidth>
        <InputLabel>{t('mentor.languageLabel', { defaultValue: 'Language' }) as string}</InputLabel>
        <StyledSelect
          value={language}
          onChange={handleLanguageChange}
          label={t('mentor.languageLabel', { defaultValue: 'Language' }) as string}
          IconComponent={ArrowDownIcon}
        >
          <StyledMenuItem value="">{t('mentor.allLanguages', { defaultValue: 'All Languages' }) as string}</StyledMenuItem>
          {languages.map((lang) => (
            <StyledMenuItem key={lang.value} value={lang.value}>
              {t(`mentor.languages.${lang.value}`, { defaultValue: lang.label }) as string}
            </StyledMenuItem>
          ))}
        </StyledSelect>
      </FilterSelect>
    </FiltersRow>
  );
}; 