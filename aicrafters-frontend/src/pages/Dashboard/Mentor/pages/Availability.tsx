import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  TextField,
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
} from '@mui/material';
import styled from 'styled-components';
import InfoIcon from '@mui/icons-material/Info';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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

export const Availability: React.FC = () => {
  const theme = useTheme();
  const [timeZone, setTimeZone] = useState('Casablanca (GMT+1)');
  const [sessionDuration, setSessionDuration] = useState('30 minutes');
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
    const firstDayOfWeek = new Date(date);
    firstDayOfWeek.setDate(date.getDate() - date.getDay() + 1); // Start with Monday
    return firstDayOfWeek.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Get current week's availability slots
  const getCurrentWeekAvailability = (): {[key: string]: boolean} => {
    const weekKey = getCurrentWeekKey();
    return availabilityByWeek[weekKey] || {};
  };

  // Update current week's availability
  const updateCurrentWeekAvailability = (newSlots: {[key: string]: boolean}) => {
    const weekKey = getCurrentWeekKey();
    setAvailabilityByWeek(prev => ({
      ...prev,
      [weekKey]: newSlots
    }));
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
      setSnackbarMessage('Invalid time range. Start time must be earlier than end time.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Apply the time range based on weekday option
    applyToWeekdays();
    
    // Show success feedback
    setUpdateRangeSuccess(true);
    setSnackbarMessage('Time range updated successfully!');
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
    setSnackbarMessage(`Time slot ${newState ? 'selected' : 'unselected'}: ${day} at ${time}`);
    setSnackbarSeverity(newState ? 'success' : 'info');
    setSnackbarOpen(true);
  };

  // Clear all slots for current week
  const handleClearAllSlots = () => {
    updateCurrentWeekAvailability({});
    setSnackbarMessage('All availability slots cleared for current week');
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
      if (currentlyDraggedCells.length > 1) {
        setSnackbarMessage(`${currentlyDraggedCells.length} time slots ${selectingState ? 'selected' : 'unselected'}`);
        setSnackbarSeverity(selectingState ? 'success' : 'info');
        setSnackbarOpen(true);
      }
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

  // Save availability handler
  const handleSaveAvailability = () => {
    // In a real app, you would save to the backend here
    setSnackbarMessage('Availability saved successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
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
      <Container>
        <SectionTitle variant="h5">
          Set Your Availability
        </SectionTitle>
        <SectionDescription variant="body1">
          Define when you're available for mentorship sessions. You can adjust these settings anytime.
        </SectionDescription>

        <FormRow>
          <FormLabel>Time Zone:</FormLabel>
          <FormControl sx={{ minWidth: 240 }}>
            <Select
              value={timeZone}
              onChange={handleTimeZoneChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="Casablanca (GMT+1)">Casablanca (GMT+1)</MenuItem>
              <MenuItem value="London (GMT+0)">London (GMT+0)</MenuItem>
              <MenuItem value="New York (GMT-5)">New York (GMT-5)</MenuItem>
              <MenuItem value="Los Angeles (GMT-8)">Los Angeles (GMT-8)</MenuItem>
              <MenuItem value="Tokyo (GMT+9)">Tokyo (GMT+9)</MenuItem>
            </Select>
          </FormControl>
        </FormRow>

        <SectionTitle variant="h6">
          Session Duration
        </SectionTitle>
        
        <FormRow>
          <FormLabel>Default session length:</FormLabel>
          <FormControl sx={{ minWidth: 240 }}>
            <Select
              value={sessionDuration}
              onChange={handleSessionDurationChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="15 minutes">15 minutes</MenuItem>
              <MenuItem value="30 minutes">30 minutes</MenuItem>
              <MenuItem value="45 minutes">45 minutes</MenuItem>
              <MenuItem value="60 minutes">1 hour</MenuItem>
              <MenuItem value="90 minutes">1.5 hours</MenuItem>
            </Select>
          </FormControl>
        </FormRow>

        <SectionTitle variant="h6">
          Weekly Schedule Configuration
        </SectionTitle>
        
        {/* Week Selector */}
        <WeekSelectorContainer>
          <Tooltip title="Previous Week">
            <WeekNavigationButton onClick={handlePreviousWeek}>
              <ArrowBackIosNewIcon fontSize="small" />
            </WeekNavigationButton>
          </Tooltip>
          
          <WeekDisplay variant="body1">
            <CalendarTodayIcon fontSize="small" />
            {formatDateRange(currentWeek)}
          </WeekDisplay>
          
          <Tooltip title="Next Week">
            <WeekNavigationButton onClick={handleNextWeek}>
              <ArrowForwardIosIcon fontSize="small" />
            </WeekNavigationButton>
          </Tooltip>
          
          <Button 
            size="small" 
            onClick={handleCurrentWeek} 
            sx={{ ml: 2, fontSize: '0.8rem' }}
          >
            Current Week
          </Button>
        </WeekSelectorContainer>
        
        <TimeRangeContainer>
          <FormLabel>Start Time:</FormLabel>
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
          
          <FormLabel>End Time:</FormLabel>
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
              Updated!
            </UpdateButtonSuccess>
          ) : (
            <UpdateButton 
              variant="contained" 
              onClick={handleUpdateTimeRange}
            >
              Update Time Range
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
              <Typography variant="body2">Apply to all weekdays (Mon-Fri)</Typography>
            </RadioOption>
            <RadioOption>
              <Radio value="alldays" />
              <Typography variant="body2">Apply to entire week (Mon-Sun)</Typography>
            </RadioOption>
          </RadioGroup>
          
          <ClearButton 
            variant="text" 
            color="error" 
            onClick={handleClearAllSlots}
          >
            Clear All Slots
          </ClearButton>
        </Box>
        
        <LegendContainer>
          <LegendItem>
            <ColorBox $color="rgba(63, 81, 181, 0.35)" />
            <Typography variant="body2">Available</Typography>
          </LegendItem>
          <LegendItem>
            <ColorBox $color="transparent" />
            <Typography variant="body2">Unavailable</Typography>
          </LegendItem>
          <LegendItem>
            <DragIndicatorIcon fontSize="small" color="action" />
            <Typography variant="body2">Drag to select multiple slots</Typography>
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
                  <WeekdayCell key={day}>{day}</WeekdayCell>
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
            Click on a slot to toggle availability, or click and drag to select multiple slots at once.
          </Typography>
        </InfoCircle>
      </Container>

      <Container>
        <SectionTitle variant="h6">
          What mentorship format do you accept?
        </SectionTitle>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox 
                checked={mentorshipFormats.oneOnOne}
                onChange={() => handleMentorshipFormatChange('oneOnOne')}
              />
            }
            label="1-on-1 Sessions"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={mentorshipFormats.smallGroup}
                onChange={() => handleMentorshipFormatChange('smallGroup')}
              />
            }
            label="Small Group (2-3 mentees)"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={mentorshipFormats.officeHours}
                onChange={() => handleMentorshipFormatChange('officeHours')}
              />
            }
            label="Office Hours (Drop-in)"
          />
        </FormGroup>
      </Container>

      <ButtonContainer>
        <CancelButton variant="outlined">
          Cancel
        </CancelButton>
        <SaveButton 
          variant="contained"
          onClick={handleSaveAvailability}
        >
          Save Availability
        </SaveButton>
      </ButtonContainer>

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