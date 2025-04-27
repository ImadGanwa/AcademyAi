import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Container, Grid, TextField, Paper, Box, Snackbar, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Layout } from '../../components/layout/Layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/common/Button/Button';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PageWrapper = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #0a1930 0%, #162a4a 100%);
  position: relative;
  color: white;
  padding: 120px 0;
  text-align: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at bottom, rgba(255, 215, 0, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const HeroContainer = styled(Container)`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px !important;
`;

const SectionTitle = styled(Typography)`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 32px;
  background: linear-gradient(90deg, #D710C1 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`;

const SectionDescription = styled(motion.p)`
  text-align: center;
  font-size: 1.25rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 20px auto 64px;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }
`;

const ContentSection = styled.section`
  padding: 80px 0;
  background-color: #ffffff;
`;

const ContactFormSection = styled(Paper)`
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  margin-bottom: 80px;

  @media (max-width: 768px) {
    padding: 32px;
  }
`;

const ContactInfoCard = styled(motion.div)`
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 16px;
  padding: 40px 30px;
  height: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 20px rgba(10, 25, 48, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0a1930, #162a4a);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(10, 25, 48, 0.1);

    &::before {
      opacity: 1;
    }
  }
`;

const ContactIcon = styled.div`
  margin-bottom: 24px;
  background: linear-gradient(135deg, #0a1930 0%, #162a4a 100%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(10, 25, 48, 0.1);
  transition: transform 0.3s ease;

  ${ContactInfoCard}:hover & {
    transform: scale(1.1);
  }

  svg {
    color: #D710C1;
    font-size: 32px;
    transition: transform 0.3s ease;
  }
`;

const ContactTitle = styled(Typography)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0a1930;
  position: relative;
  padding-bottom: 8px !important;
  margin-bottom: 12px !important;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #D710C1, #FFA500);
  }
`;

interface ContactLabelProps {
  mt?: number;
}

const ContactLabel = styled.div<ContactLabelProps>`
  color: #0a1930;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-top: ${props => props.mt ? `${props.mt * 8}px` : '0'};
`;

const ContactText = styled(Typography)`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.8;
  margin-top: auto;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #0a1930;
    }
  }
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 24px;
  
  .MuiOutlinedInput-root {
    border-radius: 8px;
    
    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #0a1930;
    }
  }
  
  .MuiOutlinedInput-notchedOutline {
    transition: border-color 0.3s ease;
  }
  
  .Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #0a1930 !important;
    border-width: 2px;
  }
  
  .MuiInputLabel-root.Mui-focused {
    color: #0a1930;
  }
`;

const FormTitle = styled(Typography)`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #0a1930;
`;

const SubmitButton = styled(Button)`
  margin-top: 16px;
  padding: 12px 32px !important;
  font-size: 1.2rem !important;
  background: linear-gradient(90deg, #0a1930 0%, #162a4a 100%);
  border-radius: 8px;
  color: white;
  
  &:hover {
    background: linear-gradient(90deg, #162a4a 0%, #0a1930 100%);
  }

  svg {
    margin-left: 8px;
  }
`;

const FAQSection = styled.section`
  padding: 80px 0;
  background: linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%);
`;

const FAQTitle = styled(Typography)`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 48px;
  color: #0a1930;
  text-align: center;
  position: relative;
  padding-bottom: 16px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #D710C1, #FFA500);
  }
`;

const StyledAccordion = styled(Accordion)`
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 12px !important;
  margin-bottom: 16px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease !important;

  &:before {
    display: none;
  }

  &.Mui-expanded {
    margin: 16px 0 !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  }

  .MuiAccordionSummary-root {
    border-radius: 12px;
    padding: 0 24px;
    min-height: 64px;

    &.Mui-expanded {
      background: linear-gradient(90deg, #0a1930 0%, #162a4a 100%);
      color: white;
    }

    .MuiAccordionSummary-expandIconWrapper {
      color: inherit;
      transform: rotate(0deg);
      transition: transform 0.3s ease;

      &.Mui-expanded {
        transform: rotate(180deg);
      }
    }
  }

  .MuiAccordionDetails-root {
    padding: 24px;
    background: white;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would usually send the data to your backend
    setSnackbar({
      open: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      severity: 'success'
    });
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Layout title="Contact Us">
      <Helmet>
        <title>Contact Us | Adwin</title>
        <meta name="description" content="Get in touch with the Adwin team for any questions, support, or partnership inquiries." />
      </Helmet>
      <PageWrapper>
        <HeroSection>
          <HeroContainer>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <SectionTitle variant="h1">Contact Us</SectionTitle>
              <SectionDescription
                color="white"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.5, delay: 0.2 }
                  }
                }}
              >
                Have questions or need assistance? Our team is here to help you with anything related to AI learning on our platform.
              </SectionDescription>
            </motion.div>
          </HeroContainer>
        </HeroSection>

        <ContentSection>
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <ContactInfoCard>
                    <ContactIcon>
                      <LocationOnIcon />
                    </ContactIcon>
                    <ContactTitle variant="h6">Our Location</ContactTitle>
                    <ContactText>
                      123 AI Innovation Center<br />
                      Tech District, Casablanca<br />
                      Morocco
                    </ContactText>
                  </ContactInfoCard>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <ContactInfoCard>
                    <ContactIcon>
                      <EmailIcon />
                    </ContactIcon>
                    <ContactTitle variant="h6">Email Us</ContactTitle>
                    <ContactText>
                      <Box sx={{
                        color: '#0a1930',
                        fontWeight: 600,
                        marginBottom: 1,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block'
                      }}>
                        General Inquiries:
                      </Box>
                      <a href="mailto:hello@Adwin.com">hello@Adwin.com</a>
                      <Box sx={{
                        color: '#0a1930',
                        fontWeight: 600,
                        marginBottom: 1,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        marginTop: 3
                      }}>
                        Support:
                      </Box>
                      <a href="mailto:support@Adwin.com">support@Adwin.com</a>
                    </ContactText>
                  </ContactInfoCard>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <ContactInfoCard>
                    <ContactIcon>
                      <PhoneIcon />
                    </ContactIcon>
                    <ContactTitle variant="h6">Call Us</ContactTitle>
                    <ContactText>
                      <Box sx={{
                        color: '#0a1930',
                        fontWeight: 600,
                        marginBottom: 1,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block'
                      }}>
                        Main Office:
                      </Box>
                      <a href="tel:+212522123456">+212 522 123 456</a>
                      <Box sx={{
                        color: '#0a1930',
                        fontWeight: 600,
                        marginBottom: 1,
                        fontSize: '0.95rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        marginTop: 3
                      }}>
                        Support Hotline:
                      </Box>
                      <a href="tel:+212522789012">+212 522 789 012</a>
                    </ContactText>
                  </ContactInfoCard>
                </motion.div>
              </Grid>
            </Grid>

            <Grid container spacing={6} sx={{ mt: 4 }}>
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <ContactFormSection elevation={0}>
                    <SectionTitle variant="h3">Send Us a Message</SectionTitle>
                    <SectionDescription
                    color="textSecondary"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.5, delay: 0.2 }
                  }
                }}
              >
                      Fill out the form below and we'll get back to you as soon as possible.
                    </SectionDescription>
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <StyledTextField
                            fullWidth
                            label="Your Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <StyledTextField
                            fullWidth
                            label="Your Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Your Message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            multiline
                            rows={6}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <SubmitButton
                            type="submit"
                            variant="contained"
                            fullWidth
                          >
                            Send Message <SendIcon />
                          </SubmitButton>
                        </Grid>
                      </Grid>
                    </form>
                  </ContactFormSection>
                </motion.div>
              </Grid>
            </Grid>

            <FAQSection>
              <Container maxWidth="md">
                <SectionTitle variant="h4">
                  Frequently Asked Questions
                </SectionTitle>
                <SectionDescription
                color="textSecondary"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.5, delay: 0.2 }
                  }
                }}
              >
                  We've compiled a list of common questions and answers to help you get started with Adwin.
                </SectionDescription>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {[
                    {
                      question: "How can I start learning on Adwin?",
                      answer: "Getting started is easy! Simply create an account, browse our course catalog, and enroll in any course that interests you. You can track your progress in your dashboard."
                    },
                    {
                      question: "Do you offer corporate training programs?",
                      answer: "Yes, we provide customized AI training programs for organizations of all sizes. Contact our business team at business@Adwin.com for more information."
                    },
                    {
                      question: "Can I become an instructor on Adwin?",
                      answer: "Absolutely! We're always looking for expert instructors. Visit our 'Teach' page to apply and learn about our instructor program."
                    },
                    {
                      question: "What payment methods do you accept?",
                      answer: "We accept major credit cards, PayPal, and bank transfers for course purchases. All transactions are secure and protected."
                    }
                  ].map((faq, index) => (
                    <StyledAccordion key={index}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`faq-content-${index}`}
                        id={`faq-header-${index}`}
                      >
                        <Typography variant="h6" fontWeight={600}>
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </StyledAccordion>
                  ))}
                </motion.div>
              </Container>
            </FAQSection>

          </Container>
        </ContentSection>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PageWrapper>
    </Layout>
  );
};

export default ContactPage; 