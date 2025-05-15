import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Box, Alert, Button } from '@mui/material';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout/Layout';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LoginPopup } from '../../components/common/Popup/LoginPopup';

// Import our components
import { MentorInfoCard } from '../../components/layout/Mentorship/booking/Mentorbookingsuggestion';
import { BookingCalendar } from '../../components/layout/Mentorship/booking/BookingCalendar';
import { MentorHeaderInfo } from '../../components/layout/Mentorship/booking/Mentorcardinfo';

// Import API services
import { getPublicMentorProfile } from '../../api/mentor';
import { getMentorAvailableSlots } from '../../api/booking';

// Import mock data for fallback
import { mockMentors } from '../../components/layout/Mentorship/card/mentorsMock';

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
  
  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated && mentorId) {
      // Store mentorId for redirect after login
      localStorage.setItem('bookingMentorId', mentorId);
      setShowLoginPopup(true);
    }
  }, [isAuthenticated, mentorId]);
  
  // Fetch mentor profile on initial load
  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!mentorId) {
        setError("No mentor ID provided");
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
          // Fallback to mock data for testing
          const mockMentor = mockMentors.find(m => m.id === mentorId);
          if (mockMentor) {
            setMentor(mockMentor);
          } else {
            setError("Mentor not found");
          }
        }
      } catch (err) {
        console.error("Error fetching mentor profile:", err);
        setError("Failed to load mentor profile. Please try again later.");
        
        // Fallback to mock data
        const mockMentor = mockMentors.find(m => m.id === mentorId);
        if (mockMentor) {
          setMentor(mockMentor);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentorProfile();
  }, [mentorId]);
  
  // Fetch available time slots when date is selected
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!selectedDate || !mentorId) return;
      
      setLoadingTimeSlots(true);
      
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const response = await getMentorAvailableSlots(mentorId, formattedDate);
        
        if (response && response.availableSlots) {
          setAvailableTimeSlots(response.availableSlots);
        } else {
          // Fallback to mock time slots for testing
          setAvailableTimeSlots([
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
            '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM'
          ]);
        }
      } catch (err) {
        console.error("Error fetching available time slots:", err);
        // Fallback to mock time slots
        setAvailableTimeSlots([
          '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
          '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM'
        ]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };
    
    fetchAvailableTimeSlots();
  }, [selectedDate, mentorId]);
  
  // Handler for booking submission
  const handleBookSession = (topic: string, message: string) => {
    if (!isAuthenticated) {
      // Store mentorId for redirect after login
      if (mentorId) {
        localStorage.setItem('bookingMentorId', mentorId);
      }
      setShowLoginPopup(true);
      return;
    }
    
    if (!selectedDate || !selectedTime || !mentorId) return;
    
    // Format the start and end times
    const [time, period] = selectedTime.split(' ');
    const [hours, minutes] = time.split(':');
    let startHour = parseInt(hours);
    
    if (period === 'PM' && startHour !== 12) {
      startHour += 12;
    } else if (period === 'AM' && startHour === 12) {
      startHour = 0;
    }
    
    const startTime = `${startHour.toString().padStart(2, '0')}:${minutes}`;
    
    // End time is 30 minutes after start time
    let endHour = startHour;
    let endMinute = parseInt(minutes) + 30;
    
    if (endMinute >= 60) {
      endHour = (endHour + 1) % 24;
      endMinute = endMinute - 60;
    }
    
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // Navigate to confirmation page with booking details
    navigate(`/mentorship/booking-confirmation`, {
      state: {
        mentorId,
        mentorName: mentor?.fullName,
        date: selectedDate.toISOString().split('T')[0],
        startTime,
        endTime,
        topic,
        message
      }
    });
  };
  
  const handleCloseLoginPopup = () => {
    setShowLoginPopup(false);
  };
  
  if (loading) {
    return (
      <Layout title="Book a Session">
        <PageContainer maxWidth="lg">
          <PageTitle variant="h2">Book a Session</PageTitle>
          <LoadingContainer>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>Loading mentor profile...</Typography>
          </LoadingContainer>
        </PageContainer>
      </Layout>
    );
  }
  
  if (error || !mentor) {
    return (
      <Layout title="Book a Session">
        <PageContainer maxWidth="lg">
          <PageTitle variant="h2">Book a Session</PageTitle>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Failed to load mentor information."}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/mentorship')}>
            Return to Mentors
          </Button>
        </PageContainer>
      </Layout>
    );
  }
  
  return (
    <Layout title="Book a Session">
      <PageContainer maxWidth="lg">
        <PageTitle variant="h2">Book a Session</PageTitle>
        
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
            message="Please login to book a session with this mentor"
          />
        )}
      </PageContainer>
    </Layout>
  );
};

export default MentorshipBookSession; 