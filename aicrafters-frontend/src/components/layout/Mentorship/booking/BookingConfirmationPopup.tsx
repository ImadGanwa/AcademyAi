import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  CircularProgress, 
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import styled from 'styled-components';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import TopicIcon from '@mui/icons-material/Topic';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SuccessIcon = styled(CheckCircleOutlineIcon)`
  font-size: 60px;
  color: ${props => props.theme.palette.success.main};
  margin-bottom: 16px;
`;

const BookingDetail = styled(Box)`
  display: flex;
  align-items: center;
  margin: 12px 0;
`;

const DetailIcon = styled(Box)`
  margin-right: 16px;
  color: ${props => props.theme.palette.primary.main};
`;

interface BookingConfirmationPopupProps {
  open: boolean;
  onClose: () => void;
  bookingDetails: {
    mentorName?: string;
    date?: string;
    startTime?: string;
    topic?: string;
  };
  isLoading?: boolean;
  error?: string | null;
}

const BookingConfirmationPopup: React.FC<BookingConfirmationPopupProps> = ({
  open,
  onClose,
  bookingDetails,
  isLoading = false,
  error = null
}) => {
  const theme = useTheme();

  // Format the date if available
  const formattedDate = bookingDetails.date 
    ? new Date(bookingDetails.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    : '';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="booking-confirmation-dialog-title"
    >
      <DialogTitle id="booking-confirmation-dialog-title" sx={{ pb: 1 }}>
        Booking Confirmation
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="error" variant="h6" gutterBottom>
              Error Creating Booking
            </Typography>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <SuccessIcon />
            <Typography variant="h5" gutterBottom>
              Your booking is confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your request has been sent to the mentor and is awaiting their approval.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'left', my: 3 }}>
              <Typography variant="h6" gutterBottom>
                Booking Details
              </Typography>
              
              {bookingDetails.mentorName && (
                <BookingDetail>
                  <DetailIcon>
                    <PersonIcon />
                  </DetailIcon>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mentor
                    </Typography>
                    <Typography variant="body1">
                      {bookingDetails.mentorName}
                    </Typography>
                  </Box>
                </BookingDetail>
              )}
              
              {formattedDate && (
                <BookingDetail>
                  <DetailIcon>
                    <CalendarTodayIcon />
                  </DetailIcon>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {formattedDate}
                    </Typography>
                  </Box>
                </BookingDetail>
              )}
              
              {bookingDetails.startTime && (
                <BookingDetail>
                  <DetailIcon>
                    <AccessTimeIcon />
                  </DetailIcon>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1">
                      {bookingDetails.startTime}
                    </Typography>
                  </Box>
                </BookingDetail>
              )}
              
              {bookingDetails.topic && (
                <BookingDetail>
                  <DetailIcon>
                    <TopicIcon />
                  </DetailIcon>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Topic
                    </Typography>
                    <Typography variant="body1">
                      {bookingDetails.topic}
                    </Typography>
                  </Box>
                </BookingDetail>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You will receive a notification once the mentor approves your booking. 
              You can view all your bookings in your dashboard.
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary" 
          fullWidth
          disabled={isLoading}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingConfirmationPopup; 