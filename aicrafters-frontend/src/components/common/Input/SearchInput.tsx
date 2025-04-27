import React from 'react';
import styled from 'styled-components';
import { ReactComponent as SearchIcon } from '../../../assets/icons/Search.svg';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
}

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 8px 36px 8px 12px;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.palette.primary.main};
  }

  &::placeholder {
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  svg {
    width: 16px;
    height: 16px;
    
    path {
      stroke: ${props => props.theme.palette.text.title};
    }
  }
`;

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  onChange,
  onSearch
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <InputWrapper>
      <StyledInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      <IconWrapper>
        <SearchIcon />
      </IconWrapper>
    </InputWrapper>
  );
}; 