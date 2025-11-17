import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import activityReducer from './slices/activitySlice';
import progressReducer from './slices/progressSlice';
import settingsReducer from './slices/settingsSlice';
import rewardReducer from './slices/rewardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    activity: activityReducer,
    progress: progressReducer,
    settings: settingsReducer,
    rewards: rewardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['activity/setCurrentActivity'],
        ignoredPaths: ['activity.currentActivity.startTime'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
