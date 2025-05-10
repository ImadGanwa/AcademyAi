import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
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

interface BookingCalendarProps {
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: string | null) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  onDateSelect, 
  onTimeSelect,
  selectedDate,
  selectedTime
}) => {
  const navigate = useNavigate();
  const { mentorId } = useParams<{ mentorId: string }>();
  
  // Current display month/year
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Time slot options
  const timeSlots = [
    '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM'
  ];
  
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
        isPrevMonth: true,
        isNextMonth: false,
        isCurrentMonth: false
      })
    );
    
    // Current month days
    const currentMonthDays = Array.from(
      { length: daysInCurrentMonth },
      (_, i) => ({
        day: i + 1,
        isPrevMonth: false,
        isNextMonth: false,
        isCurrentMonth: true
      })
    );
    
    // Calculate how many days needed from next month
    const totalDaysDisplayed = Math.ceil((firstDayOfMonth + daysInCurrentMonth) / 7) * 7;
    const nextMonthDays = Array.from(
      { length: totalDaysDisplayed - (prevMonthDays.length + currentMonthDays.length) },
      (_, i) => ({
        day: i + 1,
        isPrevMonth: false,
        isNextMonth: true,
        isCurrentMonth: false
      })
    );
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const calendarData = generateCalendarData();
  
  // Check if a date is today
  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a date is the selected date
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
    
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(newDate);
  };
  
  // Format selected date and time for display
  const getFormattedSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return null;
    
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `${formattedDate}, at ${selectedTime}`;
  };
  
  // Handle booking submission
  const handleBookSession = () => {
    if (selectedDate && selectedTime) {
      // Get the current language from the URL
      const lang = window.location.pathname.split('/')[1] || 'en';
      
      // Navigate to confirmation page with proper language prefix and selected date and time
      navigate(`/${lang}/mentorship/confirmation/${mentorId}`, {
        state: {
          selectedDate,
          selectedTime,
          duration: 30 // Default session duration
        }
      });
    }
  };
  
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
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <Weekday key={day}>{day}</Weekday>
          ))}
        </WeekdaysRow>
        
        <DaysGrid>
          {calendarData.map((dateObj, index) => (
            <DayCell
              key={index}
              onClick={() => handleDateSelect(dateObj.day, dateObj.isCurrentMonth)}
              isselected={isSelectedDate(dateObj.day, dateObj.isCurrentMonth) ? 'true' : 'false'}
              istoday={isToday(dateObj.day, dateObj.isCurrentMonth) ? 'true' : 'false'}
              iscurrentmonth={dateObj.isCurrentMonth ? 'true' : 'false'}
              isprevmonth={dateObj.isPrevMonth ? 'true' : 'false'}
              isnextmonth={dateObj.isNextMonth ? 'true' : 'false'}
              disabled={!dateObj.isCurrentMonth}
            >
              {dateObj.day}
            </DayCell>
          ))}
        </DaysGrid>
      </CalendarWrapper>
      
      {selectedDate && (
        <TimeSlotSection>
          <TimeSlotTitle>Available Time Slots</TimeSlotTitle>
          <TimeSlotList>
            {timeSlots.map(time => (
              <TimeSlot
                key={time}
                onClick={() => onTimeSelect(time)}
                isselected={time === selectedTime ? 'true' : 'false'}
              >
                {time}
              </TimeSlot>
            ))}
          </TimeSlotList>
        </TimeSlotSection>
      )}
      
      {selectedDate && selectedTime && (
        <SelectedTimeBox>
          <SelectedTimeLabel>Time Slot Selected</SelectedTimeLabel>
          <SelectedTimeValue>{getFormattedSelectedDateTime()}</SelectedTimeValue>
        </SelectedTimeBox>
      )}
      
      <BookButton
        fullWidth
        disabled={!selectedDate || !selectedTime}
        onClick={handleBookSession}
      >
        Book a session
      </BookButton>
    </CalendarContainer>
  );
}; 