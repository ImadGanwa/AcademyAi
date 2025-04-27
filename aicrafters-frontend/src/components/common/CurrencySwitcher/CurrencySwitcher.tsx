import React from 'react';
import styled from 'styled-components';
import { Input } from '../Input/Input';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { MenuItem } from '@mui/material';

const SelectWrapper = styled.div`
  position: relative;
  min-width: 60px;
`;

const StyledSelect = styled(Input)`
  && {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-weight: bold;
    
    &:hover {
      border-color: white;
    }
    
    &:focus {
      background: transparent;
      border-color: white;
    }

    .MuiSelect-select {
      padding: 0 8px !important;
      text-align: center;
      line-height: 40px;
      height: 40px;
    }

    .MuiSelect-icon {
      display: none;
    }
  }
`;

const StyledMenuItem = styled(MenuItem)`
  && {
    padding: 8px 16px;
    font-size: 0.875rem;
    min-height: unset;
    justify-content: center;
    
    &:hover {
      background-color: ${props => props.theme.palette.action.hover};
    }
  }
`;

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCurrency(event.target.value as 'MAD' | 'EUR');
    // Save to localStorage
    localStorage.setItem('selected_currency', event.target.value as string);
  };

  // Load saved currency on component mount
  React.useEffect(() => {
    const savedCurrency = localStorage.getItem('selected_currency');
    if (savedCurrency && (savedCurrency === 'MAD' || savedCurrency === 'EUR')) {
      setCurrency(savedCurrency);
    }
  }, [setCurrency]);

  return (
    <SelectWrapper>
      <StyledSelect
        select
        value={currency}
        onChange={handleChange}
        fullWidth
      >
        <StyledMenuItem value="MAD">
          MAD
        </StyledMenuItem>
        <StyledMenuItem value="EUR">
          EUR
        </StyledMenuItem>
      </StyledSelect>
    </SelectWrapper>
  );
}; 