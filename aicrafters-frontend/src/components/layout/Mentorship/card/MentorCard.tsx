import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Typography, Button } from '@mui/material';
import { VerifiedUser as VerifiedIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { LoginPopup } from '../../../common/Popup/LoginPopup';
import { useTranslation } from 'react-i18next';

// Types
export interface MentorSkill {
  id: string;
  name: string;
  _id?: string; // Backend includes this in response
}

export interface MentorLanguage {
  id: string;
  name: string;
  _id?: string; // Backend includes this in response
}

export interface MentorStats {
  rating: number;
  reviewsCount: number;
  menteesCount: number;
  sessionsCount: number;
}

export interface Mentor {
  id: string;
  fullName: string; // Changed from name to fullName to match API
  profileImage: string | null; // Changed from imageUrl to profileImage to match API
  title: string;
  bio: string; // Changed from description to bio to match API
  hourlyRate: number; // Added from API response
  country?: string; // Add country field from database
  skills: MentorSkill[];
  languages: MentorLanguage[];
  stats?: MentorStats; // Added from API response
  isVerified?: boolean; // Made optional as it might not be in API
  countryFlag?: string; // Keep for backward compatibility but will be deprecated
}

const CardContainer = styled(Box)`
  display: flex;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid #eef0f3;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
    flex-direction: column;
  }
`;

const MentorImage = styled(Box)<{ imageUrl: string | null }>`
  width: 220px;
  height: 220px;
  background-image: url(${props => props.imageUrl || '/avatars/default-avatar.png'});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  margin-right: 40px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 280px;
    margin-right: 0;
    margin-bottom: 24px;
  }
`;

const ContentContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const HeaderSection = styled(Box)`
  display: flex;
  flex-direction: column;
`;

const NameContainer = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const Name = styled(Typography)`
  && {
    font-size: 25px;
    font-weight: 600;
    color: #2c3e50;
    margin-right: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Title = styled(Typography)`
  font-size: 13px;
  color: #555e68;
  margin-bottom: 12px;
  font-weight: 400;
`;

const SkillsContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 18px;
  gap: 10px;
`;

const SkillTag = styled.span`
  background-color: #e6f7f2;
  color: #007a5a;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  font-weight: 500;

  &::before {
    content: "";
    display: inline-block;
    height: 7px;
    width: 7px;
    background-color: #007a5a;
    border-radius: 50%;
    margin-right: 7px;
  }
`;

const Description = styled(Typography)`
  font-size: 14px;
  color: #485460;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 15px 0;
  border-top: 1px solid #eef0f3;
  border-bottom: 1px solid #eef0f3;
`;

const ButtonContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const BookButton = styled(Button)`
  && {
    background-color: ${props => props.theme.palette.primary.main};
    color: white;
    padding: 8px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    text-transform: none;
    height: 40px;
    box-shadow: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${props => props.theme.palette.background.default};
      box-shadow: none;
    }

    @media (max-width: 768px) {
      width: 100%;
    }
  }
`;

const LanguagesContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Language = styled(Typography)`
  && {
    font-size: 14px;
    color: #007bff;
    display: flex;
    align-items: center;
    font-weight: 400;
    position: relative;
    padding-left: 12px;

    &::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #007bff;
      font-size: 20px;
      line-height: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
`;

const CountryFlag = styled.img`
  width: 20px;
  height: 15px;
  border-radius: 2px;
`;

const VerifiedBadge = styled(VerifiedIcon)`
  color: #007bff;
  font-size: 20px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => {
  const { lang } = useParams<{ lang: string }>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const { t } = useTranslation();
  
  const handleBookSession = () => {
    if (isAuthenticated) {
      // If user is logged in, proceed with the booking
      window.location.href = `/${lang || 'en'}/mentorship/book/${mentor.id}`;
    } else {
      // Store the mentor ID in localStorage for redirection after login
      localStorage.setItem('bookingMentorId', mentor.id);
      // Show login popup
      setShowLoginPopup(true);
    }
  };

  return (
    <CardContainer>
      <MentorImage imageUrl={mentor.profileImage} />
      <ContentContainer>
        <HeaderSection>
          <NameContainer>
            <Name variant="body1">
              {mentor.fullName}
              {mentor.isVerified && <VerifiedBadge />}
              {mentor.countryFlag && <CountryFlag src={mentor.countryFlag} alt={t('mentorship.countryFlagAlt', { defaultValue: 'Country flag' }) as string} />}
            </Name>
          </NameContainer>
          <Title>{t(`titles.${mentor.title}`, { defaultValue: mentor.title }) as string}</Title>
          
          <SkillsContainer>
            {mentor.skills.map(skill => (
              <SkillTag key={skill.id || skill._id}>
                {t(`skills.${skill.name}`, { defaultValue: skill.name }) as string}
              </SkillTag>
            ))}
          </SkillsContainer>
          
          <Description>
            {t(`bios.${mentor.id}`, { defaultValue: mentor.bio }) as string}
          </Description>
        </HeaderSection>
        <Box sx={{ padding: '10px 0' }} />
        
        <ButtonContainer>
          <LanguagesContainer>
            {mentor.languages?.map(language => (
              <Language key={language.id || language._id}>{t(`languages.${language.name}`, { defaultValue: language.name }) as string}</Language>
            ))}
          </LanguagesContainer>
          <Box display="flex" alignItems="center" gap={2}>
            {/* {mentor.hourlyRate && (
              <Typography variant="h6" fontWeight="bold" color="primary">
                {t('mentor.hourlyRate', { rate: mentor.hourlyRate, defaultValue: `$${mentor.hourlyRate}/hr` }) as string}
              </Typography>
            )} */}
            <BookButton variant="contained" onClick={handleBookSession}>
              {t('mentor.bookSession', { defaultValue: 'Book a session' }) as string}
            </BookButton>
          </Box>
        </ButtonContainer>
      </ContentContainer>

      {showLoginPopup && (
        <LoginPopup 
          onClose={() => setShowLoginPopup(false)}
          message={t('mentorship.pleaseLoginToBook')}
        />
      )}
    </CardContainer>
  );
}; 