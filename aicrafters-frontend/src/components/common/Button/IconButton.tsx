import React from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import type { ButtonProps } from './Button';

// Split the props into link and regular types like in Button
type IconButtonBaseProps = Omit<ButtonProps, 'children'> & {
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  children?: React.ReactNode;
  loading?: boolean;
};

type IconButtonLinkProps = IconButtonBaseProps & {
  to: string;
  type?: never;
};

type IconButtonRegularProps = IconButtonBaseProps & {
  to?: never;
};

export type IconButtonProps = IconButtonLinkProps | IconButtonRegularProps;

interface StyledIconButtonProps {
  $iconPosition?: 'start' | 'end';
}

const StyledIconButton = styled(Button)<StyledIconButtonProps>`
  && {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-direction: ${props => props.$iconPosition === 'end' ? 'row-reverse' : 'row'};
    min-width: 120px; // Ensure enough space for loading spinner

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  icon,
  iconPosition = 'start',
  loading,
  disabled,
  ...props
}) => {
  const buttonProps = {
    ...props,
    $iconPosition: iconPosition,
    loading,
    disabled: disabled || loading,
  };

  return (
    <StyledIconButton {...buttonProps}>
      {icon}
      {children}
    </StyledIconButton>
  );
}; 