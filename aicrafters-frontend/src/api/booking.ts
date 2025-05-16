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

interface BookingUpdateData {
  status?: string;
  notes?: {
    mentorNotes?: string;
    sharedNotes?: string;
  };
  meetingLink?: string;
  [key: string]: any;
}

// Book a session with a mentor
export const createBooking = async (bookingData: BookingData) => {
  const response = await axiosInstance.post('/api/bookings', bookingData);
  return response.data;
};

// Get all bookings for the current user (mentee view)
export const getUserBookings = async () => {
  const response = await axiosInstance.get('/api/bookings');
  return response.data;
};

// Get specific booking details (mentee view)
export const getUserBookingDetails = async (bookingId: string) => {
  const response = await axiosInstance.get(`/api/bookings/${bookingId}`);
  return response.data;
};

// Cancel a booking (mentee view)
export const cancelUserBooking = async (bookingId: string, reason: string) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

// Get available time slots for a mentor on a specific date
export const getMentorAvailableSlots = async (mentorId: string, date: string) => {
  try {
    console.log(`Fetching available slots for mentor ${mentorId} on date ${date}`);
    const response = await axiosInstance.get(`/api/bookings/availability/${mentorId}`, {
      params: { date }
    });
    console.log('Available slots response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Rate and review a completed session
export const rateBooking = async (bookingId: string, rating: number, review: string) => {
  const response = await axiosInstance.post(`/api/bookings/${bookingId}/review`, { rating, review });
  return response.data;
};

// Get all bookings for a mentor
export const getMentorBookings = async () => {
  const response = await axiosInstance.get('/api/bookings/mentor');
  return response.data;
};

// Get specific booking details (mentor view)
export const getMentorBookingDetails = async (bookingId: string) => {
  const response = await axiosInstance.get(`/api/bookings/mentor/${bookingId}`);
  return response.data;
};

// Update booking details (mentor only)
export const updateBooking = async (bookingId: string, updateData: BookingUpdateData) => {
  const response = await axiosInstance.put(`/api/bookings/mentor/${bookingId}`, updateData);
  return response.data;
};

// Complete a booking (mentor only)
export const completeBooking = async (bookingId: string) => {
  const response = await axiosInstance.post(`/api/bookings/mentor/${bookingId}/complete`);
  return response.data;
};

// Cancel a booking (mentor view)
export const cancelMentorBooking = async (bookingId: string, reason: string) => {
  const response = await axiosInstance.post(`/api/bookings/mentor/${bookingId}/cancel`, { reason: reason });
  return response.data;
}; 