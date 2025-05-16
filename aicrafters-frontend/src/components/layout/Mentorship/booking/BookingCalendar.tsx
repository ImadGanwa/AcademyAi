import React, { useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import { KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const CalendarContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 30px;
  background-color: white;
  overflow-y: auto;
`;

const CalendarHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const MonthTitle = styled(Typography)`
  font-size: 22px;
  font-weight: 600;
  color: #333;
`;

const MonthNavButton = styled(Button)`
  min-width: 40px;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9c27b0;
  
  &:hover {
    background-color: rgba(156, 39, 176, 0.08);
  }
`;

const CalendarWrapper = styled(Box)`
  background-color: white;
  margin-bottom: 25px;
`;

const WeekdaysRow = styled(Box)`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 15px;
  text-align: center;
`;

const Weekday = styled(Typography)`
  color: #666;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 8px 0;
`;

const DaysGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 8px;
  justify-items: center;
`;

const DayCell = styled(Button)<{ isselected?: string; istoday?: string; iscurrentmonth?: string; isprevmonth?: string; isnextmonth?: string }>`
  min-width: 38px;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 500;
  
  background-color: ${props => 
    props.isselected === 'true' 
      ? '#9c27b0' 
      : 'transparent'
  };
  
  color: ${props => {
    if (props.isselected === 'true') return 'white';
    if (props.isprevmonth === 'true' || props.isnextmonth === 'true') return '#ccc';
    if (props.istoday === 'true') return '#9c27b0';
    return '#333';
  }};
  
  opacity: ${props => 
    props.isprevmonth === 'true' || props.isnextmonth === 'true' 
      ? 0.5 
      : 1
  };
  
  font-weight: ${props => props.istoday === 'true' ? '600' : '400'};
  
  &:hover {
    background-color: ${props => 
      props.isselected === 'true' 
        ? '#9c27b0' 
        : 'rgba(156, 39, 176, 0.08)'
    };
  }
`;

const TimeSlotSection = styled(Box)`
  background-color: white;
  margin-top: 30px;
  margin-bottom: 25px;
`;

const TimeSlotTitle = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
`;

const TimeSlotList = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 10px;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TimeSlot = styled(Button)<{ isselected?: string }>`
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 8px;
  text-transform: none;
  justify-content: flex-start;
  border: 1px solid ${props => props.isselected === 'true' ? 'transparent' : '#E9EAEB'};
  background-color: ${props => props.isselected === 'true' ? '#9c27b0' : 'white'};
  color: ${props => props.isselected === 'true' ? 'white' : '#555'};
  
  &:hover {
    background-color: ${props => props.isselected === 'true' ? '#9c27b0' : '#f5f5f5'};
  }
`;

const SelectedTimeBox = styled(Box)`
  background-color: #f9f5fc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const SelectedTimeLabel = styled(Typography)`
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
`;

const SelectedTimeValue = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  color: #9c27b0;
`;

const BookButton = styled(Button)`
  background-color: #9c27b0;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  text-transform: none;
  
  &:hover {
    background-color: #7b1fa2;
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #a0a0a0;
  }
`;

const FormField = styled(Box)`
  margin-bottom: 16px;
`;

const FieldLabel = styled(Typography)`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

interface BookingCalendarProps {
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: string | null) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  availableTimeSlots?: string[];
  loadingTimeSlots?: boolean;
  onBookSession?: (topic: string, message: string) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  onDateSelect, 
  onTimeSelect,
  selectedDate,
  selectedTime,
  availableTimeSlots = [],
  loadingTimeSlots = false,
  onBookSession
}) => {
  const navigate = useNavigate();
  const { mentorId } = useParams<{ mentorId: string }>();
  
  // Current display month/year
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Form state for booking
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validate form when inputs change
  React.useEffect(() => {
    setIsFormValid(!!selectedDate && !!selectedTime && !!topic.trim());
  }, [selectedDate, selectedTime, topic]);
  
  // Format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Navigate to previous or next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newDate);
  };
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar data for current month view
  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInCurrentMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Get days from previous month to fill first week
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const prevMonthDays = Array.from(
      { length: firstDayOfMonth },
      (_, i) => ({
        day: daysInPrevMonth - firstDayOfMonth + i + 1,
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false
      })
    );
    
    // Current month days
    const currentMonthDays = Array.from(
      { length: daysInCurrentMonth },
      (_, i) => ({
        day: i + 1,
        isCurrentMonth: true,
        isPrevMonth: false,
        isNextMonth: false
      })
    );
    
    // Calculate how many days from next month we need to fill the grid
    const remainingCells = (6 * 7) - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = Array.from(
      { length: remainingCells },
      (_, i) => ({
        day: i + 1,
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true
      })
    );
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Check if a given date is today
  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a given date is selected
  const isSelectedDate = (day: number, isCurrentMonth: boolean) => {
    if (!selectedDate || !isCurrentMonth) return false;
    
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Handle date selection
  const handleDateSelect = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(date);
    onTimeSelect(null); // Reset time selection when date changes
  };
  
  // Format selected date & time for display
  const getFormattedSelectedDateTime = () => {
    if (!selectedDate) return '';
    
    const formattedDate = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!selectedTime) return formattedDate;
    
    return `${formattedDate} at ${selectedTime}`;
  };
  
  // Handle booking submission
  const handleSubmitBooking = () => {
    if (!isFormValid || !onBookSession) return;
    
    setIsSubmitting(true);
    
    // Call the onBookSession prop with form data
    onBookSession(topic, message);
    
    setIsSubmitting(false);
  };
  
  const calendarDays = generateCalendarData();
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  return (
    <CalendarContainer>
      <CalendarHeader>
        <MonthNavButton onClick={() => navigateMonth('prev')}>
          <ArrowLeftIcon />
        </MonthNavButton>
        <MonthTitle>{formatMonthYear(currentMonth)}</MonthTitle>
        <MonthNavButton onClick={() => navigateMonth('next')}>
          <ArrowRightIcon />
        </MonthNavButton>
      </CalendarHeader>
      
      <CalendarWrapper>
        <WeekdaysRow>
          {weekdays.map(day => (
            <Weekday key={day}>{day}</Weekday>
          ))}
        </WeekdaysRow>
        
        <DaysGrid>
          {calendarDays.map((dateInfo, index) => (
            <DayCell
              key={index}
              isselected={isSelectedDate(dateInfo.day, dateInfo.isCurrentMonth).toString()}
              istoday={isToday(dateInfo.day, dateInfo.isCurrentMonth).toString()}
              iscurrentmonth={dateInfo.isCurrentMonth.toString()}
              isprevmonth={dateInfo.isPrevMonth.toString()}
              isnextmonth={dateInfo.isNextMonth.toString()}
              onClick={() => handleDateSelect(dateInfo.day, dateInfo.isCurrentMonth)}
              disabled={dateInfo.isPrevMonth || dateInfo.isNextMonth}
            >
              {dateInfo.day}
            </DayCell>
          ))}
        </DaysGrid>
      </CalendarWrapper>
      
      {/* Time slot selection */}
      {selectedDate && (
        <TimeSlotSection>
          <TimeSlotTitle>Available Time Slots</TimeSlotTitle>
          
          {loadingTimeSlots ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : availableTimeSlots.length > 0 ? (
            <TimeSlotList>
              {availableTimeSlots.map((time, index) => (
                <TimeSlot
                  key={`time-slot-${time}-${index}`}
                  isselected={(selectedTime === time).toString()}
                  onClick={() => onTimeSelect(time)}
                >
                  {time}
                </TimeSlot>
              ))}
            </TimeSlotList>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No available time slots for this date.
              </Typography>
            </Box>
          )}
        </TimeSlotSection>
      )}
      
      {/* Selected date & time display */}
      {selectedDate && selectedTime && (
        <SelectedTimeBox>
          <SelectedTimeLabel>Selected Date & Time:</SelectedTimeLabel>
          <SelectedTimeValue>{getFormattedSelectedDateTime()}</SelectedTimeValue>
        </SelectedTimeBox>
      )}
      
      {/* Booking form */}
      {selectedDate && selectedTime && (
        <>
          <TimeSlotTitle sx={{ mt: 3 }}>Booking Details</TimeSlotTitle>
          
          <FormField>
            <FieldLabel>Topic*</FieldLabel>
            <TextField
              fullWidth
              placeholder="Enter the topic you'd like to discuss"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              variant="outlined"
              size="small"
            />
          </FormField>
          
          <FormField>
            <FieldLabel>Message (Optional)</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Provide additional details about what you'd like to discuss"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="outlined"
              size="small"
            />
          </FormField>
          
          <Box mt={3}>
            <BookButton 
              fullWidth 
              disabled={!isFormValid || isSubmitting} 
              onClick={handleSubmitBooking}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Processing...' : 'Book Session'}
            </BookButton>
          </Box>
        </>
      )}
    </CalendarContainer>
  );
}; 