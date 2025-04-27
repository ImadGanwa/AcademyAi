import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Container, Grid, Dialog, TextField } from '@mui/material';
import { Button } from '../../components/common/Button/Button';
import { motion } from 'framer-motion';
import { Layout } from '../../components/layout/Layout/Layout';
import { Helmet } from 'react-helmet-async';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0a1930 0%, #162a4a 100%);
  color: white;
  position: relative;
  overflow: hidden;
`;

const Section = styled.section`
  padding: 100px 0;
  position: relative;
  overflow: hidden;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const HeroSection = styled(Section)`
  text-align: center;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(10, 25, 48, 0.97) 0%, rgba(22, 42, 74, 0.97) 100%);
  position: relative;
  overflow: hidden;
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.1;
  background-image: radial-gradient(circle at 25px 25px, rgba(255, 215, 0, 0.2) 2%, transparent 0%),
                    radial-gradient(circle at 75px 75px, rgba(255, 215, 0, 0.2) 2%, transparent 0%);
  background-size: 100px 100px;
`;

const FloatingShape = styled(motion.div)<{ size: number; color: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  filter: blur(40px);
  z-index: 1;
  opacity: 0.15;
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
`;

const GradientHighlight = styled.span`
  color: #D710C1;
  font-weight: bold;
`;

const HeroButtons = styled(motion.div)`
  display: flex;
  gap: 20px;
  margin-top: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 8px 16px rgba(255, 215, 0, 0.2) !important;
  transition: all 0.3s ease !important;

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 20px rgba(255, 215, 0, 0.3) !important;
  }
`;

const GradientText = styled(motion.h1)`
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 4.5rem;
  margin-bottom: 24px;
  margin-top: 0px;
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
  max-width: 900px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.9);
  margin: 24px auto 48px;
  max-width: 800px;
  font-size: 1.5rem;
  line-height: 1.6;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0 20px;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16px;
  margin-top: 10px;
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const SectionDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 64px;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
`;

const BenefitCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 24px;
    path {
      fill: #D710C1;
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
  color: #D710C1;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const BenefitTitle = styled(Typography)`
  color: white;
  font-size: 1.5rem !important;
  font-weight: bold !important;
  margin-bottom: 16px;
`;

const BenefitDescription = styled(Typography)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.6;
`;

const StatsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
  padding: 40px 0;
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: 32px;
`;

const StatNumber = styled(Typography)`
  font-size: 3.5rem !important;
  font-weight: bold !important;
  color: #D710C1;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 2.5rem !important;
  }
`;

const StatLabel = styled(Typography)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ProcessSection = styled(Section)`
  background: linear-gradient(135deg, rgba(10, 25, 48, 0.98) 0%, rgba(22, 42, 74, 0.98) 100%);
`;

const ProcessStep = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  margin-bottom: 48px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
  }
`;

const StepNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #D710C1;
  margin-right: 24px;
  opacity: 0.8;

  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 16px;
  }
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled(Typography)`
  font-size: 1.5rem !important;
  font-weight: bold !important;
  color: white;
  margin-bottom: 12px;
`;

const StepDescription = styled(Typography)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.6;
`;

const CTAA = styled(motion.div)`
  text-align: center;
  margin-top: 48px;
`;

const benefits = [
  {
    icon: MonetizationOnIcon,
    title: 'Maximize Your Earnings',
    description: 'Earn competitive revenue shares from course sales. Top instructors earn substantial income through our platform.'
  },
  {
    icon: GroupsIcon,
    title: 'Reach Global Audience',
    description: 'Connect with learners worldwide. Our platform hosts thousands of active learners eager to master AI.'
  },
  {
    icon: SupportAgentIcon,
    title: 'Dedicated Support',
    description: 'Get personalized support from our instructor success team to create and promote your courses.'
  },
  {
    icon: BuildIcon,
    title: 'Professional Tools',
    description: 'Access state-of-the-art teaching tools, analytics, and course creation resources.'
  },
  {
    icon: PeopleIcon,
    title: 'Vibrant Community',
    description: 'Join a community of expert instructors. Collaborate, share insights, and grow together.'
  },
  {
    icon: TrendingUpIcon,
    title: 'Career Growth',
    description: 'Build your personal brand and establish yourself as an industry expert in AI education.'
  }
];

const stats = [
  { number: '500K+', label: 'Total Course Enrollments' },
  { number: '$2M+', label: 'Instructor Earnings' },
  { number: '150+', label: 'Countries Reached' },
  { number: '5/5', label: 'Average Course Rating' }
];

const steps = [
  {
    number: '01',
    title: 'Apply to Teach',
    description: 'Submit your application highlighting your expertise and course ideas. Our team reviews applications within 48 hours.'
  },
  {
    number: '02',
    title: 'Create Your Course',
    description: 'Use our comprehensive course creation tools and guidelines to build engaging content. Get support at every step.'
  },
  {
    number: '03',
    title: 'Review & Polish',
    description: 'Our expert team reviews your course and provides feedback to ensure the highest quality standards.'
  },
  {
    number: '04',
    title: 'Launch & Earn',
    description: 'Publish your course and start earning. Leverage our marketing tools to reach more users.'
  }
];

export const TeachPage: React.FC = () => {
  const [openContact, setOpenContact] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expertise: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenContact(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout title="Teach">
      <Helmet>
        <title>Teach on Adwin | Share Your AI Expertise</title>
        <meta name="description" content="Join Adwin as an instructor and share your AI expertise with learners worldwide. Earn competitive revenue and build your personal brand." />
      </Helmet>
      <PageWrapper>
        <HeroSection>
          <HeroBackground />
          <FloatingShape
            size={300}
            color="linear-gradient(45deg, #D710C1 0%, #FFA500 100%)"
            initial={{ x: -200, y: -200 }}
            animate={{ 
              x: [-200, -180, -200],
              y: [-200, -220, -200],
            }}
            transition={{
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut"
            }}
            style={{ top: "10%", left: "5%" }}
          />
          <FloatingShape
            size={200}
            color="linear-gradient(45deg, #FFA500 0%, #D710C1 100%)"
            initial={{ x: 200, y: 200 }}
            animate={{ 
              x: [200, 180, 200],
              y: [200, 220, 200],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }}
            style={{ bottom: "10%", right: "5%" }}
          />
          <Container maxWidth="lg">
            <HeroContent
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <GradientText
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Share Your AI Expertise
              </GradientText>
              <Subtitle
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Join our community of expert instructors and help shape the future of AI education.
                Reach learners worldwide and earn while making an impact.
                <br /><br />
                <GradientHighlight>Over $2M+ earned by instructors in 2023</GradientHighlight>
              </Subtitle>
              <HeroButtons
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <StyledButton
                  variant="contained"
                  size="large"
                  onClick={() => setOpenContact(true)}
                  sx={{ 
                    padding: '16px 48px', 
                    fontSize: '1.2rem',
                    background: 'linear-gradient(90deg, #D710C1 0%, #FFA500 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #D710C1 20%, #FFA500 120%)',
                    }
                  }}
                >
                  Start Teaching Today
                </StyledButton>
              </HeroButtons>
            </HeroContent>
          </Container>
        </HeroSection>

        <Section>
          <Container>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
            >
              <SectionTitle
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.5 }
                  }
                }}
              >
                Why Teach on Adwin?
              </SectionTitle>
              <SectionDescription
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.5, delay: 0.2 }
                  }
                }}
              >
                Join a platform that values expertise and supports instructor success.
                Benefit from our comprehensive tools and reach engaged learners.
              </SectionDescription>
              <Grid container spacing={4}>
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <BenefitCard
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                          transition: { duration: 0.5 }
                        }
                      }}
                    >
                      <IconWrapper>
                        <benefit.icon />
                      </IconWrapper>
                      <BenefitTitle>{benefit.title}</BenefitTitle>
                      <BenefitDescription>{benefit.description}</BenefitDescription>
                    </BenefitCard>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Container>
        </Section>

        <StatsSection>
          <Container>
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <StatCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <StatNumber>{stat.number}</StatNumber>
                    <StatLabel>{stat.label}</StatLabel>
                  </StatCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </StatsSection>

        <ProcessSection>
          <Container>
            <SectionTitle>How to Get Started</SectionTitle>
            <SectionDescription>
              Follow our simple process to begin your journey as an Adwin instructor
            </SectionDescription>
            {steps.map((step, index) => (
              <ProcessStep
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <StepNumber>{step.number}</StepNumber>
                <StepContent>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </StepContent>
              </ProcessStep>
            ))}
            <CTAA>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setOpenContact(true)}
                sx={{ 
                  padding: '16px 48px', 
                  fontSize: '1.2rem',
                  background: 'linear-gradient(90deg, #D710C1 0%, #FFA500 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #D710C1 20%, #FFA500 120%)',
                  }
                }}
              >
                Apply to Teach
              </Button>
            </CTAA>
          </Container>
        </ProcessSection>

        <Dialog
          open={openContact}
          onClose={() => setOpenContact(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            style: {
              background: '#f8fafc',
              padding: '40px',
              borderRadius: '24px'
            }
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              marginBottom: '24px',
              background: 'linear-gradient(90deg, #0a1930 0%, #162a4a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            Start Your Teaching Journey
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              marginBottom: '32px',
              color: '#4a5568',
              fontSize: '1.1rem'
            }}
          >
            Tell us about your expertise and what you'd like to teach. We'll get back to you within 48 hours.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              sx={{ marginBottom: '20px' }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              sx={{ marginBottom: '20px' }}
            />
            <TextField
              label="Area of Expertise"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              required
              fullWidth
              sx={{ marginBottom: '20px' }}
            />
            <TextField
              label="Tell us about your teaching experience and course ideas"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              sx={{ marginBottom: '32px' }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                padding: '16px',
                fontSize: '1.1rem',
                background: 'linear-gradient(90deg, #D710C1 0%, #FFA500 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #D710C1 20%, #FFA500 120%)',
                }
              }}
            >
              Submit Application
            </Button>
          </form>
        </Dialog>
      </PageWrapper>
    </Layout>
  );
}; 