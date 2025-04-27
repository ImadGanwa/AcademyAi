import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';

interface NavButtonProps extends ButtonProps {
  to: string;
  onNavigate?: () => void;
}

export const NavButton: React.FC<NavButtonProps> = ({ to, onNavigate, children, ...props }) => {
  const navigate = useLocalizedNavigate();

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    navigate(to);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}; 