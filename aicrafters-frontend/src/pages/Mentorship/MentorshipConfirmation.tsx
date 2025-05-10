import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Typography,  Button } from '@mui/material';
import styled from 'styled-components';
import { Layout } from '../../components/layout/Layout/Layout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerIcon from '@mui/icons-material/Timer';
import VideocamIcon from '@mui/icons-material/Videocam';
import AddIcon from '@mui/icons-material/Add';

// Import mock data for development
import { mockMentors } from '../../components/layout/Mentorship/card/mentorsMock';

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

interface LocationState {
  selectedDate?: Date;
  selectedTime?: string;
  duration?: number;
}

const MentorshipConfirmation: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const location = useLocation();
  const state = location.state as LocationState || {};
  
  // In a real app, this would come from the previous step
  // For now we'll use mock data and some defaults
  const mentor = mockMentors.find(m => m.id === mentorId) || mockMentors[0];
  const selectedDate = state.selectedDate || new Date();
  const selectedTime = state.selectedTime || '11:30AM';
  const duration = state.duration || 30;
  
  // Format the date for display
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const handleZoomLink = () => {
    // In a real app, this would open the actual Zoom link
    window.open('https://zoom.us/join', '_blank');
  };
  
  const handleAddToCalendar = () => {
    // In a real app, this would create a calendar event
    alert('Added to your calendar');
  };
  
  return (
    <Layout title="Booking Confirmed">
      <PageContainer>
        <ConfirmationCard>
          <Title variant="h2">Your Session is Confirmed</Title>
          <Subtitle>You're all set for your mentorship session with {mentor.name}</Subtitle>
          
          <ImageContainer>
            <img 
              src="/Zoom_confirmation.png" 
              alt="Zoom session confirmation" 
              style={{ width: '100%', height: 'auto' }}
            />
          </ImageContainer>
          
          <InfoContainer>
            <SessionHeader>Book a Session with {mentor.name}</SessionHeader>
            
            <InfoRow>
              <CalendarMonthIcon /> 
              {formattedDate}
            </InfoRow>
            
            <InfoRow>
              <ScheduleIcon /> 
              {selectedTime}
            </InfoRow>
            
            <InfoRow>
              <TimerIcon /> 
              {duration} min
            </InfoRow>
          </InfoContainer>
          
          <ButtonsContainer>
            <ZoomButton 
              variant="contained" 
              startIcon={<VideocamIcon />}
              onClick={handleZoomLink}
              fullWidth
            >
              Zoom Meeting Link
            </ZoomButton>
            
            <CalendarButton 
              variant="outlined" 
              startIcon={<AddIcon />}
              onClick={handleAddToCalendar}
              fullWidth
            >
              Add to Calendar
            </CalendarButton>
          </ButtonsContainer>
        </ConfirmationCard>
      </PageContainer>
    </Layout>
  );
};

export default MentorshipConfirmation; 