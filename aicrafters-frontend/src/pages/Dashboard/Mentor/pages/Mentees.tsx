import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Pagination,
  IconButton,
  Stack,
  useTheme,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import styled from 'styled-components';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VideocamIcon from '@mui/icons-material/Videocam';
import DoneIcon from '@mui/icons-material/Done';
import { getMentorBookings, updateBooking, cancelMentorBooking } from '../../../../api/booking';

const PageContainer = styled(Box)`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
`;

const PageHeader = styled(Box)`
  margin-bottom: 24px;
`;

const MenteeCard = styled(Card)`
  padding: 24px;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.palette.divider};
  position: relative;
  overflow: visible;
`;

const MenteeInfo = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const MenteeAvatar = styled(Avatar)`
  width: 64px !important;
  height: 64px !important;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MenteeDetails = styled(Box)`
  margin-left: 20px;
`;

const MenteeName = styled(Typography)`
  font-weight: 600;
  margin-bottom: 4px;
`;

const MenteeLocation = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const SessionTime = styled(Box)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
`;

const ActionButtons = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
`;

const PaginationContainer = styled(Box)`
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 16px;
`;

const ScheduleButton = styled(Button)`
  background-color: ${({ theme }) => theme.palette.secondary.main};
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const MessageButton = styled(Button)`
  color: ${({ theme }) => theme.palette.text.secondary};
  background-color: white;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 8px 16px;
  border-radius: 8px;
  text-transform: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const RejectButton = styled(Button)`
  color: ${({ theme }) => theme.palette.error.main};
  background-color: white;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 8px 16px;
  border-radius: 8px;
  text-transform: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const AcceptButton = styled(Button)`
  color: ${({ theme }) => theme.palette.success.main};
  background-color: white;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  padding: 8px 16px;
  border-radius: 8px;
  text-transform: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.success.light}20;
  }
`;

const SessionConfirmedDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
  }
`;

const SessionConfirmedContent = styled(DialogContent)`
  padding: 24px !important;
`;

const SessionDetailItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SessionDetailLabel = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
`;

const SessionDetailValue = styled(Typography)`
  font-weight: 500;
  text-align: right;
`;

const MeetingLinkContainer = styled(Paper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.palette.action.hover};
  margin: 16px 0;
`;

const MeetingLink = styled(Typography)`
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
`;

const CopyButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.primary.main};
  padding: 4px;
`;

const ConfirmButton = styled(Button)`
  background-color: ${({ theme }) => theme.palette.secondary.main};
  color: white;
  padding: 10px 0;
  border-radius: 8px;
  margin-top: 8px;
  
  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.dark};
  }
`;

const StatusStampContainer = styled(Box)`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusStamp = styled('img')<{ status: 'accepted' | 'rejected' }>`
  width: ${({ status }) => status === 'rejected' ? '120px' : '100px'};
  height: auto;
  transform: rotate(0deg);
  opacity: 0.8;
`;

interface Mentee {
  id: string;
  name: string;
  avatar: string;
  location: string;
  sessionTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  topic?: string;
  bookingId?: string;
}

// Utility function to generate a placeholder avatar with the first letter of the name
const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const Mentees: React.FC = () => {
  const theme = useTheme();
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState('60');
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isScheduling, setIsScheduling] = useState(true);
  const [meetingLink, setMeetingLink] = useState('');
  const [confirmationDetails, setConfirmationDetails] = useState({
    date: '',
    time: '',
    duration: '',
    timeZone: 'UTC+1 (Casablanca)',
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Updated state for real mentees/bookings data
  const [allMentees, setAllMentees] = useState<Mentee[]>([]);

  // Fetch mentee bookings from API
  useEffect(() => {
    const fetchMenteeBookings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get pending bookings for mentor using the booking service
        const response = await getMentorBookings('scheduled');
        
        if (response.success && response.data.bookings) {
          // Transform the booking data to match our Mentee interface
          const menteesFromBookings = response.data.bookings.map((booking: any) => {
            // Format date and time for display
            const scheduledDate = new Date(booking.scheduledAt);
            const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            
            const formattedDate = scheduledDate.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            
            return {
              id: booking.menteeId._id,
              name: booking.menteeId.fullName,
              avatar: booking.menteeId.profileImage || '',
              location: booking.menteeId.location || 'Location not provided',
              sessionTime: `${formattedTime} / ${formattedDate}`,
              status: booking.status === 'scheduled' ? 'accepted' : 'pending',
              topic: booking.topic,
              bookingId: booking._id
            };
          });
          
          setAllMentees(menteesFromBookings);
        }
      } catch (err: any) {
        console.error('Error fetching mentee bookings:', err);
        setError(err.response?.data?.error || 'Failed to load mentee data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenteeBookings();
  }, []);

  // Get current mentees based on pagination
  const indexOfLastMentee = page * itemsPerPage;
  const indexOfFirstMentee = indexOfLastMentee - itemsPerPage;
  const currentMentees = allMentees.slice(indexOfFirstMentee, indexOfLastMentee);
  const totalPages = Math.ceil(allMentees.length / itemsPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSessionAction = (mentee: Mentee) => {
    setSelectedMentee(mentee);
    // Clear form fields when opening the dialog
    setSelectedDate('');
    setSelectedTime('');
    setDuration('60');
    
    // Check if this is a scheduled session that needs to be rescheduled
    const hasExistingSession = mentee.sessionTime && mentee.sessionTime.length > 0;
    setIsScheduling(!hasExistingSession);
    
    if (hasExistingSession) {
      setOpenRescheduleDialog(true);
    } else {
      setOpenScheduleDialog(true);
    }
  };

  const handleCloseScheduleDialog = () => {
    setOpenScheduleDialog(false);
  };

  const handleDurationChange = (event: SelectChangeEvent) => {
    setDuration(event.target.value as string);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(event.target.value);
  };

  const formatConfirmationDetails = () => {
    // Format the date
    const date = new Date(selectedDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    // Format the time
    let formattedTime = '';
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const startTime = new Date();
      startTime.setHours(parseInt(hours));
      startTime.setMinutes(parseInt(minutes));
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(duration));
      
      const formatTimeValue = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true
        });
      };
      
      formattedTime = `${formatTimeValue(startTime)} - ${formatTimeValue(endTime)}`;
    }

    // Format duration
    const formattedDuration = `${duration}min`;

    return {
      date: formattedDate,
      time: formattedTime,
      duration: formattedDuration,
      timeZone: 'UTC+1 (Casablanca)'
    };
  };

  const generateMeetingLink = () => {
    // In a real app, this would generate a meeting link from your backend
    // For now, we'll create a dummy Zoom link
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `https://zoom.us/j/8745${randomId}XXX`;
  };

  const handleConfirmSchedule = () => {
    // Here you would save the scheduled session to your backend
    console.log('Scheduled session with:', selectedMentee);
    console.log('Date:', selectedDate);
    console.log('Time:', selectedTime);
    console.log('Duration:', duration);
    
    // Generate meeting details
    setConfirmationDetails(formatConfirmationDetails());
    setMeetingLink(generateMeetingLink());
    
    // Close the scheduling dialog and open the confirmation
    setOpenScheduleDialog(false);
    setOpenConfirmationDialog(true);
  };

  const handleMessage = (mentee: Mentee) => {
    // Navigate to messages with this mentee or open a message dialog
    console.log('Message mentee:', mentee);
  };

  const handleReject = async (mentee: Mentee) => {
    try {
      // Call API to reject the booking using the booking service
      const response = await cancelMentorBooking(mentee.bookingId!, 'Mentor is not available at this time');
      
      if (response.success) {
        // Update the mentee status in our local state
        const updatedMentees = allMentees.map(m => 
          m.id === mentee.id ? { ...m, status: 'rejected' as const } : m
        );
        setAllMentees(updatedMentees);
      }
    } catch (err: any) {
      console.error('Error rejecting booking:', err);
      alert(err.response?.data?.error || 'Failed to reject booking');
    }
  };

  const handleCloseRescheduleDialog = () => {
    setOpenRescheduleDialog(false);
  };

  const handleConfirmReschedule = () => {
    // Here you would update the scheduled session in your backend
    console.log('Rescheduled session with:', selectedMentee);
    console.log('New Date:', selectedDate);
    console.log('New Time:', selectedTime);
    console.log('New Duration:', duration);
    
    // Generate meeting details
    setConfirmationDetails(formatConfirmationDetails());
    setMeetingLink(generateMeetingLink());
    
    // Close the rescheduling dialog and open the confirmation
    setOpenRescheduleDialog(false);
    setOpenConfirmationDialog(true);
  };

  const handleAccept = async (mentee: Mentee) => {
    try {
      // Call API to accept the booking request using the booking service
      const response = await updateBooking(mentee.bookingId!, {
        status: 'scheduled'
      });
      
      if (response.success) {
        // Update the mentee status in our local state
        const updatedMentees = allMentees.map(m => 
          m.id === mentee.id ? { ...m, status: 'accepted' as const } : m
        );
        setAllMentees(updatedMentees);
        
        // Generate meeting details for confirmation
        setSelectedMentee(mentee);
        
        // Generate a default date and time based on the booking
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
        setSelectedTime('10:00');
        setDuration('30');
        
        setTimeout(() => {
          setConfirmationDetails(formatConfirmationDetails());
          setMeetingLink(generateMeetingLink());
          setOpenConfirmationDialog(true);
        }, 0);
      }
    } catch (err: any) {
      console.error('Error accepting booking:', err);
      alert(err.response?.data?.error || 'Failed to accept booking');
    }
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmationDialog(false);
    setLinkCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink).then(() => {
      setLinkCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleConfirmSession = async () => {
    if (selectedMentee && selectedMentee.bookingId) {
      try {
        // Update the booking with meeting link using the booking service
        const response = await updateBooking(selectedMentee.bookingId, {
          meetingLink
        });
        
        if (response.success) {
          // Update the mentee's status to accepted
          const updatedMentees = allMentees.map(mentee => 
            mentee.id === selectedMentee.id 
              ? { ...mentee, status: 'accepted' as const } 
              : mentee
          );
          
          setAllMentees(updatedMentees);
          setOpenConfirmationDialog(false);
        }
      } catch (err: any) {
        console.error('Error updating meeting link:', err);
        alert(err.response?.data?.error || 'Failed to update meeting link');
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <Typography variant="h4" gutterBottom>
          Your Mentees
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your mentorship connections and schedule sessions
        </Typography>
      </PageHeader>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : allMentees.length === 0 ? (
        <Alert severity="info">
          You don't have any mentee requests or bookings yet.
        </Alert>
      ) : (
        currentMentees.map((mentee) => (
          <MenteeCard key={mentee.id}>
            {mentee.status === 'accepted' && (
              <StatusStampContainer>
                <StatusStamp status="accepted" src="/accepted.avif" alt="Accepted" />
              </StatusStampContainer>
            )}
            {mentee.status === 'rejected' && (
              <StatusStampContainer>
                <StatusStamp status="rejected" src="/refused.avif" alt="Rejected" />
              </StatusStampContainer>
            )}
            <MenteeInfo>
              <MenteeAvatar 
                src={mentee.avatar} 
                alt={mentee.name}
              >
                {getInitials(mentee.name)}
              </MenteeAvatar>
              <MenteeDetails>
                <MenteeName variant="h6">{mentee.name}</MenteeName>
                <MenteeLocation>{mentee.location}</MenteeLocation>
                <SessionTime>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 1 }} />
                  {mentee.sessionTime}
                </SessionTime>
                {mentee.topic && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Topic:</strong> {mentee.topic}
                  </Typography>
                )}
              </MenteeDetails>
            </MenteeInfo>
            <Divider sx={{ my: 2 }} />
            <ActionButtons>
              {mentee.status === 'pending' && (
                <>
                  <RejectButton
                    onClick={() => handleReject(mentee)}
                    startIcon={<CloseIcon />}
                  >
                    Reject
                  </RejectButton>
                  <AcceptButton
                    onClick={() => handleAccept(mentee)}
                    startIcon={<CheckCircleIcon />}
                  >
                    Accept
                  </AcceptButton>
                </>
              )}
              <MessageButton
                onClick={() => handleMessage(mentee)}
                startIcon={<ChatIcon />}
              >
                Message
              </MessageButton>
              <ScheduleButton
                onClick={() => handleSessionAction(mentee)}
                startIcon={<CalendarTodayIcon />}
              >
                {mentee.sessionTime ? 'Reschedule Session' : 'Schedule Session'}
              </ScheduleButton>
            </ActionButtons>
          </MenteeCard>
        ))
      )}

      {!loading && !error && totalPages > 1 && (
        <PaginationContainer>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
            showFirstButton 
            showLastButton
          />
        </PaginationContainer>
      )}

      {/* Schedule/Reschedule Session Dialogs */}
      <Dialog open={openScheduleDialog} onClose={handleCloseScheduleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Schedule Mentorship Session
          <IconButton
            aria-label="close"
            onClick={handleCloseScheduleDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMentee && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar src={selectedMentee.avatar} alt={selectedMentee.name}>
                  {getInitials(selectedMentee.name)}
                </Avatar>
                <Typography variant="subtitle1">
                  Schedule a session with {selectedMentee.name}
                </Typography>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Session Date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Session Time"
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Session Duration</InputLabel>
                    <Select
                      value={duration}
                      label="Session Duration"
                      onChange={handleDurationChange}
                    >
                      <MenuItem value="30">30 minutes</MenuItem>
                      <MenuItem value="60">1 hour</MenuItem>
                      <MenuItem value="90">1.5 hours</MenuItem>
                      <MenuItem value="120">2 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Session Notes (Optional)"
                    multiline
                    rows={4}
                    placeholder="Add any notes or topics to discuss during the session"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleCloseScheduleDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSchedule} 
            variant="contained" 
            color="primary"
            disabled={!selectedDate || !selectedTime}
          >
            Schedule Session
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRescheduleDialog} onClose={handleCloseRescheduleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reschedule Mentorship Session
          <IconButton
            aria-label="close"
            onClick={handleCloseRescheduleDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMentee && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar src={selectedMentee.avatar} alt={selectedMentee.name}>
                  {getInitials(selectedMentee.name)}
                </Avatar>
                <Typography variant="subtitle1">
                  Reschedule session with {selectedMentee.name}
                </Typography>
              </Stack>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Currently scheduled for: {selectedMentee.sessionTime}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Session Date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Session Time"
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Session Duration</InputLabel>
                    <Select
                      value={duration}
                      label="Session Duration"
                      onChange={handleDurationChange}
                    >
                      <MenuItem value="30">30 minutes</MenuItem>
                      <MenuItem value="60">1 hour</MenuItem>
                      <MenuItem value="90">1.5 hours</MenuItem>
                      <MenuItem value="120">2 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Rescheduling (Optional)"
                    multiline
                    rows={4}
                    placeholder="Explain why you need to reschedule this session"
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleCloseRescheduleDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmReschedule} 
            variant="contained" 
            color="primary"
            disabled={!selectedDate || !selectedTime}
          >
            Confirm Reschedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Confirmed Dialog */}
      <SessionConfirmedDialog 
        open={openConfirmationDialog} 
        onClose={handleCloseConfirmation}
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, padding: '20px 24px' }}>
          {selectedMentee ? `Confirm Session with ${selectedMentee.name}` : 'Confirm Session'}
          <IconButton
            aria-label="close"
            onClick={handleCloseConfirmation}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <SessionConfirmedContent>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Session Details
          </Typography>
          
          <SessionDetailItem>
            <SessionDetailLabel>Date:</SessionDetailLabel>
            <SessionDetailValue>{confirmationDetails.date}</SessionDetailValue>
          </SessionDetailItem>
          
          <SessionDetailItem>
            <SessionDetailLabel>Time:</SessionDetailLabel>
            <SessionDetailValue>{confirmationDetails.time}</SessionDetailValue>
          </SessionDetailItem>
          
          <SessionDetailItem>
            <SessionDetailLabel>Duration:</SessionDetailLabel>
            <SessionDetailValue>{confirmationDetails.duration}</SessionDetailValue>
          </SessionDetailItem>
          
          <SessionDetailItem>
            <SessionDetailLabel>Time Zone:</SessionDetailLabel>
            <SessionDetailValue>{confirmationDetails.timeZone}</SessionDetailValue>
          </SessionDetailItem>
          
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 3 }}>
            Meeting Link
          </Typography>
          
          <MeetingLinkContainer>
            <MeetingLink>{meetingLink}</MeetingLink>
            <Tooltip title={linkCopied ? "Copied!" : "Copy Link"} placement="top">
              <CopyButton onClick={handleCopyLink}>
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Tooltip>
          </MeetingLinkContainer>
          
          <Typography variant="caption" color="text.secondary">
            This link will be shared with the mentee once you confirm.
          </Typography>
          
          <ConfirmButton
            fullWidth
            variant="contained"
            startIcon={<VideocamIcon />}
            onClick={handleConfirmSession}
          >
            Confirm Session
          </ConfirmButton>
        </SessionConfirmedContent>
      </SessionConfirmedDialog>
    </PageContainer>
  );
}; 