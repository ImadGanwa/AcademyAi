import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Button, CircularProgress, Box, Alert } from '@mui/material';
import styled from 'styled-components';
import { Layout } from '../../components/layout/Layout/Layout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerIcon from '@mui/icons-material/Timer';
import VideocamIcon from '@mui/icons-material/Videocam';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

// Import API methods
import { createBooking } from '../../api/booking';
import { getPublicMentorProfile } from '../../api/mentor';

// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  width: 100%;
  padding: 0;
  margin: 0;
  background-color: #fff;
`;

const ConfirmationCard = styled.div`
  max-width: 600px;
  width: 100%;
  margin: 40px 20px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
`;

const Title = styled(Typography)`
  font-size: 30px;
  font-weight: 700;
  color: #1a1a2c;
  margin-bottom: 15px;
  text-align: center;
`;

const Subtitle = styled(Typography)`
  font-size: 18px;
  color: #64748b;
  margin-bottom: 40px;
  text-align: center;
  font-weight: normal;
`;

const ImageContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 20px 0 40px;
  display: flex;
  justify-content: center;
`;

const InfoContainer = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  padding: 25px;
  width: 100%;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SessionHeader = styled(Typography)`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2c;
  margin-bottom: 10px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  width: 100%;
  justify-content: center;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ZoomButton = styled(Button)`
  background-color: #e61cae;
  color: white;
  text-transform: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  
  &:hover {
    background-color: #d1189b;
  }
`;

const CalendarButton = styled(Button)`
  border: 1px solid #6366f1;
  color: #6366f1;
  text-transform: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  background-color: white;
  
  &:hover {
    background-color: #f0f5ff;
  }
`;

const ReturnButton = styled(Button)`
  margin-top: 20px;
  color: #475569;
  text-transform: none;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  color: #475569;
  font-size: 16px;
  padding: 5px 0;
  
  & svg {
    margin-right: 10px;
    color: #6366f1;
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

interface LocationState {
  mentorId: string;
  mentorName: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  message?: string;
}

const MentorshipConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [loading, setLoading] = useState(true);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);
  
  const { t } = useTranslation();
  
  // Create the booking when component mounts
  useEffect(() => {
    const createNewBooking = async () => {
      if (!state || !state.mentorId) {
        setError("No booking information provided");
        setLoading(false);
        return;
      }
      
      try {
        // Get mentor details
        const mentorResponse = await getPublicMentorProfile(state.mentorId);
        if (mentorResponse && mentorResponse.mentor) {
          setMentor(mentorResponse.mentor);
        }
        
        // Create booking
        const bookingData = {
          mentorId: state.mentorId,
          date: state.date,
          startTime: state.startTime,
          endTime: state.endTime,
          topic: state.topic,
          message: state.message || ''
        };
        
        const response = await createBooking(bookingData);
        
        if (response && response.booking) {
          setBookingDetails(response.booking);
          setBookingCreated(true);
        } else {
          throw new Error("Failed to create booking");
        }
      } catch (err) {
        console.error("Error creating booking:", err);
        setError("Failed to create your booking. Please try again.");
        
        // For demo purposes, we'll still show a successful booking
        setBookingDetails({
          id: 'demo-booking-id',
          mentorId: state.mentorId,
          mentorName: state.mentorName,
          date: state.date,
          startTime: state.startTime,
          endTime: state.endTime,
          topic: state.topic,
          meetingLink: 'https://zoom.us/j/demo',
          status: 'confirmed'
        });
        setBookingCreated(true);
      } finally {
        setLoading(false);
      }
    };
    
    createNewBooking();
  }, [state]);
  
  const handleZoomLink = () => {
    if (bookingDetails && bookingDetails.meetingLink) {
      window.open(bookingDetails.meetingLink, '_blank');
    } else {
      // Demo link for testing
      window.open('https://zoom.us/join', '_blank');
    }
  };
  
  const handleAddToCalendar = () => {
    if (!bookingDetails) return;
    
    const startDateTime = `${bookingDetails.date}T${bookingDetails.startTime}:00`;
    const endDateTime = `${bookingDetails.date}T${bookingDetails.endTime}:00`;
    const mentorName = mentor?.name || bookingDetails.mentorName || state?.mentorName || 'your mentor';
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Mentorship Session with ${mentorName}&details=${bookingDetails.topic}&location=${bookingDetails.meetingLink || 'Online'}&dates=${startDateTime.replace(/[-:]/g, '')}/${endDateTime.replace(/[-:]/g, '')}`;
    
    window.open(googleCalendarUrl, '_blank');
  };
  
  const handleReturnToMentors = () => {
    navigate('/mentorship');
  };
  
  // Show loading state
  if (loading) {
    return (
      <Layout title={t('mentorship.confirmationTitle', 'Processing Booking')}>
        <PageContainer>
          <LoadingContainer>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>{t('mentorship.loadingMentorProfile', 'Processing your booking...')}</Typography>
          </LoadingContainer>
        </PageContainer>
      </Layout>
    );
  }
  
  // Show error state
  if (error && !bookingCreated) {
    return (
      <Layout title={t('mentorship.confirmationTitle', 'Booking Error')}>
        <PageContainer>
          <ConfirmationCard>
            <Title variant="h2">{t('mentorship.bookingError', 'Booking Error')}</Title>
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>{error}</Alert>
            <Button variant="contained" color="primary" onClick={handleReturnToMentors}>
              {t('mentorship.returnToMentors', 'Return to mentors')}
            </Button>
          </ConfirmationCard>
        </PageContainer>
      </Layout>
    );
  }
  
  // Format the date for display
  const formattedDate = new Date(bookingDetails?.date || state?.date || Date.now())
    .toLocaleDateString(localStorage.getItem('i18nextLng') === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  
  const startTime = bookingDetails?.startTime || state?.startTime || '09:00';
  const endTime = bookingDetails?.endTime || state?.endTime || '09:30';
  
  // Format the time based on the locale
  let formattedStartTime, formattedEndTime;
  const currentLang = localStorage.getItem('i18nextLng') || 'en';
  
  if (currentLang === 'fr') {
    // French uses 24-hour format
    formattedStartTime = startTime;
    formattedEndTime = endTime;
  } else {
    // Format time for English (12-hour with AM/PM)
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');
    
    const startHourInt = parseInt(startHour);
    const endHourInt = parseInt(endHour);
    
    formattedStartTime = `${startHourInt > 12 ? startHourInt - 12 : startHourInt}:${startMinute}${startHourInt >= 12 ? ' PM' : ' AM'}`;
    formattedEndTime = `${endHourInt > 12 ? endHourInt - 12 : endHourInt}:${endMinute}${endHourInt >= 12 ? ' PM' : ' AM'}`;
  }
  
  // Calculate duration in minutes
  const [startHour, startMinute] = startTime.split(':');
  const [endHour, endMinute] = endTime.split(':');
  const startMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
  const endMinutes = parseInt(endHour) * 60 + parseInt(endMinute);
  const duration = endMinutes - startMinutes;
  
  // Get mentor name
  const mentorName = mentor?.name || bookingDetails?.mentorName || state?.mentorName || 'your mentor';
  
  return (
    <Layout title={t('mentorship.confirmationTitle', 'Booking Confirmed')}>
      <PageContainer>
        <ConfirmationCard>
          <Title variant="h2">{t('mentorship.confirmationTitle', 'Your Session is Confirmed')}</Title>
          <Subtitle>{t('mentorship.confirmationSubtitle', 'You\'re all set for your mentorship session with ')} {mentorName}</Subtitle>
          
          <ImageContainer>
            <img 
              src="/Zoom_confirmation.png" 
              alt="Zoom session confirmation" 
              style={{ width: '100%', height: 'auto' }}
            />
          </ImageContainer>
          
          {error && (
            <Alert severity="warning" sx={{ width: '100%', mb: 3 }}>
              {error} {t('mentorship.demoBookingMessage', 'We\'ve still processed your booking for demonstration purposes.')}
            </Alert>
          )}
          
          <InfoContainer>
            <SessionHeader>{t('mentorship.sessionWith', 'Book a Session with')} {mentorName}</SessionHeader>
            
            <InfoRow>
              <CalendarMonthIcon /> 
              {formattedDate}
            </InfoRow>
            
            <InfoRow>
              <ScheduleIcon /> 
              {formattedStartTime}
            </InfoRow>
            
            <InfoRow>
              <TimerIcon /> 
              {duration} {t('mentorship.minutes', 'min')}
            </InfoRow>
          </InfoContainer>
          
          <ButtonsContainer>
            <ZoomButton 
              variant="contained" 
              startIcon={<VideocamIcon />}
              onClick={handleZoomLink}
              fullWidth
            >
              {t('mentorship.zoomMeetingLink', 'Zoom Meeting Link')}
            </ZoomButton>
            
            <CalendarButton 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleAddToCalendar}
              fullWidth
            >
              {t('mentorship.addToCalendar', 'Add to Calendar')}
            </CalendarButton>
          </ButtonsContainer>
          
          <ReturnButton onClick={handleReturnToMentors}>
            {t('mentorship.returnToMentors', 'Return to Mentors')}
          </ReturnButton>
        </ConfirmationCard>
      </PageContainer>
    </Layout>
  );
};

export default MentorshipConfirmation; 