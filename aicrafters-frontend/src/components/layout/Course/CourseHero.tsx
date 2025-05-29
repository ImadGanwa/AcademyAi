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
    padding: 16px 0 0;
    margin-bottom: 0;
    background: ${props => props.theme.palette.primary.main};
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
    margin-bottom: 16px;
    padding: 0 16px;
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

// Add mobile-specific hero section
const MobileHeroSection = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    background: white;
    margin: 0 16px 16px 16px;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
`;

const MobileHeroTitle = styled(Typography)`
  font-size: 1.5rem !important;
  font-weight: bold !important;
  line-height: 1.3 !important;
  margin-bottom: 12px !important;
  color: ${props => props.theme.palette.text.title} !important;
  text-align: center;
`;

const MobileHeroSubtitle = styled(Typography)`
  font-size: 1rem !important;
  color: ${props => props.theme.palette.text.secondary} !important;
  line-height: 1.4 !important;
  margin-bottom: 16px !important;
  text-align: center;
`;

const MobileCategoryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: ${props => props.theme.palette.primary.main};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 16px;
`;

// Add course thumbnail for mobile
const MobileThumbnail = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

interface CourseHeroProps {
  title: string;
  category?: string;
  subtitle?: string;
  image?: string;
}

export const CourseHero: React.FC<CourseHeroProps> = ({
  title,
  category = '',
  subtitle = '',
  image
}) => {
  const { i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  return (
    <>
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
      
      <MobileHeroSection>
        {category && (
          <MobileCategoryBadge>
            {category}
          </MobileCategoryBadge>
        )}
        <MobileHeroTitle variant="h1">
          {title}
        </MobileHeroTitle>
        <MobileHeroSubtitle>
          {subtitle}
        </MobileHeroSubtitle>
        {image && (
          <MobileThumbnail>
            <img src={image} alt={title} />
          </MobileThumbnail>
        )}
      </MobileHeroSection>
    </>
  );
}; 