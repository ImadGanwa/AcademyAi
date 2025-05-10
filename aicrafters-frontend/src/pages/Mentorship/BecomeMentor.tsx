import React from 'react';
import { Typography } from '@mui/material';
import styled from 'styled-components';
import { Layout } from '../../components/layout/Layout/Layout';
import MentorApplicationForm from '../../components/layout/Mentorship/MentorApplicationForm';

// Styled components
const PageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeroSection = styled.div`
  width: 100%;
  max-width: 1200px;
  text-align: center;
  padding: 80px 20px 60px;
`;

const MainTitle = styled(Typography)`
  font-size: 42px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.title};
  margin-bottom: 10px;
`;

const SubTitle = styled(Typography)`
  font-size: 36px;
  margin-bottom: 40px;
  
  span {
    color: ${props => props.theme.palette.primary.main};
    font-weight: 500;
  }
`;

const MissionSection = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  margin: 40px 20px;
  gap: 40px;
  
  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const MissionImage = styled.div`
  flex: 1;
  min-width: 300px;
  
  img {
    width: 100%;
    border-radius: 10px;
    height: 100%;
    object-fit: cover;
    max-height: 350px;
  }
`;

const MissionContent = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SectionTitle = styled(Typography)`
  font-size: 32px;
  font-weight: 600;
  color: ${props => props.theme.palette.text.title};
  margin-bottom: 20px;
`;

const SectionText = styled(Typography)`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 20px;
`;

const BenefitsSection = styled.div`
  width: 100%;
  max-width: 1200px;
  text-align: center;
  padding: 60px 20px;
`;

const BenefitsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
  
  @media (max-width: 900px) {
    flex-direction: column;
  }
  
  & > div {
    flex-basis: calc(33.33% - 20px);
  }
  
  /* First 3 cards in row 1 */
  & > div:nth-child(-n+3) {
    flex-basis: calc(33.33% - 20px);
  }
  
  /* Last 2 cards in row 2, centered */
  & > div:nth-child(n+4) {
    flex-basis: calc(33.33% - 20px);
    margin-top: 30px;
  }
  
  @media (max-width: 900px) {
    & > div {
      flex-basis: 100%;
      margin-top: 20px;
    }
  }
`;

const BenefitCard = styled.div`
  background-color: ${props => props.theme.palette.background.paper};
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 15px;
    color: ${props => props.theme.palette.text.title};
  }
  
  p {
    font-size: 15px;
    line-height: 1.6;
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => `${props.theme.palette.primary.main}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  
  img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 50%;
  }
`;

// Main component
const BecomeMentor: React.FC = () => {
  // const theme = useTheme();
  
  return (
    <Layout title="Become a Mentor">
      <PageContainer>
        {/* Hero Section */}
        <HeroSection>
          <MainTitle variant="h2">Become a Mentor</MainTitle>
          <SubTitle variant="h3"><span>Empower</span> a New Generation of Women.</SubTitle>
        </HeroSection>
        
        {/* Mission Section */}
        <MissionSection>
          <MissionImage>
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" alt="Professional mentors" />
          </MissionImage>
          <MissionContent>
            <SectionTitle variant="h4">Our Mission</SectionTitle>
            <SectionText>
              We believe that mentorship can be a life-changing force, not only for those receiving guidance, but also for those giving it. Our platform is built to create intentional, respectful, and impactful connections between Afro-descendant women and experienced mentors who can support their journey toward personal and professional growth.
            </SectionText>
            <SectionText>
              We aim to create a global network where knowledge, trust, and confidence flow freely, helping mentees gain clarity, unlock opportunities, and move closer to their aspirations.
            </SectionText>
          </MissionContent>
        </MissionSection>
        
        {/* Benefits Section */}
        <BenefitsSection>
          <SectionTitle variant="h4">Why Mentor with Us?</SectionTitle>
          <BenefitsGrid>
            <BenefitCard>
              <IconWrapper>
                <img src="/logo192.png" alt="Impact Icon" />
              </IconWrapper>
              <h3>Create Real Impact</h3>
              <p>Your mentorship could be the turning point in someone's academic, personal, or career journey. Empower women who are actively seeking guidance to navigate challenges and set meaningful goals.</p>
            </BenefitCard>
            
            <BenefitCard>
              <IconWrapper>
                <img src="/logo192.png" alt="Cross-Cultural Icon" />
              </IconWrapper>
              <h3>Build Cross-Cultural Relationships</h3>
              <p>Connect with mentees across different countries, industries, and backgrounds — fostering shared learning and new perspectives for both of you.</p>
            </BenefitCard>
            
            <BenefitCard>
              <IconWrapper>
                <img src="/logo192.png" alt="Sharing Icon" />
              </IconWrapper>
              <h3>Share What You've Learned</h3>
              <p>Your life experience and career path hold valuable lessons. Help someone else grow by sharing your story, knowledge, and insights.</p>
            </BenefitCard>
            
            <BenefitCard>
              <IconWrapper>
                <img src="/logo192.png" alt="Flexible Commitment Icon" />
              </IconWrapper>
              <h3>Flexible Commitment</h3>
              <p>Whether you can offer one hour a month or a deeper engagement over several months, we accommodate your availability and preferred mentorship style.</p>
            </BenefitCard>
            
            <BenefitCard>
              <IconWrapper>
                <img src="/logo192.png" alt="Recognition Icon" />
              </IconWrapper>
              <h3>Be Recognized</h3>
              <p>Mentors receive official certificates, LinkedIn badges, and visibility through AiCademy's spotlight features.</p>
            </BenefitCard>
          </BenefitsGrid>
        </BenefitsSection>
        
        {/* Application Form Section */}
        <MentorApplicationForm />
      </PageContainer>
    </Layout>
  );
};

export default BecomeMentor; 