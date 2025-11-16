import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Activity, ActivitySession, ActivityCategory } from '../../types';

interface ActivityState {
  activities: Activity[];
  currentActivity: ActivitySession | null;
  filteredCategory: ActivityCategory | null;
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [],
  currentActivity: null,
  filteredCategory: null,
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    setCurrentActivity: (state, action: PayloadAction<ActivitySession | null>) => {
      state.currentActivity = action.payload;
    },
    updateActivitySession: (state, action: PayloadAction<Partial<ActivitySession>>) => {
      if (state.currentActivity) {
        state.currentActivity = { ...state.currentActivity, ...action.payload };
      }
    },
    completeActivity: (state) => {
      if (state.currentActivity) {
        state.currentActivity.completed = true;
        state.currentActivity.endTime = new Date();
      }
    },
    setFilteredCategory: (state, action: PayloadAction<ActivityCategory | null>) => {
      state.filteredCategory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setActivities,
  setCurrentActivity,
  updateActivitySession,
  completeActivity,
  setFilteredCategory,
  setLoading,
  setError,
} = activitySlice.actions;
export default activitySlice.reducer;
