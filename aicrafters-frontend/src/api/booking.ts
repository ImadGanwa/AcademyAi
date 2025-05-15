import axiosInstance from './axiosInstance';

interface BookingData {
  mentorId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  message?: string;
  [key: string]: any;
}

// Book a session with a mentor
export const createBooking = async (bookingData: BookingData) => {
  const response = await axiosInstance.post('/bookings', bookingData);
  return response.data;
};

// Get all bookings for the current user (mentee view)
export const getUserBookings = async () => {
  const response = await axiosInstance.get('/bookings');
  return response.data;
};

// Get specific booking details (mentee view)
export const getUserBookingDetails = async (bookingId: string) => {
  const response = await axiosInstance.get(`/bookings/${bookingId}`);
  return response.data;
};

// Cancel a booking (mentee view)
export const cancelUserBooking = async (bookingId: string, reason: string) => {
  const response = await axiosInstance.post(`/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

// Get available time slots for a mentor on a specific date
export const getMentorAvailableSlots = async (mentorId: string, date: string) => {
  const response = await axiosInstance.get(`/bookings/availability/${mentorId}`, {
    params: { date }
  });
  return response.data;
};

// Rate and review a completed session
export const rateBooking = async (bookingId: string, rating: number, review: string) => {
  const response = await axiosInstance.post(`/bookings/${bookingId}/review`, { rating, review });
  return response.data;
}; 