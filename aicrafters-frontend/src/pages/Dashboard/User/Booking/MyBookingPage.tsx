import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Box, Button, Dialog, CircularProgress,
  Avatar, Container, Stack, Alert, Divider
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerIcon from '@mui/icons-material/Timer';
import VideocamIcon from '@mui/icons-material/Videocam';
import AddIcon from '@mui/icons-material/Add';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Components
import { Layout } from '../../../../components/layout/Layout/Layout';
import { BookingHero } from '../../../../components/layout/Booking/BookingHero';
import { useTranslation } from 'react-i18next';
import { getUserBookings } from '../../../../api/booking'; 
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../../assets/styles/theme';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const ContentSection = styled.section`
  padding-bottom: 50px;
  position: relative;
  margin-top: 50px;

  @media (max-width: 768px) {
    padding-bottom: 100px;
    margin-top: 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const BookingSection = styled.div`
  /* Removed card styling - now just a container */
  /* background: white; */
  /* border-radius: 12px; */
  /* padding: 24px; */
  /* margin-bottom: 16px; */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */

  @media (max-width: 768px) {
    /* background: transparent; */
    /* padding: 0; */
    /* box-shadow: none; */
    /* border-radius: 0; */
    /* margin-bottom: 0; */
  }
`;

const BookingCard = styled(motion.div)<{ $status?: string }>`
  background: white;
  border-radius: 12px;
  margin-bottom: 32px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #E8ECEF;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    border-radius: 16px;
    margin-bottom: 16px;
    border: none;
  }
`;

const CardHeader = styled(Box)`
  padding: 24px;
  border-bottom: 1px solid #E8ECEF;
  background-color: #FAFBFC;

  @media (max-width: 768px) {
    padding: 20px 16px;
    background-color: white;
  }
`;

const MentorInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const MentorAvatar = styled(Avatar)`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6D4794 0%, #D710C1 100%);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
`;

const MentorDetails = styled(Box)`
  flex: 1;
`;

const MentorName = styled(Typography)`
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1.1rem;
  margin-bottom: 2px;
`;

const MentorTitle = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
`;

const StatusChip = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  background-color: ${props => {
    switch (props.$status) {
      case 'scheduled': 
      case 'pending': return '#FEF3C7';
      case 'completed': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      case 'no-show': return '#FED7AA';
      default: return '#FEF3C7';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'scheduled':
      case 'pending': return '#92400E';
      case 'completed': return '#065F46';
      case 'cancelled': return '#991B1B';
      case 'no-show': return '#9A3412';
      default: return '#92400E';
    }
  }};
`;

const StyledIconWrapper = styled(Box)`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => theme.palette.primary.main};
    border-radius: 8px;
    padding: 8px;
    min-width: 40px;
    height: 40px;
    svg {
      fill: white;
      color: white;
      font-size: 20px;
    }
  }
`;

const CardContent = styled(Box)`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const BookingTopic = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 16px;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;
`;

const BookingDetails = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 20px;
  border-radius: 8px;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: transparent;
    padding: 0;
    margin-bottom: 16px;
  }
`;

const DetailItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
  
  & > svg:not(.mobile-icon-wrapper svg) {
    color: ${({ theme }) => theme.palette.primary.main};
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    background: #F8F9FA;
    border: 1px solid #E8ECEF;
    border-radius: 12px;
    padding: 16px;
    gap: 12px;

    & > svg:not(.mobile-icon-wrapper svg) {
      display: none;
    }
  }
`;

const ActionButtons = styled(Box)`
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 20px;
  text-transform: none;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(ActionButton)`
  background: linear-gradient(135deg, #6D4794 0%, #D710C1 100%);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #5a3a7a 0%, #b0009c 100%);
    transform: translateY(-1px);
  }
  &:active {
    transform: scale(0.98) translateY(0px);
    background: linear-gradient(135deg, #50306f 0%, #a0008c 100%);
  }
`;

const SecondaryButton = styled(ActionButton)`
  border: 2px solid #e5e7eb;
  color: ${({ theme }) => theme.palette.text.primary};
  background: white;
  
  &:hover {
    background: #f9fafb;
    border-color: ${({ theme }) => theme.palette.primary.main};
    color: ${({ theme }) => theme.palette.primary.main};
    transform: translateY(-1px);
  }
  &:active {
    transform: scale(0.98) translateY(0px);
    background: #f0f0f0;
    border-color: ${({ theme }) => theme.palette.primary.dark};
  }
`;

const NoBookingsContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 60px 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    border-radius: 16px;
    margin: 0 16px;
    padding: 40px 24px;
  }
`;

const IllustrationContainer = styled(motion.div)`
  margin-bottom: 24px;
  color: #6D4794;
  opacity: 0.7;
  
  svg {
    font-size: 4rem;
  }
`;

const LoadingContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
`;

const ConfirmationDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    padding: 0;
    max-width: 600px;
    width: 100%;
    background-color: #ffffff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    overflow: hidden;
  }
`;

const DialogHeader = styled(Box)`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DialogTitleStyled = styled(Typography)`
  font-weight: 600;
  font-size: 1.25rem;
`;

const DialogContentStyled = styled(Box)`
  padding: 24px;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const MyBookingPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { t, i18n } = useTranslation('translation');
  const navigate = useNavigate();
  const currentLanguage = i18n.language;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getUserBookings();
        if (response && response.data && response.data.bookings) {
          setBookings(response.data.bookings);
        } else {
          console.error("Unexpected API response structure:", response);
          setError("Received an unexpected response from the server.");
          setBookings([]);
        }
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please check your connection and try again.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleOpenDetails = useCallback((booking: any) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => setOpenDialog(false), []);

  const handleZoomLink = useCallback((bookingToOpen?: any) => {
    const booking = bookingToOpen || selectedBooking;
    if (booking && booking.meetingLink) {
      window.open(booking.meetingLink, '_blank', 'noopener,noreferrer');
    }
  }, [selectedBooking]);

  const handleAddToCalendar = useCallback(() => {
    if (!selectedBooking) return;
    const mentorName = selectedBooking.mentorId?.fullName || selectedBooking.mentorName || t('mentor.booking.unknownMentor', 'your mentor') as string;
    const startDateTime = `${selectedBooking.date}T${selectedBooking.startTime}:00`;
    const endDateTime = `${selectedBooking.date}T${selectedBooking.endTime}:00`;
    const calendarTitle = t('mentor.booking.calendarTitle', 'Mentorship: {{topic}} with {{mentorName}}', { 
      topic: selectedBooking.topic, 
      mentorName 
    }) as string;
    const calendarDetails = t('mentor.booking.calendarDetails', 'Topic: {{topic}}\nJoin here: {{meetingLink}}', { 
      topic: selectedBooking.topic, 
      meetingLink: selectedBooking.meetingLink || 'Online' 
    }) as string;
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarTitle)}&details=${encodeURIComponent(calendarDetails)}&location=${encodeURIComponent(selectedBooking.meetingLink || 'Online Meeting')}&dates=${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}`;
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  }, [selectedBooking, t]);

  const handleFindMentor = useCallback(() => navigate(`/${currentLanguage}/mentorship`), [navigate, currentLanguage]);

  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return t('mentor.booking.dateNotSpecified', 'Date not specified') as string;
    try {
      return new Date(dateString).toLocaleDateString(
        currentLanguage === 'fr' ? 'fr-FR' : 'en-US', 
        { day: 'numeric', month: 'long', year: 'numeric' }
      );
    } catch { return t('mentor.booking.invalidDateFormat', 'Invalid date') as string; }
  }, [currentLanguage, t]);

  const formatTime = useCallback((timeString: string | undefined, scheduledAt?: string): string => {
    if (!timeString && scheduledAt) {
      try {
        const date = new Date(scheduledAt);
        if (!isNaN(date.getTime())) timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } catch {}
    }
    if (!timeString) return t('mentor.booking.timeNotSpecified', 'Time not specified') as string;
    
    const locale = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
    try {
        const date = new Date(`1970-01-01T${timeString}`);
        if (isNaN(date.getTime())) throw new Error("Invalid time for Date constructor");
        return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric', hour12: locale !== 'fr-FR' }).format(date);
    } catch {
        const parts = timeString.split(':');
        if (parts.length === 2) {
            const hourInt = parseInt(parts[0]);
            const minute = parts[1];
            if (!isNaN(hourInt) && minute.length === 2 && !isNaN(parseInt(minute))) {
                 if (locale === 'fr-FR') return timeString;
                 return `${hourInt % 12 || 12}:${minute}${hourInt >= 12 ? ' PM' : ' AM'}`;
            }
        }
        return t('mentor.booking.invalidTimeFormat', 'Invalid time') as string;
    }
  }, [currentLanguage, t]);

  const getStatusLabel = useCallback((status: string): string => t(`mentor.booking.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1)) as string, [t]);

  // Translate error messages after component mounts
  const translatedError = useMemo(() => {
    if (!error) return null;
    if (error.includes('unexpected response')) {
      return t('mentor.booking.error.unexpectedResponse', "Received an unexpected response from the server.") as string;
    }
    if (error.includes('Failed to load')) {
      return t('mentor.booking.error.fetchFailed', "Failed to load bookings. Please check your connection and try again.") as string;
    }
    return error;
  }, [error, t]);

  if (loading) {
    return (
      <Layout>
        <ThemeProvider theme={theme}>
          <PageWrapper>
            <BookingHero />
            <ContentSection>
              <Container maxWidth="lg">
                <LoadingContainer
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <CircularProgress size={60} thickness={4} />
                  </motion.div>
                  <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary', fontWeight: 500 }}>
                    {t('mentor.booking.loadingBookings', 'Loading your bookings...') as string}
                  </Typography>
                </LoadingContainer>
              </Container>
            </ContentSection>
          </PageWrapper>
        </ThemeProvider>
      </Layout>
    );
  }

  return (
    <Layout>
      <ThemeProvider theme={theme}>
        <PageWrapper>
          <BookingHero />
          <ContentSection id="bookings-section">
            <ContentWrapper>
              <AnimatePresence>
                {translatedError && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                      {translatedError}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {!loading && !translatedError && bookings.length === 0 ? (
                <NoBookingsContainer
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <IllustrationContainer
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <EventBusyIcon />
                  </IllustrationContainer>
                  <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                    {t('mentor.booking.noBookingsTitle', 'No Bookings Yet') as string}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '400px', lineHeight: 1.6 }}>
                    {t('mentor.booking.noBookingsDescription', "It looks like you haven't scheduled any mentorship sessions. Find a mentor to get started!") as string}
                  </Typography>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PrimaryButton
                      variant="contained"
                      startIcon={<PersonSearchIcon />}
                      onClick={handleFindMentor}
                      size="large"
                    >
                      {t('mentor.booking.findMentor', 'Find a Mentor') as string}
                    </PrimaryButton>
                  </motion.div>
                </NoBookingsContainer>
              ) : (
                <BookingSection> {/* Now just a simple container, no card styling */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {bookings.map((booking, index) => (
                      <BookingCard
                        key={booking._id}
                        variants={cardVariants}
                        $status={booking.status}
                      >
                        <CardHeader>
                          <MentorInfo>
                            <MentorAvatar 
                              src={booking.mentorId?.profileImage} 
                              alt={booking.mentorId?.fullName || booking.mentorName}
                            >
                              {!booking.mentorId?.profileImage && (booking.mentorId?.fullName?.[0] || booking.mentorName?.[0] || 'M')}
                            </MentorAvatar>
                            <MentorDetails>
                              <MentorName variant="h6">
                                {booking.mentorId?.fullName || booking.mentorName || t('mentor.booking.unknownMentor', 'Unknown Mentor') as string}
                              </MentorName>
                              <MentorTitle variant="caption">
                                {t('mentor.booking.mentor', 'Mentor') as string}
                              </MentorTitle>
                            </MentorDetails>
                          </MentorInfo>
                          <StatusChip $status={booking.status}>
                            {getStatusLabel(booking.status)}
                          </StatusChip>
                        </CardHeader>

                        <CardContent>
                          <BookingTopic variant="subtitle1">
                            {booking.topic || t('mentor.booking.noTopic', 'No topic specified') as string}
                          </BookingTopic>

                          <Divider sx={{ my: 2, display: { xs: 'none', md: 'block' } }} />

                          <BookingDetails>
                            <DetailItem>
                              <CalendarMonthIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />
                              <StyledIconWrapper sx={{ display: { xs: 'flex', sm: 'none' } }} className="mobile-icon-wrapper">
                                <CalendarMonthIcon />
                              </StyledIconWrapper>
                              <span>{formatDate(booking.date || booking.scheduledAt)}</span>
                            </DetailItem>
                            <DetailItem>
                              <ScheduleIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />
                              <StyledIconWrapper sx={{ display: { xs: 'flex', sm: 'none' } }} className="mobile-icon-wrapper">
                                <ScheduleIcon />
                              </StyledIconWrapper>
                              <span>{formatTime(booking.startTime, booking.scheduledAt)}</span>
                            </DetailItem>
                            <DetailItem>
                              <TimerIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />
                              <StyledIconWrapper sx={{ display: { xs: 'flex', sm: 'none' } }} className="mobile-icon-wrapper">
                                <TimerIcon />
                              </StyledIconWrapper>
                              <span>{booking.duration || 30} {t('mentor.booking.minutes', 'min') as string}</span>
                            </DetailItem>
                          </BookingDetails>

                          <Divider sx={{ my: 2, display: { xs: 'none', md: 'block' } }} />

                          <ActionButtons>
                            <SecondaryButton
                              variant="outlined"
                              startIcon={<InfoOutlinedIcon />}
                              onClick={() => handleOpenDetails(booking)}
                            >
                              {t('mentor.booking.viewDetails', 'View Details') as string}
                            </SecondaryButton>
                            {booking.status === 'scheduled' && (
                              <PrimaryButton
                                variant="contained"
                                startIcon={<VideocamIcon />}
                                onClick={() => handleZoomLink(booking)}
                              >
                                {t('mentor.booking.joinSession', 'Join Session') as string}
                              </PrimaryButton>
                            )}
                          </ActionButtons>
                        </CardContent>
                      </BookingCard>
                    ))}
                  </motion.div>
                </BookingSection>
              )}
            </ContentWrapper>
          </ContentSection>

          <ConfirmationDialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogHeader>
              <DialogTitleStyled>
                {t('mentor.booking.sessionDetails', 'Session Details') as string}
              </DialogTitleStyled>
              <IconButton aria-label="close" onClick={handleCloseDialog} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogHeader>

            <DialogContentStyled>
              {selectedBooking && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" component="h3" fontWeight={600} color="text.primary" marginBottom={2}>
                      {t('mentor.booking.sessionWith', 'Session with ')}
                      {selectedBooking.mentorId?.fullName || selectedBooking.mentorName || t('mentor.booking.unknownMentor', 'Unknown Mentor') as string}
                    </Typography>
                    
                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                      <DetailItem>
                        <StyledIconWrapper sx={{ display: { xs: 'flex', sm: 'none' } }} className="mobile-icon-wrapper"><CalendarMonthIcon /></StyledIconWrapper>
                        <CalendarMonthIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />
                        <span>{formatDate(selectedBooking.date || selectedBooking.scheduledAt)}</span>
                      </DetailItem>
                      <DetailItem>
                        <StyledIconWrapper sx={{ display: { xs: 'flex', sm: 'none' } }} className="mobile-icon-wrapper"><ScheduleIcon /></StyledIconWrapper>
                        <ScheduleIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />
                        <span>{formatTime(selectedBooking.startTime, selectedBooking.scheduledAt)}</span>
                      </DetailItem>
                      <DetailItem>
                        <StyledIconWrapper sx={{ display: { xs: 'flex', sm: 'none' } }} className="mobile-icon-wrapper"><TimerIcon /></StyledIconWrapper>
                        <TimerIcon sx={{ display: { xs: 'none', sm: 'flex' } }} />
                        <span>{selectedBooking.duration} {t('mentor.booking.minutes', 'min') as string}</span>
                      </DetailItem>
                    </Stack>

                    <Divider sx={{ mt: 2, mb: 2 }} />

                    <Typography variant="h6" component="h4" fontWeight={600} color="text.primary" marginBottom={1}>
                      {t('mentor.booking.topic', 'Topic')}:
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: selectedBooking.notes?.sharedNotes ? 2 : 0 }}>
                      {selectedBooking.topic}
                    </Typography>

                    {selectedBooking.notes?.sharedNotes && (
                      <>
                        <Typography variant="h6" component="h4" fontWeight={600} color="text.primary" marginTop={2} marginBottom={1}>
                          {t('mentor.booking.sessionNotes', 'Session Notes')}:
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedBooking.notes.sharedNotes}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                      </>
                    )}
                  </Box>

                  {selectedBooking.status === 'scheduled' && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ marginTop: 3, marginBottom: 1 }}>
                      <PrimaryButton
                        variant="contained"
                        startIcon={<VideocamIcon />}
                        onClick={handleZoomLink}
                        fullWidth
                        size="large"
                      >
                        {t('mentor.booking.joinZoomMeeting', 'Join Zoom Meeting') as string}
                      </PrimaryButton>
                      <SecondaryButton
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddToCalendar}
                        fullWidth
                        size="large"
                      >
                        {t('mentor.booking.addToCalendar', 'Add to Calendar') as string}
                      </SecondaryButton>
                    </Stack>
                  )}
                </>
              )}
            </DialogContentStyled>
          </ConfirmationDialog>
        </PageWrapper>
      </ThemeProvider>
    </Layout>
  );
};

export default MyBookingPage;