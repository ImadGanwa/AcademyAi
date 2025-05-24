import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChoicePageContainer,
  PageTitle,
  PageSubtitle,
  CardsContainer,
  AdwinCard,
  TraceCard,
  CardContentWrapper,
  LogoImage,
  TraceLogo,
  CardTitle,
  CardDescription,
  AdwinButton,
  TraceButton,
  FloatingParticle,
} from './ChoicePage.styles';

import AdwinLogo from '../../assets/images/logo.svg';

const CHOICE_MADE_SESSION_KEY = 'userChoiceMade';

// Trace+ Logo Component using the provided SVG
const TraceLogoSVG: React.FC = () => (
  <svg width="136.6" height="24" viewBox="0 0 90 16" fill="none">
    <g clipPath="url(#clip0_6_763)">
      <path 
        d="M56.6974 10.0921V10.2237C56.6974 12.1316 55.6842 12.5395 54.4474 12.5395C53.2105 12.5395 52.1974 12.1316 52.1974 10.2237V5.97368C52.1974 4.07895 53.2105 3.67105 54.4474 3.67105C55.6842 3.67105 56.6974 4.07895 56.6974 5.97368V6.07895H60.3553L60.4342 10.0921H56.6974ZM40.5132 7.82895H37.8947L38.3684 6.61842C39.1316 4.78947 39.6711 4.32895 40.5263 4.32895V7.82895H40.5132ZM26.6842 5.21053C26.6842 6.01316 26.2763 6.67105 24.3684 6.67105H22.4079V3.72368H24.3553C26.2763 3.72368 26.6842 4.40789 26.6842 5.21053ZM73.5921 5.38158V0.394737L60.2763 0.407895V1.71053C59.1447 0.684211 57.2895 0 54.4605 0C49.0921 0 47.171 2.09211 47.171 5.28947V9.97369C47.171 11.5526 46.8684 11.8553 46.3553 11.8684C45.8289 11.8553 45.5395 11.4868 45.5395 9.97369V0.394737H39.0658C36.75 0.394737 35.0132 1.48684 33.8026 4.71053L31.6974 10.8421C31.5 11.3947 31.2632 11.4737 31.0132 11.4737C30.7237 11.4737 30.4474 11.2895 30.25 10.6842L29.5395 9.17105C31.3026 8.35526 31.9079 6.96053 31.9079 5.43421V4.96053C31.9079 2.46053 30.4605 0.381579 24.5526 0.381579H17.3684H17.3421H0V5.36842H4.02632V4.32895C4.02632 4 4.28947 3.72368 4.63158 3.72368H6.25V12.9079C6.25 14.6053 7.63158 15.9868 9.3421 15.9868H12.3947V12.5526H12.3553C11.75 12.5526 11.25 12.0526 11.25 11.4474V3.73684H12.8684C13.1974 3.73684 13.4737 4 13.4737 4.34211V5.38158H17.3684V5.32895V5.38158V11.4605C17.3684 12.0658 16.8816 12.5658 16.2632 12.5658V16H22.4211V10.0526H22.9342C23.75 10.0526 24.4737 10.4342 24.8421 11.1053L27.3947 15.9868H31.0132H31.0658H32.5263C34.7895 15.9868 35.2763 15.4868 36.0132 13.6447L36.9079 11.1316H40.5263L40.5132 15.9868H46.3816H73.5921V10.9079H69.5395L69.5526 11.9605C69.5526 12.2895 69.2895 12.5526 68.9474 12.5526L65.3421 12.5395V9.69737H68.3816V6.4079H65.3421V3.72368H68.9474C69.2763 3.72368 69.5526 3.98684 69.5526 4.32895L69.5395 5.38158H73.5921Z" 
        fill="url(#paint0_linear_6_763)"
      />
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M84.394 5.3419H89.6177V10.8814H84.394V15.9735H78.8545V10.8814H73.6309V5.3419H78.8545V0.394531H84.394V5.3419ZM78.8555 10.8022V5.4338C78.8555 5.36801 78.9344 5.34169 78.987 5.35485L84.3423 8.03906C84.4081 8.07854 84.4081 8.15748 84.3423 8.1838L78.987 10.868C78.9344 10.9075 78.8555 10.868 78.8555 10.8022Z" 
        fill="url(#paint1_linear_6_763)"
      />
    </g>
    <defs>
      <linearGradient id="paint0_linear_6_763" x1="0" y1="7.99921" x2="73.5898" y2="7.99921" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EC2409"/>
        <stop offset="1" stopColor="#FF7A1D"/>
      </linearGradient>
      <linearGradient id="paint1_linear_6_763" x1="73.6252" y1="8.18847" x2="89.6236" y2="8.18847" gradientUnits="userSpaceOnUse">
        <stop offset="0.4984" stopColor="#FA6217"/>
        <stop offset="1" stopColor="#FF9D1D"/>
      </linearGradient>
      <clipPath id="clip0_6_763">
        <rect width="90" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const ChoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleAdwinChoice = () => {
    sessionStorage.setItem(CHOICE_MADE_SESSION_KEY, 'true');
    navigate('/dashboard');
  };

  const handleTraceChoice = () => {
    sessionStorage.setItem(CHOICE_MADE_SESSION_KEY, 'true');
    window.location.href = 'https://trace.plus/en/';
  };

  return (
    <ChoicePageContainer>
      {/* Floating particles */}
      <FloatingParticle />
      <FloatingParticle />
      <FloatingParticle />
      <FloatingParticle />
      <FloatingParticle />
      <FloatingParticle />
      
      <PageTitle variant="h1" as="h1">
        {t('choice.title', { defaultValue: 'Choose Your Learning Path' }) as string}
      </PageTitle>
      
      <PageSubtitle variant="h6" as="p">
        {t('choice.subtitle', { defaultValue: 'Select the platform that best fits your educational journey and unlock a world of possibilities' }) as string}
      </PageSubtitle>
      
      <CardsContainer>
        <AdwinCard>
          <CardContentWrapper>
            <LogoImage src={AdwinLogo} alt="Adwin.ai Academy Logo" />
            <CardTitle variant="h4" as="h2">
              {t('choice.adwin.title', { defaultValue: 'Adwin.ai Academy' }) as string}
            </CardTitle>
            <CardDescription variant="body1">
              {t('choice.adwin.description', { defaultValue: 'Dive into our comprehensive learning ecosystem featuring AI-powered courses, interactive workshops, and personalized learning paths designed to accelerate your growth.' }) as string}
            </CardDescription>
          </CardContentWrapper>
          <AdwinButton 
            variant="contained" 
            onClick={handleAdwinChoice}
            size="large"
          >
            {t('choice.adwin.button', { defaultValue: 'Start Your Journey' }) as string}
          </AdwinButton>
        </AdwinCard>

        <TraceCard>
          <CardContentWrapper>
            <TraceLogo>
              <TraceLogoSVG />
            </TraceLogo>
            <CardTitle variant="h4" as="h2">
              {t('choice.trace.title', { defaultValue: 'Trace+ Platform' }) as string}
            </CardTitle>
            <CardDescription variant="body1">
              {t('choice.trace.description', { defaultValue: 'Access premium streaming content, educational resources, and specialized courses curated by your institution through the Trace+ ecosystem.' }) as string}
            </CardDescription>
          </CardContentWrapper>
          <TraceButton 
            variant="contained" 
            onClick={handleTraceChoice}
            size="large"
          >
            {t('choice.trace.button', { defaultValue: 'Explore Trace+' }) as string}
          </TraceButton>
        </TraceCard>
      </CardsContainer>
    </ChoicePageContainer>
  );
};

export default ChoicePage;