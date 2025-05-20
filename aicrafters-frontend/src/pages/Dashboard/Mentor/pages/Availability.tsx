import React, { useState,  useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  RadioGroup,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  useTheme,
  Tooltip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import styled from 'styled-components';
import InfoIcon from '@mui/icons-material/Info';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { getMentorAvailability, updateMentorAvailability } from '../../../../api/mentor';
import { useTranslation } from 'react-i18next';

const Container = styled(Paper)`
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
`;

const SectionTitle = styled(Typography)`
  font-weight: 600;
  margin-bottom: 16px;
`;

const SectionDescription = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 24px;
`;

const FormRow = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const FormLabel = styled(Typography)`
  min-width: 120px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const TimeRangeContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const UpdateButton = styled(Button)`
  background-color: ${({ theme }) => theme.palette.secondary.main};
  color: white;
  padding: 6px 16px;
  border-radius: 4px;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const RadioOption = styled(Box)`
  display: flex;
  align-items: center;
  margin-right: 24px;
`;

const InfoCircle = styled(Box)`
  display: flex;
  align-items: center;
  font-size: 14px;
  gap: 4px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-top: 8px;
`;

const CancelButton = styled(Button)`
  color: ${({ theme }) => theme.palette.text.secondary};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  margin-right: 16px;
`;

const SaveButton = styled(Button)`
  background-color: ${({ theme }) => theme.palette.secondary.main};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const LegendContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 16px;
`;

const LegendItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ColorBox = styled(Box)<{ $color: string }>`
  width: 16px;
  height: 16px;
  background-color: ${({ $color }) => $color};
  border-radius: 2px;
`;

const ClearButton = styled(Button)`
  color: ${({ theme }) => theme.palette.error.main};
  margin-left: auto;
`;

const ScheduleCell = styled(TableCell)<{ $available?: boolean; $selecting?: boolean; $dragging?: boolean }>`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 0;
  height: 32px;
  cursor: pointer;
  background-color: ${({ $available, $selecting, $dragging, theme }) => 
    $selecting ? `${theme.palette.primary.main}60` :
    $dragging ? `${theme.palette.primary.main}50` :
    $available ? 'rgba(63, 81, 181, 0.35)' : 'transparent'};
  transition: background-color 0.1s ease-in-out;
  
  &:hover {
    background-color: ${({ $available, theme }) => 
      $available ? 'rgba(63, 81, 181, 0.45)' : 'rgba(0, 0, 0, 0.08)'};
  }
`;

const TimeCell = styled(TableCell)`
  border: none;
  white-space: nowrap;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 13px;
  padding: 6px 16px;
  width: 100px;
  vertical-align: middle;
`;

const WeekdayCell = styled(TableCell)`
  text-align: center;
  font-weight: 500;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 8px;
`;

const ButtonContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
`;

// Define time slots and days
// TODO: Move hardcoded time slots to configuration to allow for customization
const timeSlots = [
  '9:00 AM', '9:30 AM', 
  '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', 
  '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
  '5:00 PM'
];

// TODO: Move hardcoded weekday names to i18n translations or configuration
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const UpdateButtonSuccess = styled(Button)`
  background-color: ${({ theme }) => theme.palette.success.main};
  color: white;
  padding: 6px 16px;
  border-radius: 4px;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.success.dark};
  }
`;

// Add week selector styled components
const WeekSelectorContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  padding: 8px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;

const WeekDisplay = styled(Typography)`
  font-weight: 500;
  margin: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WeekNavigationButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.secondary};
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

// Add a style for the cell click indicator
const CellClickIndicator = styled(Box)`
  position: absolute;
  top: -8px;
  left: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.primary.main};
  z-index: 2;
  transform: scale(0);
  opacity: 0;
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
  
  &.animate {
    transform: scale(3);
    opacity: 0;
  }
`;

// Modified AvailabilitySlot interface to include weekKey
interface AvailabilitySlot {
  day: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  weekKey?: string; // YYYY-MM-DD format to identify the week
}

// Day mapping for conversion between weekday names and numbers
const dayNameToNumber: { [key: string]: number } = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 0
};

const dayNumberToName: { [key: number]: string } = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  0: 'Sunday'
};

// Function to convert 12-hour format to 24-hour format
const convert12To24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// Function to convert 24-hour format to 12-hour format
const convert24To12Hour = (time24h: string): string => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  
  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${hour}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour - 12}:${minutes} PM`;
  }
};

export const Availability: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const theme = useTheme();
  const [timeZone, setTimeZone] = useState('Casablanca (GMT+1)'); // TODO: Use browser timezone or user preference instead of hardcoded default
  const [sessionDuration, setSessionDuration] = useState('30 minutes'); // TODO: Move default session duration to configuration
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('5:00 PM');
  const [weekdayOption, setWeekdayOption] = useState('weekdays');
  
  // Modified to store availability slots by week
  const [availabilityByWeek, setAvailabilityByWeek] = useState<{
    [weekKey: string]: {[slotKey: string]: boolean}
  }>({});
  
  const [mentorshipFormats, setMentorshipFormats] = useState({
    oneOnOne: true,
    smallGroup: false,
    officeHours: false,
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);
  const [dragEndCell, setDragEndCell] = useState<string | null>(null);
  const [currentlyDraggedCells, setCurrentlyDraggedCells] = useState<string[]>([]);
  const [selectingState, setSelectingState] = useState<boolean | null>(null);
  
  // UI feedback states
  const [updateRangeSuccess, setUpdateRangeSuccess] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('success');

  // Week selection state
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  // New state for click animation
  const [clickedCell, setClickedCell] = useState<string | null>(null);
  const [clickAnimating, setClickAnimating] = useState(false);

  // Add a flag to track if mouse has moved during drag
  const [hasMoved, setHasMoved] = useState(false);

  // Get current week key for storage
  const getCurrentWeekKey = (date: Date = currentWeek): string => {
    // Calculate Monday of the week (day 1)
    const mondayDate = new Date(date);
    const day = date.getDay() || 7; // Convert Sunday (0) to 7
    mondayDate.setDate(date.getDate() - day + 1); // 1 = Monday
    
    // Format as YYYY-MM-DD
    const year = mondayDate.getFullYear();
    const month = String(mondayDate.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(mondayDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  };

  // Get availability for a specific week
  const getWeekAvailability = (weekKey: string): {[key: string]: boolean} => {
    return availabilityByWeek[weekKey] || {};
  };

  // Get current week's availability slots
  const getCurrentWeekAvailability = (): {[key: string]: boolean} => {
    const weekKey = getCurrentWeekKey();
    console.log(`Getting availability for week key: ${weekKey}`);
    console.log('Available week keys in data:', Object.keys(availabilityByWeek));
    console.log('Current week availability:', availabilityByWeek[weekKey] || {});
    return getWeekAvailability(weekKey);
  };

  // Update availability for a specific week
  const updateWeekAvailability = (weekKey: string, newSlots: {[key: string]: boolean}) => {
    setAvailabilityByWeek(prev => ({
      ...prev,
      [weekKey]: newSlots
    }));
  };

  // Update current week's availability
  const updateCurrentWeekAvailability = (newSlots: {[key: string]: boolean}) => {
    const weekKey = getCurrentWeekKey();
    updateWeekAvailability(weekKey, newSlots);
  };

  // Handle time zone change
  const handleTimeZoneChange = (event: SelectChangeEvent) => {
    setTimeZone(event.target.value);
  };

  // Handle session duration change
  const handleSessionDurationChange = (event: SelectChangeEvent) => {
    setSessionDuration(event.target.value);
  };

  // Handle start time change
  const handleStartTimeChange = (event: SelectChangeEvent) => {
    setStartTime(event.target.value);
    // Reset the success indicator when changing time
    setUpdateRangeSuccess(false);
  };

  // Handle end time change
  const handleEndTimeChange = (event: SelectChangeEvent) => {
    setEndTime(event.target.value);
    // Reset the success indicator when changing time
    setUpdateRangeSuccess(false);
  };

  // Handle weekday option change
  const handleWeekdayOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWeekdayOption(event.target.value);
  };

  // Enhanced update time range functionality
  const handleUpdateTimeRange = () => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      setSnackbarMessage(t('mentorship.availability.error.invalidTimeRange', 'Invalid time range') as string);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Apply the time range based on weekday option
    applyToWeekdays();
    
    // Show success feedback
    setUpdateRangeSuccess(true);
    setSnackbarMessage(t('mentorship.availability.success.timeRangeUpdated', 'Time range updated') as string);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Reset success indicator after 2 seconds
    setTimeout(() => {
      setUpdateRangeSuccess(false);
    }, 2000);
  };

  // Enhanced cell click handler with visual feedback - ensure it works with left-click
  const handleCellClick = (day: string, time: string, event: React.MouseEvent) => {
    // Only process left clicks, not right clicks
    if (event.button !== 0) return;
    
    // Don't treat a drag operation as a click
    if (isDragging) return;
    
    const key = `${day}-${time}`;
    const currentAvailability = getCurrentWeekAvailability();
    const newState = !currentAvailability[key];
    
    // Set the clicked cell for animation
    setClickedCell(key);
    setClickAnimating(true);
    
    // Reset animation after it completes
    setTimeout(() => {
      setClickAnimating(false);
      setClickedCell(null);
    }, 300);
    
    // Update the availability state for current week
    const newAvailability = {
      ...currentAvailability,
      [key]: newState
    };
    updateCurrentWeekAvailability(newAvailability);
    
    // Provide some feedback
    setSnackbarMessage(
      newState 
        ? t('mentorship.availability.info.slotSelected', 'Slot selected') as string
        : t('mentorship.availability.info.slotUnselected', 'Slot unselected') as string
    );
    setSnackbarSeverity(newState ? 'success' : 'info');
    setSnackbarOpen(true);
  };

  // Clear all slots for current week
  const handleClearAllSlots = () => {
    updateCurrentWeekAvailability({});
    setSnackbarMessage(t('mentorship.availability.info.allSlotsCleared', 'All slots cleared') as string);
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  // Apply to weekdays or all days
  const applyToWeekdays = () => {
    const days = weekdayOption === 'weekdays' 
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      : weekdays;
      
    const currentAvailability = getCurrentWeekAvailability();
    const newSlots = { ...currentAvailability };
    
    // For each selected day and each time slot in the range
    days.forEach(day => {
      let startIndex = timeSlots.indexOf(startTime);
      let endIndex = timeSlots.indexOf(endTime);
      
      if (startIndex === -1) startIndex = 0;
      if (endIndex === -1) endIndex = timeSlots.length - 1;
      
      for (let i = startIndex; i < endIndex; i++) {
        const key = `${day}-${timeSlots[i]}`;
        newSlots[key] = true;
      }
    });
    
    updateCurrentWeekAvailability(newSlots);
  };

  // Mentorship format change handler
  const handleMentorshipFormatChange = (format: keyof typeof mentorshipFormats) => {
    setMentorshipFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  // Mouse down handler for drag start - ensure it works only with mouse down + move
  const handleMouseDown = (day: string, time: string, event: React.MouseEvent) => {
    // Only process left-button mouse down
    if (event.button !== 0) return;
    
    // Prevent default browser behavior that might interfere
    event.preventDefault();
    
    // Set up drag state
    const key = `${day}-${time}`;
    setIsDragging(true);
    setDragStartCell(key);
    setDragEndCell(key);
    
    const currentAvailability = getCurrentWeekAvailability();
    setSelectingState(!currentAvailability[key]);
    setCurrentlyDraggedCells([key]);
  };

  // Mouse enter handler - now tracks movement
  const handleMouseEnter = (day: string, time: string) => {
    if (!isDragging || !dragStartCell) return;
    
    // Since mouse has entered another cell, set hasMoved flag
    setHasMoved(true);
    
    const key = `${day}-${time}`;
    setDragEndCell(key);
    
    // Calculate the cells between start and end
    const [startDay, startTime] = dragStartCell.split('-');
    const [endDay, endTime] = key.split('-');
    
    const startDayIndex = weekdays.indexOf(startDay);
    const endDayIndex = weekdays.indexOf(endDay);
    const startTimeIndex = timeSlots.indexOf(startTime);
    const endTimeIndex = timeSlots.indexOf(endTime);
    
    if (startDayIndex === -1 || endDayIndex === -1 || startTimeIndex === -1 || endTimeIndex === -1) {
      return;
    }
    
    // Calculate the min and max indices to handle dragging in any direction
    const minDayIndex = Math.min(startDayIndex, endDayIndex);
    const maxDayIndex = Math.max(startDayIndex, endDayIndex);
    const minTimeIndex = Math.min(startTimeIndex, endTimeIndex);
    const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex);
    
    // Create array of cells in the selection rectangle
    const draggedCells: string[] = [];
    
    for (let d = minDayIndex; d <= maxDayIndex; d++) {
      for (let t = minTimeIndex; t <= maxTimeIndex; t++) {
        draggedCells.push(`${weekdays[d]}-${timeSlots[t]}`);
      }
    }
    
    setCurrentlyDraggedCells(draggedCells);
  };

  // Updated mouse up handler
  const handleMouseUp = (event: React.MouseEvent | MouseEvent) => {
    // Only process left-button releases
    if ('button' in event && event.button !== 0) return;
    
    if (!isDragging) return;
    
    // If mouse hasn't moved between down and up, treat as a click, not a drag
    if (!hasMoved && dragStartCell) {
      // The click handler will handle single cell selection
      setIsDragging(false);
      setDragStartCell(null);
      setDragEndCell(null);
      setCurrentlyDraggedCells([]);
      setSelectingState(null);
      setHasMoved(false);
      return;
    }
    
    // Apply drag selection if we have moved
    if (currentlyDraggedCells.length > 0) {
      // Apply the selection state to all dragged cells
      const currentAvailability = getCurrentWeekAvailability();
      const newSlots = { ...currentAvailability };
      
      currentlyDraggedCells.forEach(key => {
        newSlots[key] = selectingState || false;
      });
      
      updateCurrentWeekAvailability(newSlots);
      
      // Show feedback for multiple selection
      setSnackbarMessage(
        `${currentlyDraggedCells.length} ${t(selectingState ? 'mentorship.availability.slotsSelected' : 'mentorship.availability.slotsUnselected', 'Slots selected') as string}`
      );
      setSnackbarSeverity(selectingState ? 'success' : 'info');
      setSnackbarOpen(true);
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragStartCell(null);
    setDragEndCell(null);
    setCurrentlyDraggedCells([]);
    setSelectingState(null);
    setHasMoved(false);
  };

  // Add event listener for mouse up outside of cells and track mouse movement
  useEffect(() => {
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (isDragging) {
        handleMouseUp(event);
      }
    };
    
    const handleGlobalMouseMove = () => {
      if (isDragging) {
        setHasMoved(true);
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, currentlyDraggedCells, selectingState, hasMoved]);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Get availability from backend on component mount
  useEffect(() => {
    fetchMentorAvailability();
  }, []);

  // Fetch mentor availability from backend
  const fetchMentorAvailability = async () => {
    try {
      setIsLoading(true);
      const response = await getMentorAvailability();
      
      console.log('Fetched availability response:', response);
      
      // Extract availability data from the response structure
      const availabilityData = response?.data?.availability || [];
      
      if (Array.isArray(availabilityData)) {
        // Create a map to store availability by week
        const allWeeksAvailability: {[weekKey: string]: {[slotKey: string]: boolean}} = {};
        
        availabilityData.forEach((slot: AvailabilitySlot) => {
          const day = dayNumberToName[slot.day];
          if (!day) {
            console.warn('Unknown day number:', slot.day);
            return;
          }
          
          // Convert time format
          const startTime12h = convert24To12Hour(slot.startTime);
          const endTime12h = convert24To12Hour(slot.endTime);
          
          // Get or ensure proper week key format
          let weekKey = slot.weekKey;
          if (weekKey) {
            // Parse weekKey date and recalculate to ensure consistent formatting
            const weekKeyDate = new Date(weekKey);
            if (!isNaN(weekKeyDate.getTime())) {
              // Use our fixed getCurrentWeekKey function to ensure format consistency
              weekKey = getCurrentWeekKey(weekKeyDate);
            }
          } else {
            // If no weekKey, use the recurring weekly schedule (current week)
            weekKey = getCurrentWeekKey();
          }
          
          console.log(`Processing slot: Day ${slot.day} (${day}), Start: ${slot.startTime} (${startTime12h}), End: ${slot.endTime} (${endTime12h}), Week: ${weekKey}`);
          
          // Find all timeslots between start and end time
          const startIndex = timeSlots.indexOf(startTime12h);
          const endIndex = timeSlots.indexOf(endTime12h);
          
          console.log(`Start index: ${startIndex}, End index: ${endIndex}`);
          
          if (startIndex !== -1 && endIndex !== -1) {
            // Initialize the week if not already in the map
            if (!allWeeksAvailability[weekKey]) {
              allWeeksAvailability[weekKey] = {};
            }
            
            // Add all individual time slots to that week
            for (let i = startIndex; i < endIndex; i++) {
              const key = `${day}-${timeSlots[i]}`;
              allWeeksAvailability[weekKey][key] = true;
            }
          }
        });
        
        console.log('Created availability map by weeks:', allWeeksAvailability);
        
        // Update the state with all weeks' availability
        setAvailabilityByWeek(allWeeksAvailability);
      } else {
        console.warn('Received non-array availability data:', availabilityData);
      }
    } catch (error) {
      console.error('Error fetching mentor availability:', error);
      setSnackbarMessage(t('mentorship.availability.error.fetchFailed', 'Error fetching mentor availability') as string);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Save availability to backend
  const handleSaveAvailability = async () => {
    try {
      setIsSaving(true);
      
      // Get the current week key
      const weekKey = getCurrentWeekKey();
      
      // Convert our frontend format to backend format for current week
      const currentAvailability = getCurrentWeekAvailability();
      let availabilitySlots: AvailabilitySlot[] = [];
      
      // Create a map to group slots by day
      const slotsByDay: { [key: string]: { times: string[] } } = {};
      
      // Group slots by day
      Object.keys(currentAvailability).forEach(key => {
        if (currentAvailability[key]) {
          const [day, time] = key.split('-');
          if (!slotsByDay[day]) {
            slotsByDay[day] = { times: [] };
          }
          slotsByDay[day].times.push(time);
        }
      });
      
      // Process each day to create continuous slots
      Object.keys(slotsByDay).forEach(day => {
        const { times } = slotsByDay[day];
        
        // Sort times
        times.sort((a, b) => timeSlots.indexOf(a) - timeSlots.indexOf(b));
        
        let startSlot: string | null = null;
        let prevSlotIndex = -1;
        
        times.forEach(time => {
          const currentSlotIndex = timeSlots.indexOf(time);
          
          // Start a new slot if we don't have one or if there's a gap
          if (startSlot === null || currentSlotIndex !== prevSlotIndex + 1) {
            // If we had a slot, save it
            if (startSlot !== null) {
              // The end time is the next time slot after the last included slot
              const endTimeIndex = prevSlotIndex + 1;
              const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : null;
              
              if (endTime) {
                availabilitySlots.push({
                  day: dayNameToNumber[day],
                  startTime: convert12To24Hour(startSlot),
                  endTime: convert12To24Hour(endTime),
                  weekKey: weekKey // Store the week key
                });
              }
            }
            
            // Start a new slot
            startSlot = time;
          }
          
          prevSlotIndex = currentSlotIndex;
        });
        
        // Handle the last slot if there is one
        if (startSlot !== null) {
          const endTimeIndex = prevSlotIndex + 1;
          const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : null;
          
          if (endTime) {
            availabilitySlots.push({
              day: dayNameToNumber[day],
              startTime: convert12To24Hour(startSlot),
              endTime: convert12To24Hour(endTime),
              weekKey: weekKey // Store the week key
            });
          }
        }
      });
      
      // Include availability from other weeks as well
      Object.keys(availabilityByWeek).forEach(otherWeekKey => {
        // Skip current week as we already processed it
        if (otherWeekKey === weekKey) return;
        
        const weekAvailability = availabilityByWeek[otherWeekKey];
        if (!weekAvailability || Object.keys(weekAvailability).length === 0) return;
        
        // Create a map to group slots by day for this week
        const otherWeekSlotsByDay: { [key: string]: { times: string[] } } = {};
        
        // Group slots by day
        Object.keys(weekAvailability).forEach(key => {
          if (weekAvailability[key]) {
            const [day, time] = key.split('-');
            if (!otherWeekSlotsByDay[day]) {
              otherWeekSlotsByDay[day] = { times: [] };
            }
            otherWeekSlotsByDay[day].times.push(time);
          }
        });
        
        // Process each day for this week
        Object.keys(otherWeekSlotsByDay).forEach(day => {
          const { times } = otherWeekSlotsByDay[day];
          
          // Sort times
          times.sort((a, b) => timeSlots.indexOf(a) - timeSlots.indexOf(b));
          
          let startSlot: string | null = null;
          let prevSlotIndex = -1;
          
          times.forEach(time => {
            const currentSlotIndex = timeSlots.indexOf(time);
            
            // Start a new slot if we don't have one or if there's a gap
            if (startSlot === null || currentSlotIndex !== prevSlotIndex + 1) {
              // If we had a slot, save it
              if (startSlot !== null) {
                // The end time is the next time slot after the last included slot
                const endTimeIndex = prevSlotIndex + 1;
                const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : null;
                
                if (endTime) {
                  availabilitySlots.push({
                    day: dayNameToNumber[day],
                    startTime: convert12To24Hour(startSlot),
                    endTime: convert12To24Hour(endTime),
                    weekKey: otherWeekKey // Store the week key
                  });
                }
              }
              
              // Start a new slot
              startSlot = time;
            }
            
            prevSlotIndex = currentSlotIndex;
          });
          
          // Handle the last slot if there is one
          if (startSlot !== null) {
            const endTimeIndex = prevSlotIndex + 1;
            const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : null;
            
            if (endTime) {
              availabilitySlots.push({
                day: dayNameToNumber[day],
                startTime: convert12To24Hour(startSlot),
                endTime: convert12To24Hour(endTime),
                weekKey: otherWeekKey // Store the week key
              });
            }
          }
        });
      });
      
      console.log('Saving availability slots with week information:', availabilitySlots);
      
      // Call API to update availability - pass exactly what the backend expects
      await updateMentorAvailability({ availability: availabilitySlots });
      
      setSnackbarMessage(t('mentorship.availability.success.saveSuccess', 'Availability saved successfully') as string);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving mentor availability:', error);
      setSnackbarMessage(t('mentorship.availability.error.saveFailed', 'Error saving mentor availability') as string);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Format date for display
  const formatDateRange = (date: Date): string => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    
    const startMonth = startOfWeek.toLocaleString('default', { month: 'short' });
    const endMonth = endOfWeek.toLocaleString('default', { month: 'short' });
    
    const startDay = startOfWeek.getDate();
    const endDay = endOfWeek.getDate();
    const year = startOfWeek.getFullYear();
    
    // Format: "Jan 1 - Jan 7, 2023" or "Jan 31 - Feb 6, 2023"
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  // Add a useEffect to log and verify week changes
  useEffect(() => {
    const weekKey = getCurrentWeekKey();
    console.log(`Week changed to: ${weekKey}`);
    console.log('Current week availability after change:', availabilityByWeek[weekKey] || {});
  }, [currentWeek, availabilityByWeek]);

  // Navigate to previous week
  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  // Navigate to next week
  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  // Navigate to current week
  const handleCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Helper function to get cell position
  const getCellPosition = (cellKey: string | null): { top: number, left: number } | null => {
    if (!cellKey) return null;
    
    const cell = document.getElementById(`cell-${cellKey}`);
    if (!cell) return null;
    
    const rect = cell.getBoundingClientRect();
    return {
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2
    };
  };

  // Get current week's availability for rendering
  const currentWeekAvailability = getCurrentWeekAvailability();

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        {t('mentorship.availability.title', 'My Availability') as string}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('mentorship.availability.subtitle', 'Manage your availability for mentorship sessions') as string}
      </Typography>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            {t('mentorship.availability.loading', 'Loading your availability...') as string}
          </Typography>
        </Box>
      ) : (
        <>
          <Container>
            <SectionTitle variant="h5">
              {t('mentorship.availability.setAvailability', 'Set Your Availability') as string}
            </SectionTitle>
            <SectionDescription variant="body1">
              {t('mentorship.availability.defineAvailability', 'Define when you\'re available for mentorship sessions. You can adjust these settings anytime.') as string}
            </SectionDescription>

            <FormRow>
              <FormLabel>{t('mentor.dashboard.availability.timeZone', 'Time Zone:') as string}</FormLabel>
              <FormControl sx={{ minWidth: 240 }}>
                <Select
                  value={timeZone}
                  onChange={handleTimeZoneChange}
                  displayEmpty
                  size="small"
                >
                  {/* TODO: Move hardcoded timezones to configuration and include full list of world timezones */}
                  <MenuItem value="Casablanca (GMT+1)">{t('timezones.casablanca', 'Casablanca (GMT+1)') as string}</MenuItem>
                  <MenuItem value="London (GMT+0)">{t('timezones.london', 'London (GMT+0)') as string}</MenuItem>
                  <MenuItem value="New York (GMT-5)">{t('timezones.newYork', 'New York (GMT-5)') as string}</MenuItem>
                  <MenuItem value="Los Angeles (GMT-8)">{t('timezones.losAngeles', 'Los Angeles (GMT-8)') as string}</MenuItem>
                  <MenuItem value="Tokyo (GMT+9)">{t('timezones.tokyo', 'Tokyo (GMT+9)') as string}</MenuItem>
                </Select>
              </FormControl>
            </FormRow>

            <SectionTitle variant="h6">
              {t('mentor.dashboard.availability.sessionDuration', 'Session Duration') as string}
            </SectionTitle>
            
            <FormRow>
              <FormLabel>{t('mentor.dashboard.availability.defaultSessionLength', 'Default session length:') as string}</FormLabel>
              <FormControl sx={{ minWidth: 240 }}>
                <Select
                  value={sessionDuration}
                  onChange={handleSessionDurationChange}
                  displayEmpty
                  size="small"
                >
                  <MenuItem value="15 minutes">{t('durations.15min', '15 minutes') as string}</MenuItem>
                  <MenuItem value="30 minutes">{t('durations.30min', '30 minutes') as string}</MenuItem>
                  <MenuItem value="45 minutes">{t('durations.45min', '45 minutes') as string}</MenuItem>
                  <MenuItem value="60 minutes">{t('durations.60min', '1 hour') as string}</MenuItem>
                  <MenuItem value="90 minutes">{t('durations.90min', '1.5 hours') as string}</MenuItem>
                </Select>
              </FormControl>
            </FormRow>

            <SectionTitle variant="h6">
              {t('mentor.dashboard.availability.weeklyScheduleConfig', 'Weekly Schedule Configuration') as string}
            </SectionTitle>
            
            {/* Week Selector */}
            <WeekSelectorContainer>
              <Tooltip title={t('mentor.dashboard.availability.previousWeek', 'Previous Week') as string}>
                <WeekNavigationButton onClick={handlePreviousWeek}>
                  <ArrowBackIosNewIcon fontSize="small" />
                </WeekNavigationButton>
              </Tooltip>
              
              <WeekDisplay variant="body1">
                <CalendarTodayIcon fontSize="small" />
                {formatDateRange(currentWeek)}
              </WeekDisplay>
              
              <Tooltip title={t('mentor.dashboard.availability.nextWeek', 'Next Week') as string}>
                <WeekNavigationButton onClick={handleNextWeek}>
                  <ArrowForwardIosIcon fontSize="small" />
                </WeekNavigationButton>
              </Tooltip>
              
              <Button 
                size="small" 
                onClick={handleCurrentWeek} 
                sx={{ ml: 2, fontSize: '0.8rem' }}
              >
                {t('mentor.dashboard.availability.currentWeek', 'Current Week') as string}
              </Button>
            </WeekSelectorContainer>
            
            <TimeRangeContainer>
              <FormLabel>{t('mentor.dashboard.availability.startTime', 'Start Time:') as string}</FormLabel>
              <FormControl sx={{ width: 140 }}>
                <Select
                  value={startTime}
                  onChange={handleStartTimeChange}
                  displayEmpty
                  size="small"
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormLabel>{t('mentor.dashboard.availability.endTime', 'End Time:') as string}</FormLabel>
              <FormControl sx={{ width: 140 }}>
                <Select
                  value={endTime}
                  onChange={handleEndTimeChange}
                  displayEmpty
                  size="small"
                >
                  {timeSlots.map((time) => (
                    <MenuItem key={time} value={time}>{time}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {updateRangeSuccess ? (
                <UpdateButtonSuccess variant="contained">
                  {t('mentor.dashboard.availability.updated', 'Updated!') as string}
                </UpdateButtonSuccess>
              ) : (
                <UpdateButton 
                  variant="contained" 
                  onClick={handleUpdateTimeRange}
                >
                  {t('mentor.dashboard.availability.updateTimeRange', 'Update Time Range') as string}
                </UpdateButton>
              )}
            </TimeRangeContainer>
            
            <Box display="flex" alignItems="center" mb={3}>
              <RadioGroup 
                row 
                value={weekdayOption} 
                onChange={handleWeekdayOptionChange}
              >
                <RadioOption>
                  <Radio value="weekdays" />
                  <Typography variant="body2">{t('mentor.dashboard.availability.applyToWeekdays', 'Apply to all weekdays (Mon-Fri)') as string}</Typography>
                </RadioOption>
                <RadioOption>
                  <Radio value="alldays" />
                  <Typography variant="body2">{t('mentor.dashboard.availability.applyToAllDays', 'Apply to entire week (Mon-Sun)') as string}</Typography>
                </RadioOption>
              </RadioGroup>
              
              <ClearButton 
                variant="text" 
                color="error" 
                onClick={handleClearAllSlots}
              >
                {t('mentor.dashboard.availability.clearAllSlots', 'Clear All Slots') as string}
              </ClearButton>
            </Box>
            
            <LegendContainer>
              <LegendItem>
                <ColorBox $color="rgba(63, 81, 181, 0.35)" />
                <Typography variant="body2">{t('mentor.dashboard.availability.available', 'Available') as string}</Typography>
              </LegendItem>
              <LegendItem>
                <ColorBox $color="transparent" />
                <Typography variant="body2">{t('mentor.dashboard.availability.unavailable', 'Unavailable') as string}</Typography>
              </LegendItem>
              <LegendItem>
                <DragIndicatorIcon fontSize="small" color="action" />
                <Typography variant="body2">{t('mentor.dashboard.availability.dragToSelect', 'Drag to select multiple slots') as string}</Typography>
              </LegendItem>
            </LegendContainer>
            
            <TableContainer sx={{ position: 'relative' }}>
              {clickedCell && clickAnimating && (
                <CellClickIndicator 
                  className={clickAnimating ? 'animate' : ''}
                  sx={{ 
                    top: getCellPosition(clickedCell)?.top, 
                    left: getCellPosition(clickedCell)?.left 
                  }}
                />
              )}
              
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ border: 'none', width: '100px' }}></TableCell>
                    {weekdays.map((day) => (
                      <WeekdayCell key={day}>{t(`mentorship.availability.days.${day.toLowerCase()}`, day) as string}</WeekdayCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((time) => (
                    <TableRow key={time}>
                      <TimeCell>{time}</TimeCell>
                      {weekdays.map((day) => {
                        const cellKey = `${day}-${time}`;
                        const isSelected = currentlyDraggedCells.includes(cellKey);
                        
                        return (
                          <ScheduleCell 
                            id={`cell-${cellKey}`}
                            key={cellKey}
                            $available={currentWeekAvailability[cellKey]}
                            $selecting={isSelected && selectingState === true}
                            $dragging={isSelected && selectingState === false}
                            onClick={(e) => handleCellClick(day, time, e as React.MouseEvent)}
                            onMouseDown={(e) => handleMouseDown(day, time, e as React.MouseEvent)}
                            onMouseEnter={() => handleMouseEnter(day, time)}
                          />
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <InfoCircle>
              <InfoIcon fontSize="small" />
              <Typography variant="body2">
                {t('mentor.dashboard.availability.clickInstructions', 'Click on a slot to toggle availability, or click and drag to select multiple slots at once.') as string}
              </Typography>
            </InfoCircle>
          </Container>

          <Container>
            <SectionTitle variant="h6">
              {t('mentor.dashboard.availability.mentorshipFormatQuestion', 'What mentorship format do you accept?') as string}
            </SectionTitle>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={mentorshipFormats.oneOnOne}
                    onChange={() => handleMentorshipFormatChange('oneOnOne')}
                  />
                }
                label={t('mentor.dashboard.availability.oneOnOneSessions', '1-on-1 Sessions') as string}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={mentorshipFormats.smallGroup}
                    onChange={() => handleMentorshipFormatChange('smallGroup')}
                  />
                }
                label={t('mentor.dashboard.availability.smallGroup', 'Small Group (2-3 mentees)') as string}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={mentorshipFormats.officeHours}
                    onChange={() => handleMentorshipFormatChange('officeHours')}
                  />
                }
                label={t('mentor.dashboard.availability.officeHours', 'Office Hours (Drop-in)') as string}
              />
            </FormGroup>
          </Container>

          <ButtonContainer>
            <CancelButton variant="outlined">
              {t('mentor.dashboard.availability.cancel', 'Cancel') as string}
            </CancelButton>
            <SaveButton 
              variant="contained"
              onClick={handleSaveAvailability}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  {t('mentor.dashboard.availability.saving', 'Saving...') as string}
                </>
              ) : (
                t('mentor.dashboard.availability.saveAvailability', 'Save Availability') as string
              )}
            </SaveButton>
          </ButtonContainer>
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 