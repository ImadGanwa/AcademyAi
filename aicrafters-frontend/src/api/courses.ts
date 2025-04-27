import axiosInstance from "./axiosInstance";
import { store } from "../store";

interface PurchaseResponse { 
  message: string; 
}

export const purchaseCourse = async (courseId: string): Promise<PurchaseResponse> => {
  const response = await axiosInstance.post<PurchaseResponse>(`/api/courses/${courseId}/purchase`);
  return response.data;
};

export const checkPurchasedCourse = async (courseId: string): Promise<boolean> => {
  try {
    const state = store.getState();
    const userCourses = state.auth.user?.courses || [];
    return userCourses.some(course => course.courseId === courseId);
  } catch (error) {
    console.error('Error checking course purchase:', error);
    return false;
  }
};

export {};
