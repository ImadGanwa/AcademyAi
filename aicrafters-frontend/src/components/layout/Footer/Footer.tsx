import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import { RouterLink } from '../../common/RouterLink/RouterLink';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { languages } from '../../../utils/i18n/i18n';
import { Logo } from '../../common/Logo/Logo';

const FooterWrapper = styled.footer`
  background-color: ${({ theme }) => theme.palette.primary.main};
  padding: 48px 0 24px;
  margin-top: auto;
  position: relative;
`;

const FooterLogoContainer = styled.div`
  text-align: left;
  
  @media (max-width: 900px) {
    text-align: center;
    margin-bottom: 55px;
  }
`;

const FooterLogo = styled(Logo)`
  height: auto;
  width: auto;
`;

const FooterSection = styled.div`
  margin-bottom: 24px;
`;

const FooterTitle = styled(Typography)`
  && {
    color: ${({ theme }) => theme.palette.primary.main};
    font-weight: 600;
    margin-bottom: 16px;
    font-size: 16px;
  }
`;

const FooterLink = styled(RouterLink)`
  && {
    color: #ffffff;
    text-decoration: none;
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    
    &:hover {
      color: ${({ theme }) => theme.palette.secondary.main};
    }
  }
`;

const CopyrightContainer = styled.div`
  text-align: left;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const MobileCopyrightContainer = styled.div`
  display: none;
  
  @media (max-width: 900px) {
    display: block;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
  }
`;

const CopyrightText = styled(Typography)`
  && {
    font-size: 12px;
    color: #ffffff;
  }
`;

const LanguageLink = styled.button`
  && {
    color: #ffffff;
    text-decoration: none;
    display: block;
    margin-bottom: 8px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: inherit;
    font: inherit;
    font-size: 14px;
    
    &:hover {
      color: ${({ theme }) => theme.palette.secondary.main};
    }
  }
`;

const FooterLogoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FooterLogoSection>
              <FooterLogoContainer>
                <FooterLogo />
              </FooterLogoContainer>
              <CopyrightContainer>
                <CopyrightText variant="body2">
                  © Copyright {currentYear} - AI Crafters
                </CopyrightText>
              </CopyrightContainer>
            </FooterLogoSection>
          </Grid>

          <Grid item xs={6} md={2}>
            <FooterSection>
              <FooterTitle variant="h6">
                {t('common.footer.explore')}
              </FooterTitle>
              {/* <FooterLink to="/business">
                {t('common.navigation.businessLink')}
              </FooterLink> */}
              {/* <FooterLink to="/teach">
                {t('common.navigation.teachLink')}
              </FooterLink> */}
              {/* <FooterLink to="/about">
                {t('common.footer.aboutUs')}
              </FooterLink> */}
              {/* <FooterLink to="/contact">
                {t('common.footer.contactUs')}
              </FooterLink> */}
              {/* 
              <FooterLink to="/app">
                {t('common.footer.getApp')}
              </FooterLink>
              */}
              <FooterLink to="/mentorship/become-mentor">
                {t('common.navigation.becomeAMentor')}
              </FooterLink>
               
              {languages.map((lang) => (
                <LanguageLink
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  style={{
                    fontWeight: i18n.language === lang ? 600 : 400,
                  }}
                >
                  {t(`common.languages.${lang}`)}
                </LanguageLink>
              ))}
            </FooterSection> 
          </Grid>

          <Grid item xs={6} md={2}>
            {/* <FooterSection>
              <FooterTitle variant="h6">
                {t('common.footer.resources')}
              </FooterTitle>
              <FooterLink to="/blog">
                {t('common.footer.blog')}
              </FooterLink>
              <FooterLink to="/help">
                {t('common.footer.helpSupport')}
              </FooterLink>
              <FooterLink to="/affiliate">
                {t('common.footer.affiliate')}
              </FooterLink>
              <FooterLink to="/investors">
                {t('common.footer.investors')}
              </FooterLink>
            </FooterSection> */}
          </Grid>

          <Grid item xs={6} md={2}>
            {/* <FooterSection>
              <FooterTitle variant="h6">
                {t('common.footer.company')}
              </FooterTitle>
              <FooterLink to="/terms">
                {t('common.footer.terms')}
              </FooterLink>
              <FooterLink to="/privacy">
                {t('common.footer.privacy')}
              </FooterLink>
              <FooterLink to="/cookie-settings">
                {t('common.footer.cookieSettings')}
              </FooterLink>
              <FooterLink to="/sitemap">
                {t('common.footer.sitemap')}
              </FooterLink>
              <FooterLink to="/accessibility">
                {t('common.footer.accessibility')}
              </FooterLink>
            </FooterSection> */}
          </Grid>

          <Grid item xs={6} md={2}>
            <FooterSection>
              {/* <FooterTitle variant="h6">
                {t('common.footer.language')}
              </FooterTitle>
              {languages.map((lang) => (
                <LanguageLink
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  style={{
                    fontWeight: i18n.language === lang ? 600 : 400,
                  }}
                >
                  {t(`common.languages.${lang}`)}
                </LanguageLink>
              ))} */}
            </FooterSection>
          </Grid>
        </Grid>
        
        <MobileCopyrightContainer>
          <CopyrightText variant="body2">
            © Copyright {currentYear} - AI Crafters
          </CopyrightText>
        </MobileCopyrightContainer>
      </Container>
    </FooterWrapper>
  );
}; 