import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import styled from 'styled-components';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

const CardContainer = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const IconContainer = styled(Box)<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
`;

const Value = styled(Typography)<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 2rem !important;
  font-weight: bold !important;
  line-height: 1.2;
`;

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  return (
    <CardContainer elevation={0}>
      <IconContainer $color={color}>
        {icon}
      </IconContainer>
      <TextContainer>
        <Value $color={color}>
          {value}
        </Value>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </TextContainer>
    </CardContainer>
  );
}; 