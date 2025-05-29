import axiosInstance from "./axiosInstance";
// import { store } from "../store";

interface PurchaseResponse { 
  message: string; 
}

export const purchaseCourse = async (courseId: string): Promise<PurchaseResponse> => {
  const response = await axiosInstance.post<PurchaseResponse>(`/api/courses/${courseId}/purchase`);
  return response.data;
};

export const checkPurchasedCourse = async (courseId: string): Promise<boolean> => {
  // Always return true to make all courses appear as purchased
  return true;
  
  /* Original code commented out:
  try {
    const state = store.getState();
    const userCourses = state.auth.user?.courses || [];
    return userCourses.some(course => course.courseId === courseId);
  } catch (error) {
    console.error('Error checking course purchase:', error);
    return false;
  }
  */
};

export {};
