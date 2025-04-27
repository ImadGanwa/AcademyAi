import React from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Container, Grid, Typography } from '@mui/material';
import { Layout } from '../../components/layout/Layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/common/Button/Button';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import HistoryIcon from '@mui/icons-material/History';
import { useTranslation } from 'react-i18next';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0a1930 0%, #162a4a 100%);
  color: white;
  overflow: hidden;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 100px 0;
`;

const ParallaxBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`;

const Star = styled(motion.div)<{ size: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: white;
  border-radius: 50%;
  opacity: 0.5;
  will-change: transform, opacity;
`;

const GlowingOrb = styled(motion.div)`
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0) 70%);
  border-radius: 50%;
  filter: blur(30px);
  will-change: transform, opacity;
`;

const HeroContent = styled(motion.div)`
  text-align: center;
  position: relative;
  z-index: 2;
`;

const GradientTitle = styled(motion.h1)`
  font-size: 5rem;
  font-weight: bold;
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;
  margin-top: 0px;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin: 0 auto 48px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0 20px;
  }
`;

const Section = styled.section`
  padding: 100px 0;
  position: relative;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const MissionSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  overflow: hidden;
`;

const CircuitBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: linear-gradient(90deg, rgba(255,215,0,0.1) 1px, transparent 1px),
                    linear-gradient(0deg, rgba(255,215,0,0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  transform: skew(-10deg);
`;

const ValueCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 24px;
  padding: 40px;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 215, 0, 0.3);
  }

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 24px;
    color: #D710C1;
  }
`;

const TimelineSection = styled(Section)`
  background: linear-gradient(135deg, rgba(10, 25, 48, 0.97) 0%, rgba(22, 42, 74, 0.97) 100%);
  position: relative;
  overflow: hidden;
`;

const TimelineContainer = styled(Container)`
  position: relative;
  z-index: 2;
`;

const TimelineHeader = styled.div`
  text-align: center;
  max-width: 1000px;
  margin: 0 auto 100px;
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled(Typography)`
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 32px;
  text-align: center;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 24px;
  }
`;

const SectionDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 20px auto 64px;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }

  & span {
    color: #D710C1;
    font-weight: bold;
  }
`;

const TimelineItem = styled(motion.div)`
  display: flex;
  margin-bottom: 48px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 48px;
    bottom: -48px;
    width: 2px;
    background: rgba(255, 215, 0, 0.3);
  }

  &:last-child::before {
    display: none;
  }
`;

const TimelineIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(45deg, #D710C1, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  flex-shrink: 0;

  svg {
    color: white;
    width: 28px;
    height: 28px;
  }
`;

const TimelineContent = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
`;

const TimelineImageContainer = styled(motion.div)`
  position: absolute;
  top: 50%;
  right: -5%;
  transform: ${`translateY(-50%)`};
  width: 500px;
  height: 500px;
  z-index: 1;
  opacity: 0.08;
  pointer-events: none;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const TimelineImage = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  border-radius: 30px;
  filter: grayscale(100%) contrast(1.1);
`;

const TimelineImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, transparent 30%, #0a1930 100%);
  mix-blend-mode: multiply;
`;

const TimelinePattern = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background-image: ${`radial-gradient(circle at 2px 2px, #D710C119 2px, transparent 0)`};
  background-size: 24px 24px;
  transform: ${`rotate(15deg)`};
  opacity: 0.3;
`;

const TimelineWrapper = styled.div`
  position: relative;
  max-width: 800px;
`;

const StatsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
  padding: 40px 0;
`;

const StatCard = styled(motion.div)`
  text-align: center;
  padding: 32px;
`;

const StatNumber = styled(motion.div)`
  font-size: 3.5rem;
  font-weight: bold;
  color: #D710C1;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const TeamSection = styled(Section)`
  position: relative;
`;

const TeamGrid = styled(Grid)`
  position: relative;
  z-index: 2;
`;

const TeamMember = styled(motion.div)`
  text-align: center;
  margin-bottom: 48px;
`;

const MemberImage = styled(motion.div)<{ imageUrl: string }>`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 0 auto 24px;
  background: ${props => `url(${props.imageUrl})`};
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  border: 3px solid #D710C1;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 215, 0, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const CTAA = styled(motion.div)`
  text-align: center;
  margin-top: 64px;
`;

const values = [
  {
    icon: RocketLaunchIcon,
    title: 'Innovation First',
    description: 'Pushing the boundaries of AI education with cutting-edge courses and learning methods.'
  },
  {
    icon: SchoolIcon,
    title: 'Quality Education',
    description: 'Delivering comprehensive, practical, and industry-relevant AI training.'
  },
  {
    icon: GroupsIcon,
    title: 'Community Driven',
    description: 'Building a supportive ecosystem of learners, instructors, and AI enthusiasts.'
  }
];

const timeline = [
  {
    year: '2021',
    title: 'The Beginning',
    description: 'Adwin was founded with a vision to democratize AI education.'
  },
  {
    year: '2022',
    title: 'Rapid Growth',
    description: 'Expanded our course catalog and reached learners in over 150 countries.'
  },
  {
    year: '2023',
    title: 'Community Milestone',
    description: 'Celebrated 500K+ course enrollments and $2M+ instructor earnings.'
  },
  {
    year: '2024',
    title: 'Innovation Hub',
    description: 'Launched advanced learning features and AI-powered personalization.'
  }
];

const stats = [
  { number: '500K+', label: 'Active Learners' },
  { number: '200+', label: 'Expert Instructors' },
  { number: '1000+', label: 'Hours of Content' },
  { number: '98%', label: 'Satisfaction Rate' }
];

const team = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Founder & CEO',
    expertise: 'AI Research & Education',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2376&auto=format&fit=crop'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Head of Education',
    expertise: 'Machine Learning',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2494&auto=format&fit=crop'
  },
  {
    name: 'Emma Thompson',
    role: 'Community Director',
    expertise: 'EdTech & AI Ethics',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2522&auto=format&fit=crop'
  },
  {
    name: 'David Kim',
    role: 'Technical Lead',
    expertise: 'Deep Learning & MLOps',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2487&auto=format&fit=crop'
  }
];

export const AboutPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const generateStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 2 + 3
    }));
  };

  const stars = generateStars(40);

  return (
    <Layout title="About">
      <Helmet>
        <title>About Adwin | Our Story & Mission</title>
        <meta name="description" content="Learn about Adwin' mission to democratize AI education, our values, and the team behind the platform." />
      </Helmet>
      <PageWrapper>
        <HeroSection>
          <ParallaxBackground>
            {stars.map(star => (
              <Star
                key={star.id}
                size={star.size}
                style={{ 
                  left: `${star.x}%`, 
                  top: `${star.y}%`,
                  opacity: 0.5
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1
                }}
              />
            ))}
            <GlowingOrb
              style={{ top: '20%', right: '20%' }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </ParallaxBackground>
          <Container>
            <HeroContent>
              <GradientTitle
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Crafting the Future of AI Education
              </GradientTitle>
              <Subtitle
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                We're on a mission to democratize AI education by connecting passionate instructors
                with eager learners worldwide. Join us in shaping the future of technology education.
              </Subtitle>
              <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
            >
              <Grid container spacing={4}>
                {values.map((value, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <ValueCard
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                          transition: { duration: 0.5 }
                        }
                      }}
                    >
                      <value.icon />
                      <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                        {value.title}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {value.description}
                      </Typography>
                    </ValueCard>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
            </HeroContent>
          </Container>
        </HeroSection>

        <TimelineSection>
          <TimelinePattern />
          <TimelineContainer>
            <TimelineHeader>
              <SectionTitle variant="h2">
                Our Journey
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
                From our humble beginnings to becoming a <span>leading AI education platform</span>, 
                every step of our journey has been driven by our commitment to making AI education 
                accessible, practical, and transformative. Here's how we've <span>grown and evolved</span> over the years.
              </SectionDescription>
            </TimelineHeader>

            <TimelineImageContainer
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 0.08, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <TimelineImage />
            </TimelineImageContainer>

            <TimelineWrapper>
              {timeline.map((item, index) => (
                <TimelineItem
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <TimelineIconWrapper>
                    <HistoryIcon />
                  </TimelineIconWrapper>
                  <TimelineContent>
                    <Typography variant="h6" sx={{ color: '#D710C1', mb: 1, fontWeight: 'bold' }}>
                      {item.year}
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1.1rem',
                      lineHeight: '1.8'
                    }}>
                      {item.description}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </TimelineWrapper>
          </TimelineContainer>
        </TimelineSection>

        <StatsSection>
          <Container>
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <StatCard
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <StatNumber>{stat.number}</StatNumber>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {stat.label}
                    </Typography>
                  </StatCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </StatsSection>

        <TeamSection>
          <Container>
            <SectionTitle variant="h2">
              Meet Our Team
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
                Meet the team behind Adwin, who are dedicated to making AI education accessible and transformative for everyone.
              </SectionDescription>
            <TeamGrid container spacing={4}>
              {team.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <TeamMember
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <MemberImage
                      imageUrl={member.image}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <Typography variant="h6" sx={{ 
                      color: 'white', 
                      mb: 1,
                      fontWeight: 600,
                      fontSize: '1.25rem'
                    }}>
                      {member.name}
                    </Typography>
                    <Typography sx={{ 
                      color: '#D710C1', 
                      mb: 1,
                      fontWeight: 500,
                      fontSize: '1.1rem'
                    }}>
                      {member.role}
                    </Typography>
                    <Typography sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '1rem',
                      lineHeight: 1.6
                    }}>
                      {member.expertise}
                    </Typography>
                  </TeamMember>
                </Grid>
              ))}
            </TeamGrid>
            <CTAA
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  padding: '16px 48px',
                  fontSize: '1.2rem',
                  background: 'linear-gradient(90deg, #D710C1 0%, #FFA500 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #D710C1 20%, #FFA500 120%)',
                  }
                }}
                onClick={() => window.location.href = `/${currentLanguage}`}
              >
                Explore Our Courses
              </Button>
            </CTAA>
          </Container>
        </TeamSection>
      </PageWrapper>
    </Layout>
  );
}; 