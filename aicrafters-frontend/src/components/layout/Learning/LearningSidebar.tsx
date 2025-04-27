import React, { useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as ThinDownArrow } from '../../../assets/icons/ThinDownArrow.svg';
import { useTranslation } from 'react-i18next';

interface NavItemData {
  label: string;
  count: number;
  value: string;
}

const Sidebar = styled.aside`
  width: 240px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 24px;
  }
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  background: #FAFBFC;
  padding: 14px;
  border-radius: 10px;
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileSelect = styled.div`
  display: none;
  position: relative;

  @media (max-width: 768px) {
    display: block;
  }
`;

const SelectButton = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  color: ${props => props.theme.palette.text.title};

  span {
    font-weight: bold;
    span{
        margin-left: 8px;
        background: ${props => props.theme.palette.text.title};
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.875rem;
        min-width: 40px;
        text-align: center;
    }
  }

  svg {
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.2s ease;
    path {
      stroke: ${props => props.theme.palette.text.title};
    }
  }
`;

const OptionsList = styled.ul<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: 8px;
  padding: 8px 0;
  margin: 0;
  list-style: none;
  z-index: 10;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
`;

const Option = styled.li`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${props => props.theme.palette.action.hover};
  }
`;

const Count = styled.span`
  background: ${props => props.theme.palette.action.hover};
  color: ${props => props.theme.palette.text.title};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  min-width: 40px;
  text-align: center;
`;

const NavItem = styled.li`
  list-style: none;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const NavLink = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-left: ${props => props.$active ? `2px solid ${props.theme.palette.text.title}` : 'none'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  cursor: pointer;
  color: ${props => props.theme.palette.text.title};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-left: 2px solid ${props => props.theme.palette.text.title};
    font-weight: bold;

    span {
      background: ${props => props.theme.palette.text.title};
      color: white;
    }
  }

  span {
    background: ${props => props.$active ? props.theme.palette.text.title : '#D6D9DD'};
    color: ${props => props.$active ? 'white' : props.theme.palette.text.title};
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    min-width: 40px;
    text-align: center;
  }
`;

interface LearningSidebarProps {
  onFilterChange?: (filter: string) => void;
  courseCounts: {
    inProgress: number;
    saved: number;
    completed: number;
  };
}

export const LearningSidebar: React.FC<LearningSidebarProps> = ({ onFilterChange, courseCounts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('inProgress');
  const { t } = useTranslation();

  const options: NavItemData[] = [
    { label: t('user.learning.inProgress'), count: courseCounts.inProgress, value: 'inProgress' },
    { label: t('user.learning.saved'), count: courseCounts.saved, value: 'saved' },
    { label: t('user.learning.completed'), count: courseCounts.completed, value: 'completed' },
  ];

  const selectedItem = options.find(opt => opt.value === selectedOption);

  const handleOptionClick = (value: string) => {
    setSelectedOption(value);
    setIsOpen(false);
    onFilterChange?.(value);
  };

  return (
    <Sidebar>
      <NavList>
        {options.map((option) => (
          <NavItem key={option.value}>
            <NavLink 
              $active={selectedOption === option.value}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
              <span>{option.count}</span>
            </NavLink>
          </NavItem>
        ))}
      </NavList>

      <MobileSelect>
        <SelectButton 
          onClick={() => setIsOpen(!isOpen)}
          $isOpen={isOpen}
        >
          <span>{selectedItem?.label} <Count>{selectedItem?.count}</Count></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThinDownArrow />
          </div>
        </SelectButton>

        <OptionsList $isOpen={isOpen}>
          {options.map((option) => (
            <Option 
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
            >
              <span>{option.label}</span>
              <Count>{option.count}</Count>
            </Option>
          ))}
        </OptionsList>
      </MobileSelect>
    </Sidebar>
  );
}; 