import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

// Add type for theme colors
type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'success';

// Define the component props
type ButtonBaseProps = {
  children: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  sx?: any;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  fontWeight?: number | string;
  color?: ThemeColor;
  type?: 'button' | 'submit' | 'reset';
};

// Props for when the button is used as a link
type ButtonLinkProps = ButtonBaseProps & {
  to: string;
  type?: never; // type is not needed for links
};

// Props for when the button is used as a regular button
type ButtonRegularProps = ButtonBaseProps & {
  to?: never;
};

// Combined props type
export type ButtonProps = ButtonLinkProps | ButtonRegularProps;

interface StyledButtonProps {
  $fontWeight?: number | string;
  $fullWidth?: boolean;
}

const LoadingWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const ButtonContent = styled.span<{ $loading?: boolean }>`
  visibility: ${props => props.$loading ? 'hidden' : 'visible'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StyledMuiButton = styled(MuiButton)<StyledButtonProps>`
  position: relative;
  text-transform: none;
  border-radius: 24px;
  font-weight: ${props => props.$fontWeight || 800} !important;
  font-family: ${props => props.theme.typography.fontFamily};
  padding: ${props => 
    props.size === 'large' ? '12px 32px' : 
    props.size === 'small' ? '6px 16px' : 
    '10px 24px'
  };

  &.MuiButton-contained {
    font-weight: ${props => props.$fontWeight || 800} !important;
    background-color: ${props => props.theme.palette.secondary.main};
    color: white;
    letter-spacing: 0.02em;
    
    &:hover {
      background-color: ${props => props.theme.palette.secondary.dark};
    }
  }

  transition: all 0.2s ease-in-out;

  &.MuiButton-contained {
    box-shadow: 0px 4px 12px rgba(123, 97, 255, 0.2);
    
    &:hover {
      box-shadow: 0px 6px 16px rgba(123, 97, 255, 0.3);
    }
  }

  &.MuiButton-outlined {
    color: ${props => props.color ? props.theme.palette[props.color as ThemeColor].main : props.theme.palette.secondary.main};
    border-color: ${props => props.color ? props.theme.palette[props.color as ThemeColor].main : props.theme.palette.secondary.main};
    
    &:hover {
      border-color: ${props => props.color ? props.theme.palette[props.color as ThemeColor].dark : props.theme.palette.secondary.dark};
      color: ${props => props.color ? props.theme.palette[props.color as ThemeColor].dark : props.theme.palette.secondary.dark};
      background-color: rgba(123, 97, 255, 0.04);
    }
  }
`;

const StyledRouterLink = styled(RouterLink)<{ $fullWidth?: boolean }>`
  text-decoration: none;
  display: inline-block;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
`;

export const Button: React.FC<ButtonProps> = ({ 
  to, 
  fontWeight, 
  fullWidth, 
  loading,
  children,
  disabled,
  ...props 
}) => {
  const buttonContent = (
    <>
      <ButtonContent $loading={loading}>
        {children}
      </ButtonContent>
      {loading && (
        <LoadingWrapper>
          <CircularProgress size={24} color="inherit" />
        </LoadingWrapper>
      )}
    </>
  );

  if (to) {
    return (
      <StyledRouterLink to={to} $fullWidth={fullWidth}>
        <StyledMuiButton
          {...props}
          $fontWeight={fontWeight}
          $fullWidth={fullWidth}
          disabled={disabled || loading}
        >
          {buttonContent}
        </StyledMuiButton>
      </StyledRouterLink>
    );
  }

  return (
    <StyledMuiButton 
      {...props} 
      $fontWeight={fontWeight}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
    >
      {buttonContent}
    </StyledMuiButton>
  );
};

Button.displayName = 'Button'; 