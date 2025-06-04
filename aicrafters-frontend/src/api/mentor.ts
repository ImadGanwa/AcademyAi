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
  skills: string[];
  availability: any; // Complex type, adjust as needed
  hourlyRate: number;
  professionalInfo: {
    role?: string;
    linkedIn?: string;
    experience?: string;
    academicBackground?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional fields
}

interface MentorProfileData {
  bio?: string;
  skills?: string[];
  availability?: any;
  hourlyRate?: number;
  profileImage?: File;
  removeProfileImage?: boolean;
  languages?: string[];
  professionalInfo?: {
    role?: string;
    linkedIn?: string;
    experience?: string;
    academicBackground?: string;
    [key: string]: any;
  };
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
    const response = await axiosInstance.get('/api/mentor/public/mentors', { params: filters });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching public mentors:', error);
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

// Get complete mentor profile by ID (includes experience and academic background)
export const getCompleteMentorProfile = async (mentorId: string) => {
  try {
    console.log('getCompleteMentorProfile API call for mentorId:', mentorId);
    const response = await axiosInstance.get(`/api/mentor/private/${mentorId}`);
    console.log('getCompleteMentorProfile API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching complete mentor profile for ID ${mentorId}:`, error);
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
    
    // Prepare structured data according to the required schema
    const structuredData = {
      fullName: profileData.fullName || profileData.name,
      bio: profileData.bio,
      hourlyRate: profileData.hourlyRate || 50, // Default value
      country: profileData.country,
      // Format skills with IDs
      skills: Array.isArray(profileData.skills) 
        ? profileData.skills.map(name => ({ name })) 
        : [],
      // Format languages with IDs
      languages: Array.isArray(profileData.languages) 
        ? profileData.languages.map(name => ({ name })) 
        : [],
      // Structure professionalInfo correctly
      professionalInfo: {
        role: profileData.professionalInfo?.role || 'Professional Mentor',
        linkedIn: profileData.professionalInfo?.linkedIn || '',
        academicBackground: profileData.professionalInfo?.academicBackground || '',
        experience: profileData.professionalInfo?.experience || ''
      },
    };
    
    console.log('Structured data for API:', structuredData);
    
    // Add all fields from the structured data to FormData
    Object.entries(structuredData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // For objects and arrays, stringify them
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          // For primitive values, convert to string
          formData.append(key, String(value));
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