import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Card, CardContent, Chip, Button, Dialog, Grid, CircularProgress, Paper,
  Avatar, Container, Stack,  Alert
} from '@mui/material';
import styled, { ThemeProvider } from 'styled-components';

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerIcon from '@mui/icons-material/Timer';
import VideocamIcon from '@mui/icons-material/Videocam';
import AddIcon from '@mui/icons-material/Add';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Original Imports from your script
import { Layout } from '../../../../components/layout/Layout/Layout'; // Assuming this path is correct
import { useTranslation } from 'react-i18next';
import { getUserBookings } from '../../../../api/booking'; 
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../../assets/styles/theme';


// Styled components
const PageWrapper = styled.div`
  width: 100%;
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(5)};
  background-color: #f7f9fc;
  min-height: 100vh;
`;

const PageTitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(3.5)};
  text-align: center;
  color: #1a1a2c; // From original script's Title
  @media (min-width: ${theme.breakpoints.values.sm}px) {
    text-align: left;
  }
`;

const BookingCardStyled = styled(Card)<{ $status?: string }>`
  margin-bottom: ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.07);
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: white;

  ${({ $status, theme }) =>
    $status === 'scheduled' && `border-left: 4px solid ${theme.palette.info.main};`}
  ${({ $status, theme }) =>
    $status === 'completed' && `border-left: 4px solid ${theme.palette.success.main};`}
  ${({ $status, theme }) =>
    $status === 'cancelled' && `border-left: 4px solid ${theme.palette.error.main};`}
   ${({ $status, theme }) =>
    $status === 'no-show' && `border-left: 4px solid ${theme.palette.warning.main};`}


  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const MentorInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const MentorName = styled(Typography)`
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const BookingTopic = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.4em; // Approx 2 lines
`;

const InfoRow = styled(Stack)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 0.875rem;
  
  & svg {
    color: ${({ theme }) => theme.palette.primary.main};
    font-size: 1.05rem; // Slightly smaller than before for refinement
  }
`;

const StatusChip = styled(Chip)<{ $status: string }>`
  font-weight: 500;
  font-size: 0.75rem; // Smaller chip text
  height: 26px;
  border-radius: ${({ theme }) => theme.shape.borderRadius * 0.6}px;

  background-color: ${props => {
    switch (props.$status) {
      case 'scheduled': return props.theme.palette.info.light;
      case 'completed': return props.theme.palette.success.light;
      case 'cancelled': return props.theme.palette.error.light;
      case 'no-show': return props.theme.palette.warning.light; // Using warning theme color
      default: return props.theme.palette.info.light;
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'scheduled': return props.theme.palette.info.contrastText;
      case 'completed': return props.theme.palette.success.contrastText;
      case 'cancelled': return props.theme.palette.error.contrastText;
      case 'no-show': return props.theme.palette.warning.contrastText; // Using warning theme color
      default: return props.theme.palette.info.contrastText;
    }
  }};
`;

const ActionButton = styled(Button)`
  border-radius: ${({ theme }) => theme.shape.borderRadius * 0.8}px;
`;

const PrimaryActionButton = styled(ActionButton)`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: white;
  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.dark};
  }
`;

const SecondaryActionButton = styled(ActionButton)`
    border: 1px solid ${({ theme }) => theme.palette.grey[400]};
    color: ${({ theme }) => theme.palette.text.primary};
    &:hover {
        background-color: ${({ theme }) => theme.palette.grey[100]};
        border-color: ${({ theme }) => theme.palette.grey[500]};
    }
`;

const ZoomButton = styled(PrimaryActionButton)`
  background-color: ${({ theme }) => theme.palette.secondary.main}; // Using secondary (pink) from theme
  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const NoBookingsContainer = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(5)} auto;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background-color: white;
  border: 1px dashed ${({ theme }) => theme.palette.grey[400]};
  text-align: center;
  max-width: 500px;
`;

const IllustrationContainer = styled(Box)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.palette.primary.light};
  
  svg {
    font-size: 4.5rem;
    opacity: 0.7;
  }
`;

const LoadingContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
`;

const ConfirmationDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: ${({ theme }) => theme.shape.borderRadius * 1.2}px;
    padding: ${({ theme }) => theme.spacing(0.5)}; // Small padding around content box
  }
`;

const DialogTitleStyled = styled(Typography)`
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

const DialogInfoContainer = styled(Paper)`
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  padding: ${({ theme }) => theme.spacing(2.5)};
  background-color: ${({ theme }) => theme.palette.grey[50]};
  margin: ${({ theme }) => theme.spacing(2.5)} 0;
`;

const SessionHeader = styled(Typography)`
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const MyBookingPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { t, i18n } = useTranslation();
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
          // This case implies an unexpected API response structure
          console.error("Unexpected API response structure:", response);
          setError(t('booking.error.unexpectedResponse', "Received an unexpected response from the server.") as string);
          setBookings([]);
        }
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(t('booking.error.fetchFailed', "Failed to load bookings. Please check your connection and try again.") as string);
        setBookings([]); // Clear bookings on error
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [t]); // Added `t` to dependency array as it's used in error messages

  const handleOpenDetails = (booking: any) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleZoomLink = (bookingToOpen?: any) => {
    const booking = bookingToOpen || selectedBooking;
    if (booking && booking.meetingLink) {
      window.open(booking.meetingLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddToCalendar = () => {
    if (!selectedBooking) return;
    const mentorName = selectedBooking.mentorId?.fullName || selectedBooking.mentorName || t('booking.unknownMentor', 'your mentor') as string;
    const startDateTime = `${selectedBooking.date}T${selectedBooking.startTime}:00`;
    const endDateTime = `${selectedBooking.date}T${selectedBooking.endTime}:00`;
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t('booking.calendarTitle', `Mentorship: ${selectedBooking.topic} with ${mentorName}`, { topic: selectedBooking.topic, mentorName }))}&details=${encodeURIComponent(t('booking.calendarDetails', `Topic: ${selectedBooking.topic}\nJoin here: ${selectedBooking.meetingLink || 'Online'}`, { topic: selectedBooking.topic, meetingLink: selectedBooking.meetingLink || 'Online' }))}&location=${encodeURIComponent(selectedBooking.meetingLink || 'Online Meeting')}&dates=${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}`;
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFindMentor = () => navigate(`/${currentLanguage}/mentorship`);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return t('booking.dateNotSpecified', 'Date not specified') as string;
    try {
      return new Date(dateString).toLocaleDateString(
        currentLanguage === 'fr' ? 'fr-FR' : 'en-US', 
        { day: 'numeric', month: 'long', year: 'numeric' }
      );
    } catch { return t('booking.invalidDateFormat', 'Invalid date') as string; }
  };

  const formatTime = (timeString: string | undefined, scheduledAt?: string): string => {
    if (!timeString && scheduledAt) {
      try {
        const date = new Date(scheduledAt);
        if (!isNaN(date.getTime())) timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } catch {} // Silently ignore if scheduledAt is invalid
    }
    if (!timeString) return t('booking.timeNotSpecified', 'Time not specified') as string;
    
    const locale = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
    try {
        const date = new Date(`1970-01-01T${timeString}`); // Create a dummy date with the time
        if (isNaN(date.getTime())) throw new Error("Invalid time for Date constructor");
        return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: 'numeric', hour12: locale !== 'fr-FR' }).format(date);
    } catch {
        // Fallback for simpler display if Intl fails or timeString is problematic
        const parts = timeString.split(':');
        if (parts.length === 2) {
            const hourInt = parseInt(parts[0]);
            const minute = parts[1];
            if (!isNaN(hourInt) && minute.length === 2 && !isNaN(parseInt(minute))) {
                 if (locale === 'fr-FR') return timeString;
                 return `${hourInt % 12 || 12}:${minute}${hourInt >= 12 ? ' PM' : ' AM'}`;
            }
        }
        return t('booking.invalidTimeFormat', 'Invalid time') as string;
    }
  };

  const getStatusLabel = (status: string): string => t(`booking.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1)) as string;

  if (loading) {
    return (
      <Layout>
        <ThemeProvider theme={theme}>
          <PageWrapper>
            <Container maxWidth="md">
              <LoadingContainer>
                <CircularProgress size={50} thickness={3.5} />
                <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                  {t('booking.loadingBookings', 'Loading your bookings...') as string}
                </Typography>
              </LoadingContainer>
            </Container>
          </PageWrapper>
        </ThemeProvider>
      </Layout>
    );
  }

  return (
    <Layout> {/* Your main Layout component */}
      <ThemeProvider theme={theme}>
        <PageWrapper>
          <Container maxWidth="md">
            <PageTitle variant="h2">
              {t('booking.myBookings', 'My Bookings') as string}
            </PageTitle>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {!loading && !error && bookings.length === 0 ? (
              <NoBookingsContainer elevation={0}>
                <IllustrationContainer>
                  <EventBusyIcon />
                </IllustrationContainer>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {t('booking.noBookingsTitle', 'No Bookings Yet') as string}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
                  {t('booking.noBookingsDescription', "It looks like you haven't scheduled any mentorship sessions. Find a mentor to get started!") as string}
                </Typography>
                <PrimaryActionButton
                  variant="contained"
                  startIcon={<PersonSearchIcon />}
                  onClick={handleFindMentor}
                  size="large"
                >
                  {t('booking.findMentor', 'Find a Mentor') as string}
                </PrimaryActionButton>
              </NoBookingsContainer>
            ) : (
              <Grid container spacing={0}> {/* Cards have their own margin-bottom */}
                {bookings.map(booking => (
                  <Grid item xs={12} key={booking._id}>
                    <BookingCardStyled $status={booking.status}>
                      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}> {/* Slightly reduced padding */}
                        <CardHeader>
                          <MentorInfo>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 44, height: 44 }}>
                              <AccountCircleIcon sx={{ fontSize: '1.8rem' }}/>
                            </Avatar>
                            <Box>
                              <MentorName variant="h6">
                                {booking.mentorId?.fullName || booking.mentorName || t('booking.unknownMentor', 'Unknown Mentor') as string}
                              </MentorName>
                              {/* Optional: Mentor title if available */}
                              {/* <Typography variant="caption" color="text.secondary">Mentor</Typography> */}
                            </Box>
                          </MentorInfo>
                          <StatusChip
                            label={getStatusLabel(booking.status)}
                            $status={booking.status}
                          />
                        </CardHeader>

                        <BookingTopic variant="subtitle1" sx={{ mt: 0.5, mb: 2.5}}>
                          {booking.topic || t('booking.noTopic', 'No topic specified') as string}
                        </BookingTopic>

                        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                          <Grid item xs={12} sm={4}>
                            <InfoRow direction="row" spacing={1} alignItems="center">
                              <CalendarMonthIcon />
                              <span>{formatDate(booking.date || booking.scheduledAt)}</span>
                            </InfoRow>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <InfoRow direction="row" spacing={1} alignItems="center">
                              <ScheduleIcon />
                              <span>{formatTime(booking.startTime, booking.scheduledAt)}</span>
                            </InfoRow>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <InfoRow direction="row" spacing={1} alignItems="center">
                              <TimerIcon />
                              <span>{booking.duration || 30} {t('booking.minutes', 'min') as string}</span>
                            </InfoRow>
                          </Grid>
                        </Grid>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                          <SecondaryActionButton
                            variant="outlined"
                            startIcon={<InfoOutlinedIcon />}
                            onClick={() => handleOpenDetails(booking)}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                          >
                            {t('booking.viewDetails', 'View Details') as string}
                          </SecondaryActionButton>
                          {booking.status === 'scheduled' && (
                            <ZoomButton
                              variant="contained"
                              startIcon={<VideocamIcon />}
                              onClick={() => handleZoomLink(booking)}
                              sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                              {t('booking.joinSession', 'Join Session') as string}
                            </ZoomButton>
                          )}
                        </Stack>
                      </CardContent>
                    </BookingCardStyled>
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>

          <ConfirmationDialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <DialogTitleStyled variant="h3">
                {t('booking.sessionDetails', 'Session Details') as string}
              </DialogTitleStyled>

              {selectedBooking && (
                <>
                  <DialogInfoContainer elevation={0}>
                    <SessionHeader variant="h4"> {}
                      {t('booking.sessionWith', 'Session with')}{' '}
                      {selectedBooking.mentorId?.fullName || selectedBooking.mentorName || t('booking.unknownMentor', 'Unknown Mentor') as string}
                    </SessionHeader>
                    <Stack spacing={1.5} sx={{mt: 1.5}}>
                      <InfoRow direction="row" spacing={1.5} alignItems="center">
                        <CalendarMonthIcon />
                        <Typography variant="body1">{formatDate(selectedBooking.date || selectedBooking.scheduledAt)}</Typography>
                      </InfoRow>
                      <InfoRow direction="row" spacing={1.5} alignItems="center">
                        <ScheduleIcon />
                        <Typography variant="body1">{formatTime(selectedBooking.startTime, selectedBooking.scheduledAt)}</Typography>
                      </InfoRow>
                      <InfoRow direction="row" spacing={1.5} alignItems="center">
                        <TimerIcon />
                        <Typography variant="body1">{selectedBooking.duration} {t('booking.minutes', 'min') as string}</Typography>
                      </InfoRow>
                    </Stack>

                    <Typography variant="subtitle1" fontWeight={600} mt={2.5} mb={0.5}>
                      {t('booking.topic', 'Topic')}:
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedBooking.topic}
                    </Typography>

                    {selectedBooking.notes?.sharedNotes && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} mt={2.5} mb={0.5}>
                          {t('booking.sessionNotes', 'Session Notes')}:
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedBooking.notes.sharedNotes}
                        </Typography>
                      </>
                    )}
                  </DialogInfoContainer>

                  {selectedBooking.status === 'scheduled' && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                      <PrimaryActionButton // Switched to PrimaryActionButton for consistency, ZoomButton used on card
                        variant="contained"
                        startIcon={<VideocamIcon />}
                        onClick={handleZoomLink}
                        fullWidth
                        size="large"
                      >
                        {t('booking.joinZoomMeeting', 'Join Zoom Meeting') as string}
                      </PrimaryActionButton>
                      <SecondaryActionButton
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddToCalendar}
                        fullWidth
                        size="large"
                      >
                        {t('booking.addToCalendar', 'Add to Calendar') as string}
                      </SecondaryActionButton>
                    </Stack>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: selectedBooking.status === 'scheduled' ? 3 : 2.5 }}>
                    <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                      {t('booking.close', 'Close') as string}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </ConfirmationDialog>
        </PageWrapper>
      </ThemeProvider>
    </Layout>
  );
};

export default MyBookingPage;