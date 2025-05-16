import axiosInstance from './axiosInstance';

// Define types for mentor-related data
interface MentorFilters {
  search?: string;
  category?: string;
  skill?: string;
  country?: string;
  language?: string;
  page?: number;
  limit?: number;
}

interface MentorApplicationData {
  bio: string;
  expertise: string[];
  experience: string;
  availability: any; // Complex type, adjust as needed
  hourlyRate: number;
  [key: string]: any; // Allow additional fields
}

interface MentorProfileData {
  bio?: string;
  expertise?: string[];
  experience?: string;
  availability?: any;
  hourlyRate?: number;
  profileImage?: File;
  removeProfileImage?: boolean;
  [key: string]: any; // Allow additional fields
}

// Interface for the availability slot shape that the backend expects
interface AvailabilitySlot {
  day: number;
  startTime: string;
  endTime: string;
}

interface MentorAvailabilityData {
  availability: AvailabilitySlot[];
  [key: string]: any; // Allow additional fields
}

// Get public list of mentors with optional filters
export const getPublicMentorList = async (filters: MentorFilters = {}) => {
  try {
    console.log('getPublicMentorList API call with filters:', filters);
    const response = await axiosInstance.get('/api/mentor/public/mentors', { params: filters });
    console.log('getPublicMentorList API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching public mentors:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Get public mentor profile by ID
export const getPublicMentorProfile = async (mentorId: string) => {
  try {
    console.log('getPublicMentorProfile API call for mentorId:', mentorId);
    const response = await axiosInstance.get(`/api/mentor/public/${mentorId}`);
    console.log('getPublicMentorProfile API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching public mentor profile for ID ${mentorId}:`, error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Apply to become a mentor
export const applyToBecomeMentor = async (applicationData: MentorApplicationData) => {
  try {
    console.log('Sending mentor application data:', applicationData);
    const response = await axiosInstance.post('/api/mentor/apply', applicationData);
    console.log('Mentor application response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in applyToBecomeMentor:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Get mentor profile (for authorized mentors)
export const getMentorProfile = async () => {
  try {
    console.log('getMentorProfile API call');
    const response = await axiosInstance.get('/api/mentor/profile');
    console.log('getMentorProfile API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching mentor profile:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Update mentor profile (for authorized mentors)
export const updateMentorProfile = async (profileData: MentorProfileData) => {
  try {
    console.log('updateMentorProfile API call with data:', profileData);
    
    // Use FormData to handle file uploads
    const formData = new FormData();
    
    // Add text fields to FormData
    Object.keys(profileData).forEach(key => {
      if (key !== 'profileImage') {
        // Special handling for skills array to ensure it's properly formatted
        if (key === 'skills') {
          console.log('Skills before stringify:', profileData[key]);
          // Make sure skills is passed as a JSON string with the proper format
          const skillsJson = JSON.stringify(profileData[key]);
          console.log('Skills after stringify:', skillsJson);
          formData.append(key, skillsJson);
        }
        // Handle other arrays or objects
        else if (Array.isArray(profileData[key]) || (typeof profileData[key] === 'object' && profileData[key] !== null)) {
          formData.append(key, JSON.stringify(profileData[key]));
        } 
        // Handle primitive values
        else if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, String(profileData[key]));
        }
      }
    });
    
    // Add profile image if it exists
    if (profileData.profileImage instanceof File) {
      formData.append('profileImage', profileData.profileImage);
      console.log('Adding profile image to form data:', profileData.profileImage.name);
    }
    
    // Add removeProfileImage flag if set
    if (profileData.removeProfileImage) {
      formData.append('removeProfileImage', 'true');
      console.log('Adding removeProfileImage flag to form data');
    }
    
    // Log the form data entries
    console.log('FormData created with fields:', Array.from(formData.entries()).map(entry => {
      if (entry[1] instanceof File) {
        return `${entry[0]}: [File: ${(entry[1] as File).name}]`;
      }
      return `${entry[0]}: ${entry[1]}`;
    }));
    
    const response = await axiosInstance.put('/api/mentor/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('updateMentorProfile API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating mentor profile:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Get mentor availability
export const getMentorAvailability = async () => {
  try {
    console.log('Calling getMentorAvailability API');
    const response = await axiosInstance.get('/api/mentor/availability');
    console.log('getMentorAvailability API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching mentor availability:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Update mentor availability
export const updateMentorAvailability = async (availabilityData: MentorAvailabilityData) => {
  const response = await axiosInstance.put('/api/mentor/availability', availabilityData);
  return response.data;
};

// Get all conversations for a mentor
export const getMentorConversations = async () => {
  const response = await axiosInstance.get('/api/mentor/messages');
  return response.data;
};

// Get all messages for a specific mentee
export const getMentorMenteeMessages = async (menteeId: string) => {
  const response = await axiosInstance.get(`/api/mentor/messages/${menteeId}`);
  return response.data;
};

// Send a message to a mentee
export const sendMenteeMessage = async (menteeId: string, message: string) => {
  const response = await axiosInstance.post(`/api/mentor/messages/${menteeId}`, { message });
  return response.data;
};

// Admin functions
// Get mentor applications for admin
export const getMentorApplications = async () => {
  const response = await axiosInstance.get('/api/admin/mentor-applications');
  return response.data;
};

// Update mentor application status
export const updateMentorApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected', notes?: string) => {
  const response = await axiosInstance.put(`/api/admin/mentor-applications/${applicationId}`, { status, notes });
  return response.data;
}; 