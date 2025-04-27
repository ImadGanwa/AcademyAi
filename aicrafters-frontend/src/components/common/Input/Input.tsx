import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import styled from 'styled-components';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  error?: boolean;
  helperText?: string;
  startAdornment?: React.ReactNode;
  icon?: React.ReactNode;
  startIcon?: React.ReactNode;
  showPasswordStrength?: boolean;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTextField = styled(TextField)`
  && {
    max-width: inherit;
    
    .MuiOutlinedInput-root {
      max-width: inherit;
      background-color: ${props => props.theme.palette.background.paper};
      color: ${props => props.theme.palette.common.black};
      
      svg {
        margin-right: 10px;
      }
      
      &:hover .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
      }
      
      &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.primary.main};
      }
      
      &.Mui-error .MuiOutlinedInput-notchedOutline {
        border-color: ${props => props.theme.palette.error.main};
      }
    }

    .MuiFormHelperText-root {
      min-height: 0;
      margin: 0;
      
      &.Mui-error {
        color: ${props => props.theme.palette.error.main};
      }
    }

    .MuiInputAdornment-root {
      color: ${props => props.theme.palette.text.secondary};
      margin-right: 12px;
      
      .MuiSvgIcon-root {
        font-size: 20px;
      }
    }

    .MuiInputLabel-root {
      color: ${props => props.theme.palette.text.secondary};
      
      &.Mui-focused {
        color: ${props => props.theme.palette.primary.main};
      }
    }

    .MuiOutlinedInput-input {
      max-width: inherit;
      color: ${props => props.theme.palette.common.black};
      
      &::placeholder {
        color: ${props => props.theme.palette.text.secondary};
        opacity: 0.7;
      }
    }
  }
`;

interface StyledPasswordStrengthIndicatorProps {
  $hasHelperText?: boolean;
}

const StyledPasswordStrengthIndicator = styled(PasswordStrengthIndicator)<StyledPasswordStrengthIndicatorProps>`
  width: 100%;
  margin-top: 4px;
  margin-bottom: ${props => props.$hasHelperText ? '0' : '4px'};
`;

export const Input: React.FC<InputProps> = ({
  error,
  helperText,
  startAdornment,
  icon,
  startIcon,
  showPasswordStrength,
  type,
  value,
  ...props
}) => {
  const showStrengthIndicator = showPasswordStrength && type === 'password';
  
  return (
    <InputWrapper>
      <StyledTextField
        variant="outlined"
        error={error}
        type={type}
        value={value}
        InputProps={{
          startAdornment: startAdornment || startIcon || (icon && (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ))
        }}
        helperText={helperText}
        {...props}
      />
      {showStrengthIndicator && (
        <StyledPasswordStrengthIndicator 
          password={value as string} 
          hideText
          $hasHelperText={!!helperText}
        />
      )}
    </InputWrapper>
  );
}; 