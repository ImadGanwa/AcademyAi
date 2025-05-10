import React from 'react';
import { Box, Pagination as MuiPagination, PaginationItem } from '@mui/material';
import { KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRightIcon } from '@mui/icons-material';
import styled from 'styled-components';

const PaginationContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px 16px;
  width: 100%;
  max-width: 1200px;
  height: 68px;
  position: relative;
  margin: 0 auto;
  border-top: 1px solid #E9EAEB;
`;

const PageNumbers = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const StyledPagination = styled(MuiPagination)`
  .MuiPaginationItem-root {
    color: #666;
    font-size: 15px;
    margin: 0 4px;
    
    &.Mui-selected {
      background-color: ${props => props.theme.palette.primary.main};
      color: white;
      font-weight: 500;
    }
  }
`;

const NavigationButton = styled(Box)<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid #E9EAEB;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : '#f5f5f5'};
  }
`;

const ButtonText = styled.span`
  margin: 0 4px;
  font-weight: 500;
  font-size: 14px;
  color: #555;
`;

interface CustomPaginationProps {
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({ count, page, onChange }) => {
  const handlePrevious = () => {
    if (page > 1) {
      onChange({} as React.ChangeEvent<unknown>, page - 1);
    }
  };

  const handleNext = () => {
    if (page < count) {
      onChange({} as React.ChangeEvent<unknown>, page + 1);
    }
  };

  return (
    <PaginationContainer>
      <NavigationButton 
        onClick={handlePrevious} 
        disabled={page === 1}
      >
        <ArrowLeftIcon fontSize="small" />
        <ButtonText>Previous</ButtonText>
      </NavigationButton>

      <PageNumbers>
        <StyledPagination
          count={count}
          page={page}
          onChange={onChange}
          variant="outlined"
          shape="rounded"
          size="large"
          siblingCount={1}
          boundaryCount={1}
          hidePrevButton
          hideNextButton
          renderItem={(item) => (
            <PaginationItem
              sx={{
                borderRadius: '4px',
                padding: '8px 12px',
                '&.Mui-selected': {
                  backgroundColor: theme => theme.palette.primary.main,
                  color: 'white',
                },
                '&.MuiPaginationItem-ellipsis': {
                  border: 'none'
                }
              }}
              {...item}
            />
          )}
        />
      </PageNumbers>

      <NavigationButton 
        onClick={handleNext} 
        disabled={page === count}
      >
        <ButtonText>Next</ButtonText>
        <ArrowRightIcon fontSize="small" />
      </NavigationButton>
    </PaginationContainer>
  );
}; 