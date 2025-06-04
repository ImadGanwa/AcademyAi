import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import styled from 'styled-components';
import { VerifiedUser as VerifiedIcon, LinkedIn as LinkedInIcon } from '@mui/icons-material';
import { Mentor } from '../card/MentorCard';
import { useTranslation } from 'react-i18next';
import { getCountryFlag, getLanguageFlag, getCountryName } from '../../../../utils/countryUtils';

// Main container for the entire header card
const HeaderContainer = styled(Box)`
  display: flex; /* Changed from column to row */
  flex-direction: row; /* Explicitly row */
  align-items: stretch; /* Changed from flex-start to stretch to match heights */
  padding: 24px;
  margin-bottom: 24px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

// Container for the mentor's avatar image
const MentorAvatar = styled.img`
  width: 250px; /* Fixed width */
  min-height: 280px; /* Minimum height to ensure good proportions */
  border-radius: 10px; /* Slightly rounded corners, not circular */
  object-fit: cover;
  margin-right: 25px; /* Space between avatar and content */
  flex-shrink: 0; /* Prevent avatar from shrinking */
  align-self: flex-start; /* Align to top */
  max-height: 350px; /* Maximum height to prevent excessive stretching */
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
    height: auto;
    aspect-ratio: 3/4;
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

// Wrapper for all content to the right of the avatar
const MainContentWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1; /* Takes remaining space */
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Section for Mentor's name and title
const MentorNameSection = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px; /* Space before "About Me" */
`;

// Mentor's name styling
const MentorName = styled(Typography)`
  font-size: 22px; /* Adjusted to match image_dac00a.png */
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Mentor's title (e.g., "Personal Development Coach")
const MentorTitle = styled(Typography)`
  font-size: 15px; /* Adjusted */
  color: #555e68;
  margin-top: 4px;
`;

// Country flag image
const CountryFlag = styled.img`
  width: 20px; /* Adjusted */
  height: 15px; /* Adjusted for better aspect ratio for flags */
  border-radius: 2px;
  margin-left: 4px; /* Slightly less margin */
`;

// Styling for section titles like "About Me", "Skills"
const SectionTitle = styled(Typography)`
  font-size: 18px; /* Adjusted */
  color: #48a5ea; /* Kept blue color */
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 500;

  &:first-child {
    margin-top: 0; /* Remove top margin for the first section title if Name/Title is compact */
  }
`;

// Paragraph text for "About Me"
const AboutText = styled(Typography)`
  font-size: 14px; /* Adjusted */
  color: #485460;
  line-height: 1.6;
  margin-bottom: 16px;
`;

// Container for skill tags
const SkillsContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 16px;
`;

// Individual skill tag
const SkillTag = styled(Box)`
  background-color: #e6f7f2;
  color: #007a5a;
  padding: 5px 12px; /* Adjusted padding */
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px; /* Adjusted gap */
`;

// Bullet point for skills (optional, if not using an icon)
const Bullet = styled.span`
  color: #007a5a;
  font-size: 16px; /* Can be adjusted or replaced with an icon */
  line-height: 1;
`;

// Section for spoken languages
const LanguageSection = styled(Box)`
  display: flex;
  flex-wrap: wrap; /* Allow languages to wrap */
  align-items: center;
  margin-top: 8px;
  gap: 16px;
`;

// Individual language item
const Language = styled(Box)`
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Flag image for languages
const LanguageFlag = styled.img`
  width: 20px;
  height: 14px;
  border-radius: 2px;
`;

// Verified badge icon
const VerifiedBadge = styled(VerifiedIcon)`
  color: #1da1f2; /* Twitter blue */
  font-size: 18px; /* Adjusted size */
`;

// LinkedIn section container
const LinkedInSection = styled(Box)`
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 16px;
`;

// LinkedIn link styling
const LinkedInLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0077b5; /* LinkedIn blue */
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid #0077b5;
  border-radius: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #0077b5;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 119, 181, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// LinkedIn icon styling
const LinkedInIconStyled = styled(LinkedInIcon)`
  font-size: 18px;
`;

// See More/Less button
const SeeMoreButton = styled(Button)`
  && {
    color: ${props => props.theme.palette.primary.main};
    font-size: 13px;
    font-weight: 500;
    padding: 4px 0;
    text-transform: none;
    justify-content: flex-start;
    min-width: auto;
    
    &:hover {
      background: none;
      text-decoration: underline;
      color: ${props => props.theme.palette.primary.dark};
    }
  }
`;

// Collapsible text component
interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({ text, maxLength = 550 }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { t } = useTranslation();

  if (text.length <= maxLength) {
    return <AboutText>{text}</AboutText>;
  }

  const truncatedText = text.substring(0, maxLength) + '...';

  return (
    <Box>
      <AboutText>
        {isExpanded ? text : truncatedText}
      </AboutText>
      <SeeMoreButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded 
          ? (t('mentorship.seeLess', { defaultValue: 'See less' }) as string)
          : (t('mentorship.seeMore', { defaultValue: 'See more' }) as string)
        }
      </SeeMoreButton>
    </Box>
  );
};

// --- PROPS INTERFACE ---
interface MentorHeaderInfoProps {
  mentor: Mentor;
}

// --- MAIN COMPONENT ---
export const MentorHeaderInfo: React.FC<MentorHeaderInfoProps> = ({ mentor }) => {
  const { t } = useTranslation();

  // Get country flag and name from mentor's country field
  const countryFlag = mentor.country ? getCountryFlag(mentor.country) : null;
  const countryName = mentor.country ? getCountryName(mentor.country) : null;

  return (
    <HeaderContainer>
      <MentorAvatar 
        src={mentor.profileImage || 'https://placehold.co/80x80/E0E0E0/BDBDBD?text=Mentor'} 
        alt={t('mentorship.mentorAvatar', { name: mentor.fullName, defaultValue: `${mentor.fullName}'s avatar` }) as string} 
        onError={(e) => (e.currentTarget.src = 'https://placehold.co/80x80/E0E0E0/BDBDBD?text=Mentor')}
      />
      <MainContentWrapper>
        <MentorNameSection>
          <MentorName variant="h4">
            {mentor.fullName}
            {mentor.isVerified !== false && <VerifiedBadge />}
            {(countryFlag || mentor.countryFlag) && (
              <CountryFlag 
                src={countryFlag || mentor.countryFlag!} 
                alt={`${countryName || 'Country'} flag`}
                title={countryName || 'Country'}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </MentorName>
          <MentorTitle>{t(`titles.${mentor.title}`, { defaultValue: mentor.title }) as string}</MentorTitle>
        </MentorNameSection>

        {mentor.professionalInfo?.linkedIn && (
          <LinkedInSection>
            <LinkedInLink 
              href={mentor.professionalInfo.linkedIn.startsWith('http') 
                ? mentor.professionalInfo.linkedIn 
                : `https://linkedin.com/in/${mentor.professionalInfo.linkedIn}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('mentorship.viewLinkedInProfile', { defaultValue: 'View LinkedIn Profile' }) as string}
            >
              <LinkedInIconStyled />
              {t('mentorship.linkedInProfile', { defaultValue: 'LinkedIn Profile' }) as string}
            </LinkedInLink>
          </LinkedInSection>
        )}

        {mentor.bio && (
          <>
            <SectionTitle>{t('mentorship.aboutMe', { defaultValue: 'About Me' }) as string}</SectionTitle>
            <AboutText>{t(`bios.${mentor.id}`, { defaultValue: mentor.bio }) as string}</AboutText>
          </>
        )}

        {mentor.professionalInfo?.experience && (
          <>
            <SectionTitle>{t('mentorship.experience', { defaultValue: 'Experience' }) as string}</SectionTitle>
            <CollapsibleText text={mentor.professionalInfo.experience} />
          </>
        )}

        {mentor.professionalInfo?.academicBackground && (
          <>
            <SectionTitle>{t('mentorship.academicBackground', { defaultValue: 'Academic Background' }) as string}</SectionTitle>
            <CollapsibleText text={mentor.professionalInfo.academicBackground} />
          </>
        )}
        
        {mentor.skills && mentor.skills.length > 0 && (
          <>
            <SectionTitle>{t('mentorship.skillsSection', { defaultValue: 'Skills' }) as string}</SectionTitle>
            <SkillsContainer>
              {mentor.skills.map(skill => (
                <SkillTag key={skill.id}>
                  <Bullet>•</Bullet>
                  {t(`skills.${skill.name}`, { defaultValue: skill.name }) as string}
                </SkillTag>
              ))}
            </SkillsContainer>
          </>
        )}
        
        {mentor.languages && mentor.languages.length > 0 && (
          <>
            <SectionTitle>{t('mentorship.spokenLanguages', { defaultValue: 'Spoken Languages' }) as string}</SectionTitle>
            <LanguageSection>
              {mentor.languages.map(language => {
                const languageFlag = getLanguageFlag(language.name);
                return (
                  <Language key={language.id}>
                    {languageFlag && (
                      <LanguageFlag 
                        src={languageFlag} 
                        alt={`${language.name} flag`}
                        title={language.name}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    {t(`languages.${language.name}`, { defaultValue: language.name }) as string}
                  </Language>
                );
              })}
            </LanguageSection>
          </>
        )}
      </MainContentWrapper>
    </HeaderContainer>
  );
}; 