import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from 'styled-components';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Mentor } from '../card/MentorCard';

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

// --- PROPS INTERFACE ---
interface MentorHeaderInfoProps {
  mentor: Mentor;
}

// --- LANGUAGE FLAG MAPPING ---
// Define language flags mapping for existing languages
const languageFlagMap: Record<string, string> = {
  'French': 'https://flagcdn.com/w20/fr.png',
  'English': 'https://flagcdn.com/w20/gb.png', // Great Britain flag for English
  'Spanish': 'https://flagcdn.com/w20/es.png',
  'German': 'https://flagcdn.com/w20/de.png',
  'Mandarin': 'https://flagcdn.com/w20/cn.png',
  'Hindi': 'https://flagcdn.com/w20/in.png',
  'Japanese': 'https://flagcdn.com/w20/jp.png',
  // Add more as needed
};

// --- MAIN COMPONENT ---
export const MentorHeaderInfo: React.FC<MentorHeaderInfoProps> = ({ mentor }) => {
  return (
    <HeaderContainer>
      <MentorAvatar 
        src={mentor.imageUrl || 'https://placehold.co/80x80/E0E0E0/BDBDBD?text=Mentor'} 
        alt={`${mentor.name}'s avatar`} 
        onError={(e) => (e.currentTarget.src = 'https://placehold.co/80x80/E0E0E0/BDBDBD?text=Mentor')}
      />
      <MainContentWrapper>
        <MentorNameSection>
          <MentorName variant="h4"> {/* Changed to h1 for semantic, styled for visual */}
            {mentor.name}
            {mentor.isVerified !== false && <VerifiedBadge />} {/* Show badge if true or undefined */}
            {mentor.countryFlag && (
              <CountryFlag 
                src={mentor.countryFlag} 
                alt="Country flag" 
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </MentorName>
          <MentorTitle>{mentor.title}</MentorTitle>
        </MentorNameSection>

        {mentor.description && (
          <>
            <SectionTitle>About Me</SectionTitle>
            <AboutText>{mentor.description}</AboutText>
          </>
        )}
        
        {mentor.skills && mentor.skills.length > 0 && (
          <>
            <SectionTitle>Skills</SectionTitle> {/* Removed colon for cleaner look */}
            <SkillsContainer>
              {mentor.skills.map(skill => (
                <SkillTag key={skill.id}>
                  <Bullet>•</Bullet> {/* Using bullet as per original */}
                  {skill.name}
                </SkillTag>
              ))}
            </SkillsContainer>
          </>
        )}
        
        {mentor.languages && mentor.languages.length > 0 && (
          <>
            <SectionTitle>Spoken Languages</SectionTitle> {/* Removed colon */}
            <LanguageSection>
              {mentor.languages.map(language => (
                <Language key={language.id}>
                  {languageFlagMap[language.name] && (
                    <LanguageFlag 
                        src={languageFlagMap[language.name]} 
                        alt={`${language.name} flag`} 
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  {language.name}
                </Language>
              ))}
            </LanguageSection>
          </>
        )}
      </MainContentWrapper>
    </HeaderContainer>
  );
}; 