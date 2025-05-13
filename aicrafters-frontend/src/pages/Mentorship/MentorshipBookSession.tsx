import React, { useState } from 'react';
import { Container, Typography, Grid } from '@mui/material';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout/Layout';

// Import our components
import { MentorInfoCard } from '../../components/layout/Mentorship/booking/Mentorbookingsuggestion';
import { BookingCalendar } from '../../components/layout/Mentorship/booking/BookingCalendar';
import { MentorHeaderInfo } from '../../components/layout/Mentorship/booking/Mentorcardinfo';

// This will be replaced with actual data fetching
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

const MentorshipBookSession: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  // For now, find mentor from mock data. In a real app, this would be an API call
  const mentor = mockMentors.find(m => m.id === mentorId) || mockMentors[0];
  
  // Selected date and time state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
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
            />
          </SidePanel>
        </BookingContainer>
      </PageContainer>
    </Layout>
  );
};

export default MentorshipBookSession; 