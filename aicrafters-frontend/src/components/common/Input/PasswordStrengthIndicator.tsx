import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  hideText?: boolean;
  $hasHelperText?: boolean;
}

const StrengthBar = styled(Box)`
  display: flex;
  gap: 4px;
  margin-top: 4px;
  width: 100%;
`;

const StrengthSegment = styled.div<{ active: boolean; strength: number; index: number }>`
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background-color: ${({ active, strength, index }) => {
    if (!active) return '#E5E7EB';
    
    // When active, show color based on current segment and overall strength
    if (index === 0) return '#EF4444'; // Red for first segment
    if (index === 1) return '#F97316'; // Orange for second segment
    if (index === 2) return '#EAB308'; // Yellow for third segment
    if (index === 3) return '#22C55E'; // Green for fourth segment
    
    return '#E5E7EB'; // Default gray
  }};
  transition: background-color 0.3s ease;
`;

const getPasswordStrength = (password: string = ''): number => {
  if (!password) return 0;
  let strength = 0;
  
  // Length check (8-40 characters)
  if (password.length >= 8 && password.length <= 40) strength += 1;
  
  // Contains number
  if (/\d/.test(password)) strength += 1;
  
  // Contains lowercase and uppercase
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  
  // eslint-disable-next-line no-useless-escape
  if (/[-!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 1;
  
  return strength;
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className,
  hideText = false,
  $hasHelperText = false
}) => {
  const strength = getPasswordStrength(password);
  const { t } = useTranslation();

  return (
    <Box className={className}>
      {!hideText && (
        <Typography variant="caption" color="textSecondary">
          {t('auth.signup.passwordStrength')}
        </Typography>
      )}
      <StrengthBar>
        {[0, 1, 2, 3].map((index) => (
          <StrengthSegment
            key={index}
            active={index < strength}
            strength={strength}
            index={index}
          />
        ))}
      </StrengthBar>
    </Box>
  );
}; 