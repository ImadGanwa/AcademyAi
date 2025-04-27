import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import styled from 'styled-components';
import { RouterLink } from '../RouterLink/RouterLink';

interface CourseCardProps {
  id: string;
  title: string;
  trainer: string;
  tag?: {
    name: string;
    color: string;
  };
  image: string;
  onClick?: () => void;
}

const StyledCard = styled(Card)`
  position: relative;
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out !important;
  background-color: #FAFBFC !important;
  box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.0) !important;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  }
`;

const CardImage = styled.img`
  height: auto;
  width: 100%;
`;

const Tag = styled(Box)<{ $color: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 8px;
  background-color: ${props => props.$color};
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
`;

const ContentWrapper = styled(Box)`
  padding: 16px;
`;

const Title = styled(Typography)`
  font-weight: bold;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: auto !important;
  font-size: 1.1rem !important;
  color: ${props => props.theme.palette.text.title} !important;
  line-height: 1.1 !important;
`;

const Trainer = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary} !important;
  font-size: .9rem !important;
  line-height: 1 !important;
  margin-top: 18px !important;
`;

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  trainer,
  tag,
  image,
  onClick
}) => {
  
  return (
    <div onClick={onClick}>
      <RouterLink to={`/courses/${id}`} style={{ textDecoration: 'none' }} onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}>
        <StyledCard>
          <CardImage
            src={image}
            alt={title}
          />
          {tag && (
            <Tag $color={tag.color}>
              {tag.name}
            </Tag>
          )}
          <ContentWrapper>
            <Title variant="h6">
              {title}
            </Title>
            <Trainer>
              {trainer}
            </Trainer>
          </ContentWrapper>
        </StyledCard>
      </RouterLink>
    </div>
  );
}; 