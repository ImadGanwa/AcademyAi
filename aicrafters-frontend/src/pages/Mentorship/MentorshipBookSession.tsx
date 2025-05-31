import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Box, Alert, Button } from '@mui/material';
import styled from 'styled-components';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout/Layout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LoginPopup } from '../../components/common/Popup/LoginPopup';
import { useTranslation } from 'react-i18next';

// Import our components
import { MentorInfoCard } from '../../components/layout/Mentorship/booking/Mentorbookingsuggestion';
import { BookingCalendar } from '../../components/layout/Mentorship/booking/BookingCalendar';
import { MentorHeaderInfo } from '../../components/layout/Mentorship/booking/Mentorcardinfo';
import BookingConfirmationPopup from '../../components/layout/Mentorship/booking/BookingConfirmationPopup';

// Import API services
import { getPublicMentorProfile } from '../../api/mentor';
import { getMentorAvailableSlots, createBooking } from '../../api/booking';


const PageContainer = styled(Container)`
  padding: 40px 20px;
`;

const PageTitle = styled(Typography)`
  font-size: 38px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 30px;
`;

const BookingContainer = styled(Grid)`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  min-height: 600px;
  display: flex;
  margin-top: 24px;
`;

const SidePanel = styled(Grid)`
  height: 100%;
`;

const LoadingContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  width: 100%;
`;

const MentorshipBookSession: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  
  // State for mentor data and loading status
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  // Selected date and time state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  // New state for confirmation popup
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{
    mentorName?: string;
    date?: string;
    startTime?: string;
    topic?: string;
  }>({});
  
  // Store the mentorId for redirect after login when directly accessing the page
  useEffect(() => {
    if (!isAuthenticated && mentorId) {
      // Store mentorId for redirect after login
      localStorage.setItem('bookingMentorId', mentorId);
    }
  }, [isAuthenticated, mentorId]);
  
  // Fetch mentor profile on initial load
  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!mentorId) {
        setError(t('mentorship.mentorNotFound') as string);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getPublicMentorProfile(mentorId);
        if (response && response.success && response.data) {
          setMentor(response.data);
        } else {
          setError(t('mentorship.mentorNotFound') as string);
        }
      } catch (err) {
        console.error("Error fetching mentor profile:", err);
        setError(t('mentorship.failedToLoadMentor') as string);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentorProfile();
  }, [mentorId, t]);
  
  // Fetch available time slots when date is selected
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!selectedDate || !mentorId) return;
      
      setLoadingTimeSlots(true);
      
      try {
        // Format date as YYYY-MM-DD without timezone conversion
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        console.log(`Fetching available slots for mentor ${mentorId} on date ${formattedDate}`);
        const response = await getMentorAvailableSlots(mentorId, formattedDate);
        
        if (response && response.success && response.data && Array.isArray(response.data.availableSlots)) {
          console.log('Available slots fetched:', response.data.availableSlots);
          // Get the current language for formatting
          const currentLang = localStorage.getItem('i18nextLng') || 'en';
          // Format the time slots to 12/24-hour format for display based on locale
          const formattedSlots = response.data.availableSlots.map((slot: string) => {
            // Assuming slot is in 24-hour format like "09:00", "14:30"
            const [hours, minutes] = slot.split(':');
            const hour = parseInt(hours, 10);
            
            // Use localized time format based on language
            if (currentLang === 'fr') {
              // French uses 24-hour format
              return `${hours}:${minutes}`;
            } else {
              // English uses 12-hour format with AM/PM
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
              return `${hour12}:${minutes} ${ampm}`;
            }
          });
          
          setAvailableTimeSlots(formattedSlots);
        } else {
          console.warn('Invalid response format or no slots available:', response);
          setAvailableTimeSlots([]);
        }
      } catch (err) {
        console.error("Error fetching available time slots:", err);
        setAvailableTimeSlots([]);
        setError(t('mentorship.failedToLoadSlots') as string);
      } finally {
        setLoadingTimeSlots(false);
      }
    };
    
    fetchAvailableTimeSlots();
  }, [selectedDate, mentorId, t]);
  
  // Handler for booking submission
  const handleBookSession = async (topic: string, message: string) => {
    if (!selectedDate || !selectedTime || !mentorId) return;
    
    setBookingLoading(true);
    setBookingError(null);
    
    // Get current language
    const currentLang = localStorage.getItem('i18nextLng') || 'en';
    
    // Format the start and end times correctly based on locale
    let startHour, minutes;
    
    if (currentLang === 'fr') {
      // French time format (24h)
      [startHour, minutes] = selectedTime.split(':');
    } else {
      // English time format (12h with AM/PM)
      const [time, period] = selectedTime.split(' ');
      [startHour, minutes] = time.split(':');
      startHour = parseInt(startHour);
      
      if (period === 'PM' && startHour !== 12) {
        startHour += 12;
      } else if (period === 'AM' && startHour === 12) {
        startHour = 0;
      }
    }
    
    startHour = parseInt(startHour as string);
    minutes = parseInt(minutes as string);
    
    const startTime = `${startHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // End time is 30 minutes after start time
    let endHour = startHour;
    let endMinute = minutes + 30;
    
    if (endMinute >= 60) {
      endHour = (endHour + 1) % 24;
      endMinute = endMinute - 60;
    }
    
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // Format date consistently
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    try {
      // Call the API to create a booking using the service function
      const response = await createBooking({
        mentorId,
        date: formattedDate,
        startTime,
        endTime,
        topic,
        message
      });
      
      if (response.success) {
        // Store booking details for confirmation popup
        setBookingDetails({
          mentorName: mentor?.fullName,
          date: formattedDate,
          startTime,
          topic
        });
        
        // Show confirmation popup
        setShowConfirmationPopup(true);
      } else {
        // Handle specific error cases with more helpful messages
        if (response.error?.includes('time slot is already booked')) {
          setBookingError(`The selected time slot (${selectedTime}) is no longer available. Please choose a different time.`);
          // Clear the selected time to encourage the user to choose another
          setSelectedTime(null);
        } else {
          setBookingError(response.error || 'Failed to create booking');
        }
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      // Handle specific API error responses
      if (err.response?.data?.error?.includes('time slot is already booked')) {
        setBookingError(`The selected time slot (${selectedTime}) is no longer available. Please choose a different time.`);
        // Clear the selected time to encourage the user to choose another
        setSelectedTime(null);
      } else {
        setBookingError(err.response?.data?.error || 'An error occurred while booking the session');
      }
    } finally {
      setBookingLoading(false);
    }
  };
  
  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };
  
  const handleCloseConfirmation = () => {
    setShowConfirmationPopup(false);
    // Redirect to dashboard after successful booking
    navigate('/dashboard/bookings');
  };
  
  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    const currentLang = window.location.pathname.split('/')[1] || 'en';
    return <Navigate to={`/${currentLang}/login`} replace />;
  }
  
  if (loading) {
    return (
      <Layout title={t('mentorship.bookSessionTitle') as string}>
        <PageContainer maxWidth="lg">
          <PageTitle variant="h2">{t('mentorship.bookSessionTitle') as string}</PageTitle>
          <LoadingContainer>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>{t('mentorship.loadingMentorProfile') as string}</Typography>
          </LoadingContainer>
        </PageContainer>
      </Layout>
    );
  }
  
  if (error || !mentor) {
    return (
      <Layout title={t('mentorship.bookSessionTitle') as string}>
        <PageContainer maxWidth="lg">
          <PageTitle variant="h2">{t('mentorship.bookSessionTitle') as string}</PageTitle>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || t('mentorship.failedToLoadMentor') as string}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/mentorship')}>
            {t('mentorship.returnToMentors') as string}
          </Button>
        </PageContainer>
      </Layout>
    );
  }
  
  return (
    <Layout title={t('mentorship.bookSessionTitle') as string}>
      <PageContainer maxWidth="lg">
        <PageTitle variant="h2">{t('mentorship.bookSessionTitle') as string}</PageTitle>
        
        {/* Header with Mentor's basic info */}
        <MentorHeaderInfo mentor={mentor} />
        
        <BookingContainer container>
          {/* Left side - Mentor detailed info */}
          <SidePanel item xs={12} md={6} lg={5}>
            <MentorInfoCard mentor={mentor} />
          </SidePanel>
          
          {/* Right side - Calendar */}
          <SidePanel item xs={12} md={6} lg={7}>
            <BookingCalendar 
              onDateSelect={setSelectedDate} 
              onTimeSelect={setSelectedTime}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableTimeSlots={availableTimeSlots}
              loadingTimeSlots={loadingTimeSlots}
              onBookSession={handleBookSession}
            />
          </SidePanel>
        </BookingContainer>
        
        {showLoginPopup && (
          <LoginPopup 
            onClose={handleCloseLoginPopup}
            message={t('mentorship.pleaseLoginToBook') as string}
          />
        )}

        {/* Booking Confirmation Popup */}
        <BookingConfirmationPopup
          open={showConfirmationPopup}
          onClose={handleCloseConfirmation}
          bookingDetails={bookingDetails}
          isLoading={bookingLoading}
          error={bookingError}
        />
      </PageContainer>
    </Layout>
  );
};

export default MentorshipBookSession;