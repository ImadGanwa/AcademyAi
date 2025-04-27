import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { RouterLink } from '../../common/RouterLink/RouterLink';
import { ReactComponent as HomeIcon } from '../../../assets/icons/home.svg';
import { ReactComponent as ArrowRightIcon } from '../../../assets/icons/arrow-right.svg';
import { isRTL } from '../../../utils/i18n/i18n';

const HeroSection = styled.section`
  width: 100%;
  background-color: ${props => props.theme.palette.background.default};
  padding: 80px 0;
  margin-bottom: 50px;

  @media (max-width: 768px) {
    padding: 14px 0 0;
    margin-bottom: 0;
  }
`;

const HeroContainer = styled(Container)`
  display: flex;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ContentWrapper = styled(Box)`
  flex: 0 0 66.666667%;
  max-width: 66.666667%;
`;

const BreadcrumbNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 14px;
  }
`;

const StyledRouterLink = styled(RouterLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #ffffff;
  font-size: 0.875rem;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: .7;
  }

  svg {
    width: 30px;
    height: 30px;
    
    path {
      stroke: #ffffff !important;
    }
  }
`;

const BreadcrumbText = styled(Typography)`
  color: #ffffff;
  font-size: 0.875rem;
`;

const BreadcrumbSeparator = styled(ArrowRightIcon)<{ $isRtl: boolean }>`
  width: 16px;
  height: 16px;
  transform: ${props => props.$isRtl ? 'rotate(180deg)' : 'none'};
  path {
    stroke: #ffffff;
  }
`;

const Title = styled(Typography)`
  font-size: 2.5rem !important;
  font-weight: bold !important;
  line-height: 1.2 !important;
  margin-bottom: 24px !important;
  color: #ffffff !important;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Description = styled(Typography)`
  font-size: 1.1rem !important;
  color: #ffffff !important;
  margin-bottom: 40px !important;
  line-height: 1.4 !important;
  opacity: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

interface CourseHeroProps {
  title: string;
  category?: string;
  subtitle?: string;
}

export const CourseHero: React.FC<CourseHeroProps> = ({
  title,
  category = '',
  subtitle = ''
}) => {
  const { i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  return (
    <HeroSection>
      <HeroContainer maxWidth="lg">
        <ContentWrapper>
          <BreadcrumbNav aria-label="breadcrumb">
            <StyledRouterLink to="/">
              <HomeIcon />
            </StyledRouterLink>
            <BreadcrumbSeparator $isRtl={isRtl} />
            <BreadcrumbText>{category}</BreadcrumbText>
          </BreadcrumbNav>
          <Title variant="h1">
            {title}
          </Title>
          <Description>
            {subtitle}
          </Description>
        </ContentWrapper>
      </HeroContainer>
    </HeroSection>
  );
}; 