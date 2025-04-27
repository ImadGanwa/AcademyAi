import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  savedCourses: string[];
  // Add other user-related state as needed
}

const initialState: UserState = {
  savedCourses: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    removeSavedCourse: (state, action: PayloadAction<string>) => {
      state.savedCourses = state.savedCourses.filter(id => id !== action.payload);
    },
    // Add other user-related actions as needed
  },
});

export const { removeSavedCourse } = userSlice.actions;
export default userSlice.reducer; 