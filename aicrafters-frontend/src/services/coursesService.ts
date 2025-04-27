import axios from 'axios';
import { store } from '../store';
import config from '../config';

const API_URL = `${config.API_URL}/api`;

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  instructor: {
    fullName: string;
    email: string;
  };
  thumbnail: string;
  previewVideo?: string;
  originalPrice: number;
  currentPrice: number;
  categories: string[];
  learningPoints: string[];
  requirements: string[];
  status: 'draft' | 'published' | 'archived';
  rating: number;
  usersCount: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  courseContent?: {
    sections: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
        type: 'video' | 'text' | 'quiz';
        duration?: number;
        preview: boolean;
        content?: string;
      }>;
    }>;
  };
}

export const coursesService = {
  getTrainerCourses: async (): Promise<Course[]> => {
    const token = store.getState().auth.token;
    const response = await axios.get(`${API_URL}/courses/my-courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  getAllCourses: async (): Promise<Course[]> => {
    const response = await axios.get(`${API_URL}/courses/list`);
    return response.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await axios.get(`${API_URL}/courses/${id}`);
    return response.data;
  },

  createCourse: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    
    
    const response = await axios.post(`${API_URL}/courses/create`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateCourse: async (courseId: string, courseData: FormData): Promise<Course> => {
    const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadThumbnail: async (file: File): Promise<{ path: string }> => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const response = await axios.post(`${API_URL}/courses/upload/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await axios.get(`${API_URL}/courses/categories`);
    return response.data;
  },

  updateCourseStatus: async (courseId: string, status: 'draft' | 'published' | 'archived'): Promise<Course> => {
    const response = await axios.patch(`${API_URL}/courses/${courseId}/update-status`, { status });
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await axios.delete(`${API_URL}/courses/${courseId}`);
  },

  markLessonComplete: async (courseId: string, lessonId: string): Promise<{ progress: { percentage: number, completedLessons: string[] }, status: string }> => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/lessons/${lessonId}/complete`);
    return response.data;
  },

  saveCourse: async (courseId: string): Promise<{ message: string, isSaved: boolean }> => {
    const response = await axios.post(`${API_URL}/courses/${courseId}/save`);
    return response.data;
  },

  fetchCourses: async (): Promise<Course[]> => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 