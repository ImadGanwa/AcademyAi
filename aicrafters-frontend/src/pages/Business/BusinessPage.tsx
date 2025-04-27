import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Container, Grid, Dialog, TextField } from '@mui/material';
import { Button } from '../../components/common/Button/Button';
import { ReactComponent as AnalyticsIcon } from '../../assets/icons/Analytics.svg';
import { ReactComponent as CertificateIcon } from '../../assets/icons/Certificate.svg';
import { ReactComponent as CollaborationIcon } from '../../assets/icons/Collaboration.svg';
import { ReactComponent as CustomizationIcon } from '../../assets/icons/Customization.svg';
import { ReactComponent as SupportIcon } from '../../assets/icons/Support.svg';
import { ReactComponent as SecurityIcon } from '../../assets/icons/Security.svg';
import { motion } from 'framer-motion';
import { Layout } from '../../components/layout/Layout/Layout';
import { Helmet } from 'react-helmet-async';

const PageWrapper = styled.div`
  background: linear-gradient(135deg, #0a1930 0%, #162a4a 100%);
  color: white;
  position: relative;
  overflow: hidden;
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
`;

const Section = styled.section`
  padding: 100px 0;
  position: relative;
  overflow: hidden;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const HeroSection = styled(Section)`
  text-align: center;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(10, 25, 48, 0.97) 0%, rgba(22, 42, 74, 0.97) 100%);
  position: relative;
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const GradientText = styled(motion.h1)`
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 4.5rem;
  margin-bottom: 24px;
  margin-top: 6px;
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

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 24px;
    path {
      fill: #D710C1;
    }
  }
`;

const FeatureTitle = styled(Typography)`
  color: white;
  margin-bottom: 16px;
  font-weight: bold !important;
  font-size: 1.2rem !important;
`;

const FeatureDescription = styled(Typography)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.6;
`;

const StatsSection = styled(Section)`
  background: rgba(255, 255, 255, 0.02);
  padding: 10px 0;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 32px;
`;

const StatNumber = styled(Typography)`
  font-size: 3rem !important;
  font-weight: bold !important;
  color: #D710C1;
  margin-bottom: 8px;
`;

const StatLabel = styled(Typography)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
`;

const TestimonialSection = styled(Section)`
  background: linear-gradient(135deg, rgba(10, 25, 48, 0.98) 0%, rgba(22, 42, 74, 0.98) 100%);
  position: relative;
  
  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const TestimonialSlider = styled(motion.div)`
  overflow: hidden;
  position: relative;
  padding: 20px 0;
  
  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

const TestimonialTrack = styled(motion.div)`
  display: flex;
  gap: 24px;
  padding: 20px 0;

  @media (max-width: 768px) {
    gap: 16px;
    padding: 10px 0;
  }
`;

const TestimonialCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 40px;
  margin: 20px 0;
  text-align: left;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 0 0 calc(50% - 12px);
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    flex: 0 0 calc(100% - 32px);
    padding: 24px;
    margin: 10px 16px;
    border-radius: 16px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-5px);
  }
`;

const QuoteText = styled(Typography)`
  color: white;
  font-size: 1.25rem;
  font-style: italic;
  margin-bottom: 32px;
  line-height: 1.8;
  position: relative;
  padding-left: 24px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 24px;
    padding-left: 20px;
  }
  
  &:before {
    content: '"';
    position: absolute;
    left: -10px;
    top: -20px;
    font-size: 4rem;
    color: #D710C1;
    opacity: 0.5;
    font-family: Georgia, serif;

    @media (max-width: 768px) {
      font-size: 3rem;
      left: -8px;
      top: -15px;
    }
  }
`;

const Author = styled(Typography)`
  color: #D710C1;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
`;

const AuthorTitle = styled(Typography)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const SliderDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
`;

const Dot = styled.button<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? '#D710C1' : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#D710C1' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const TestimonialCTA = styled.div`
  text-align: center;
  margin-top: 60px;
`;

const ContactDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #f8fafc;
    padding: 48px;
    max-width: 600px;
    width: 100%;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .MuiBackdrop-root {
    background-color: rgba(10, 25, 48, 0.9);
  }
`;

const DialogTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: bold !important;
  margin-bottom: 16px;
  color: #0a1930;
  text-align: center;
  background: linear-gradient(90deg, #0a1930 0%, #162a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
`;

const DialogSubtitle = styled(Typography)`
  color: #4a5568;
  text-align: center;
  margin-bottom: 48px;
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 440px;
  margin-left: auto;
  margin-right: auto;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 32px;
`;

const StyledTextField = styled(TextField)`
  .MuiInputBase-root {
    color: #0a1930;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .MuiOutlinedInput-root {
    transition: all 0.3s ease;

    fieldset {
      border-color: rgba(10, 25, 48, 0.1);
    }

    &:hover fieldset {
      border-color: rgba(10, 25, 48, 0.3);
    }

    &.Mui-focused fieldset {
      border-color: #D710C1;
      border-width: 2px;
    }
  }

  .MuiInputLabel-root {
    color: #4a5568;
    font-weight: 500;

    &.Mui-focused {
      color: #0a1930;
    }
  }

  .MuiInputBase-input {
    padding: 16px 20px;
    
    &::placeholder {
      color: #a0aec0;
    }
  }
`;

const SubmitButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  width: auto;
  min-width: 200px;

  &:hover {
    background: linear-gradient(90deg, #D710C1 20%, #FFA500 120%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16px;
  margin-top: 0px;
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 64px;
`;

const features = [
  {
    icon: AnalyticsIcon,
    title: 'Advanced Analytics',
    description: "Track your team's progress with detailed analytics and performance metrics. Get insights into learning patterns and outcomes."
  },
  {
    icon: CertificateIcon,
    title: 'Certified Courses',
    description: "Access high-quality, industry-recognized AI and technology courses designed for professional development."
  },
  {
    icon: CollaborationIcon,
    title: 'Team Collaboration',
    description: "Foster team learning with collaborative features, group projects, and shared learning spaces."
  },
  {
    icon: CustomizationIcon,
    title: 'Customized Learning',
    description: "Tailor the learning experience to your organization's specific needs with customizable learning paths."
  },
  {
    icon: SupportIcon,
    title: 'Dedicated Support',
    description: "Get priority support and dedicated account management for your team's learning journey."
  },
  {
    icon: SecurityIcon,
    title: 'Enterprise Security',
    description: "Ensure your data is protected with enterprise-grade security and compliance measures."
  }
];

const stats = [
  { number: '50+', label: 'Enterprise Clients' },
  { number: '1000+', label: 'Active Learners' },
  { number: '95%', label: 'Satisfaction Rate' },
  { number: '200+', label: 'AI Courses' }
];

const testimonials = [
  {
    quote: "Adwin has transformed how our team learns and implements AI solutions. The platform's practical approach and expert-led courses have accelerated our AI adoption journey.",
    author: "Sarah Chen",
    title: "CTO, TechVision Inc."
  },
  {
    quote: "The customized learning paths and enterprise features have made it easy to manage our team's professional development. The results have been outstanding.",
    author: "Michael Rodriguez",
    title: "Head of Engineering, DataFlow Systems"
  },
  {
    quote: "Since implementing Adwin, we've seen a 40% increase in our team's AI project success rate. The platform's comprehensive curriculum and hands-on approach make complex concepts accessible.",
    author: "Emma Thompson",
    title: "Director of Innovation, FutureScale Technologies"
  },
  {
    quote: "The enterprise-grade security features and dedicated support team have made Adwin an invaluable partner in our organization's AI transformation journey.",
    author: "David Park",
    title: "VP of Technology, GlobalTech Solutions"
  }
];

export const BusinessPage: React.FC = () => {
  const [openContact, setOpenContact] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Enhanced SEO data
  const pageTitle = "Enterprise AI Learning Solutions | Adwin Business";
  const pageDescription = "Transform your team with enterprise-grade AI learning solutions. Access certified courses, advanced analytics, and dedicated support for professional development.";
  const canonicalUrl = "https://Adwin.com/business";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Adwin",
    "url": "https://Adwin.com",
    "logo": "https://Adwin.com/images/logo.png",
    "sameAs": [
      "https://twitter.com/Adwin",
      "https://linkedin.com/company/Adwin"
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Adwin Enterprise",
    "description": pageDescription,
    "brand": {
      "@type": "Brand",
      "name": "Adwin"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": "Custom",
      "priceCurrency": "USD",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "seller": {
        "@type": "Organization",
        "name": "Adwin"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "50"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What enterprise features does Adwin offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Adwin offers advanced analytics, certified courses, team collaboration tools, customized learning paths, dedicated support, and enterprise-grade security features."
        }
      },
      {
        "@type": "Question",
        "name": "How does Adwin support enterprise teams?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We provide dedicated account management, priority support, customizable learning paths, and detailed analytics to track team progress and performance."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://Adwin.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Business",
        "item": "https://Adwin.com/business"
      }
    ]
  };

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
    <Layout title="Business">
      <Helmet>
        <html lang="en" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Adwin" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://Adwin.com/images/business-og.jpg" />
        <meta property="og:site_name" content="Adwin" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@Adwin" />
        <meta name="twitter:creator" content="@Adwin" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://Adwin.com/images/business-og.jpg" />
        
        {/* Other Meta Tags */}
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content="AI learning, enterprise training, professional development, team learning, AI courses, corporate training, enterprise AI solutions, business AI training" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <PageWrapper>
        <HeroSection>
          <FloatingElement
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ top: '10%', left: '10%' }}
          />
          <FloatingElement
            animate={{
              x: [0, -70, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ top: '20%', right: '15%' }}
          />
          <FloatingElement
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ bottom: '15%', left: '20%' }}
          />
          <Container>
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
                Transform Your Team with AI Learning
              </GradientText>
              <Subtitle
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Empower your workforce with cutting-edge AI education. Join leading companies 
                who trust Adwin for their team's professional development.
              </Subtitle>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
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
                  Contact Our Team
                </Button>
              </motion.div>
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
                Enterprise Features
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
                Discover how our comprehensive suite of features can transform your team's AI learning journey. 
                From advanced analytics to enterprise security, we provide everything you need for success.
              </SectionDescription>
              <Grid container spacing={4}>
                {features.map((feature, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <FeatureCard
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                          transition: { duration: 0.5 }
                        }
                      }}
                    >
                      <feature.icon />
                      <FeatureTitle>{feature.title}</FeatureTitle>
                      <FeatureDescription>{feature.description}</FeatureDescription>
                    </FeatureCard>
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
                  <StatCard>
                    <StatNumber>{stat.number}</StatNumber>
                    <StatLabel>{stat.label}</StatLabel>
                  </StatCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </StatsSection>

        <TestimonialSection>
          <Container maxWidth="lg">
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
                Success Stories
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
                Discover how leading companies are transforming their teams with Adwin. 
                Our enterprise solutions have helped organizations across industries achieve their AI learning goals.
              </SectionDescription>
              
              <TestimonialSlider>
                <TestimonialTrack
                  drag="x"
                  dragConstraints={{ 
                    left: window.innerWidth < 768 ? -1600 : -1200, 
                    right: 0 
                  }}
                  initial={{ x: 0 }}
                  animate={{ 
                    x: window.innerWidth < 768 ? [-1600, 0] : [-1200, 0] 
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: window.innerWidth < 768 ? 30 : 40,
                      ease: "linear"
                    }
                  }}
                >
                  {testimonials.map((testimonial, index) => (
                    <TestimonialCard
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      whileHover={{ y: -5 }}
                    >
                      <QuoteText>{testimonial.quote}</QuoteText>
                      <Author>{testimonial.author}</Author>
                      <AuthorTitle>{testimonial.title}</AuthorTitle>
                    </TestimonialCard>
                  ))}
                </TestimonialTrack>
              </TestimonialSlider>

              <TestimonialCTA>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setOpenContact(true)}
                  sx={{ 
                    padding: { xs: '14px 32px', md: '16px 48px' },
                    fontSize: { xs: '1.1rem', md: '1.2rem' },
                    background: 'linear-gradient(90deg, #D710C1 0%, #FFA500 100%)',
                    marginTop: { xs: '32px', md: '40px' },
                    '&:hover': {
                      background: 'linear-gradient(90deg, #D710C1 20%, #FFA500 120%)',
                    }
                  }}
                >
                  Join These Success Stories
                </Button>
              </TestimonialCTA>
            </motion.div>
          </Container>
        </TestimonialSection>

        <ContactDialog
          open={openContact}
          onClose={() => setOpenContact(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Contact Our Team</DialogTitle>
          <DialogSubtitle>
            Tell us about your team's needs and we'll get back to you within 24 hours
          </DialogSubtitle>
          <FormContainer onSubmit={handleSubmit}>
            <StyledTextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Your full name"
            />
            <StyledTextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              placeholder="your@email.com"
            />
            <StyledTextField
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Your company name"
            />
            <StyledTextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Tell us about your team's learning goals..."
            />
            <SubmitButtonContainer>
              <SubmitButton
                type="submit"
                variant="contained"
                sx={{
                  fontSize: '1.2rem',
                  padding: '16px 48px',
                  background: 'linear-gradient(90deg, #D710C1 0%, #FFA500 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #D710C1 20%, #FFA500 120%)',
                  }
                }}
              >
                Send Message
              </SubmitButton>
            </SubmitButtonContainer>
          </FormContainer>
        </ContactDialog>
      </PageWrapper>
    </Layout>
  );
}; 