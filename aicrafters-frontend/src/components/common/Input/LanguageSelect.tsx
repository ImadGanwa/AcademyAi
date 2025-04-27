import React from 'react';
import { MenuItem, SelectChangeEvent } from '@mui/material';
import styled from 'styled-components';
import { Input } from './Input';
import { languages as languageCodes, isRTL } from '../../../utils/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { ReactComponent as USFlag } from '../../../assets/flags/us.svg';
import { ReactComponent as FRFlag } from '../../../assets/flags/fr.svg';
import { ReactComponent as MAFlag } from '../../../assets/flags/ma.svg';

// Create a wrapper component for SVG flags that accepts className
const FlagIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  svg {
    width: 100%;
    height: 100%;
    margin-right: 0 !important;
  }
`;

interface LanguageOption {
  code: string;
  name: string;
  flag: React.FC<React.SVGProps<SVGSVGElement>>;
}

const SelectWrapper = styled.div`
  display: inline-block;
`;

const StyledMenuItem = styled(MenuItem)<{ $isRtl?: boolean }>`
  && {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 40px;
    min-height: 40px;
    padding: 0;
    direction: ${props => props.$isRtl ? 'rtl' : 'ltr'};
    background: transparent;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
`;

const SquareInput = styled(Input)<{ $isRtl?: boolean }>`
  && {
    width: 40px !important;
    min-width: 40px !important;
    max-width: 40px !important;
    direction: ${props => props.$isRtl ? 'rtl' : 'ltr'};
    background: transparent;
    
    // Override the MUI FormControl width
    .MuiFormControl-root {
      width: 40px !important;
      min-width: 40px !important;
      max-width: 40px !important;
    }
    
    .MuiOutlinedInput-root {
      width: 40px !important;
      min-width: 40px !important;
      max-width: 40px !important;
      height: 40px;
      padding: 0;
      border-radius: 4px;
      background: transparent;

      &:hover {
        background: transparent;
        .MuiOutlinedInput-notchedOutline {
          border-color: rgba(255, 255, 255, 0.8);
        }
      }

      &.Mui-focused {
        background: transparent;
        .MuiOutlinedInput-notchedOutline {
          border-color: rgba(255, 255, 255, 1);
        }
      }

      .MuiOutlinedInput-input {
        padding: 0 !important;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        font-size: 20px;
        background: transparent;
        width: 40px !important;
        min-width: 40px !important;
        max-width: 40px !important;
      }

      .MuiOutlinedInput-notchedOutline {
        border: 1px solid rgba(255, 255, 255, 0.5);
      }
    }

    // Hide the dropdown arrow
    .MuiSelect-icon {
      display: none;
    }

    // Remove the label space
    .MuiInputLabel-root {
      display: none;
    }

    // Show the selected flag
    .MuiSelect-select {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 !important;
      width: 40px !important;
      min-width: 40px !important;
      max-width: 40px !important;
      background: transparent !important;
    }
  }
`;

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  'aria-label'?: string;
  className?: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ 
  value, 
  onChange, 
  'aria-label': ariaLabel,
  className 
}) => {
  const { t } = useTranslation();
  
  const languageOptions: LanguageOption[] = [
    { code: 'en', name: t('common.languages.en'), flag: USFlag },
    { code: 'fr', name: t('common.languages.fr'), flag: FRFlag },
    { code: 'ar', name: t('common.languages.ar'), flag: MAFlag },
  ].filter(lang => languageCodes.includes(lang.code as typeof languageCodes[number]));

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  const currentIsRTL = isRTL(value);

  return (
    <SelectWrapper className={className}>
      <SquareInput
        select
        value={value}
        onChange={handleChange as any}
        $isRtl={currentIsRTL}
        aria-label={ariaLabel}
        SelectProps={{
          displayEmpty: true,
          MenuProps: {
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          },
          renderValue: () => {
            const lang = languageOptions.find(l => l.code === value);
            return lang ? (
              <FlagIcon>
                <lang.flag />
              </FlagIcon>
            ) : null;
          }
        }}
      >
        {languageOptions.map((lang) => (
          <StyledMenuItem 
            key={lang.code} 
            value={lang.code}
            $isRtl={isRTL(lang.code)}
          >
            <FlagIcon>
              <lang.flag />
            </FlagIcon>
          </StyledMenuItem>
        ))}
      </SquareInput>
    </SelectWrapper>
  );
}; 