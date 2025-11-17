import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChildProfile, SensoryPreference } from '../../types';

interface ProfileState {
  currentProfile: ChildProfile | null;
  profiles: ChildProfile[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  currentProfile: null,
  profiles: [],
  loading: false,
  error: null,
};

type ToggleablePreferenceKey =
  | 'soundEnabled'
  | 'animationsEnabled'
  | 'dyslexiaMode'
  | 'highContrastMode';

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setCurrentProfile: (state, action: PayloadAction<ChildProfile>) => {
      state.currentProfile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<ChildProfile>>) => {
      if (state.currentProfile) {
        state.currentProfile = { ...state.currentProfile, ...action.payload };
      }
    },
    setProfiles: (state, action: PayloadAction<ChildProfile[]>) => {
      state.profiles = action.payload;
    },
    updateSensoryPreferences: (state, action: PayloadAction<SensoryPreference[]>) => {
      if (state.currentProfile) {
        state.currentProfile.sensoryPreferences = action.payload;
      }
    },
    togglePreference: (state, action: PayloadAction<ToggleablePreferenceKey>) => {
      if (state.currentProfile) {
        const key = action.payload;
        if (typeof state.currentProfile.preferences[key] === 'boolean') {
          state.currentProfile.preferences[key] = !state.currentProfile.preferences[key];
        }
      }
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
  setCurrentProfile,
  updateProfile,
  setProfiles,
  updateSensoryPreferences,
  togglePreference,
  setLoading,
  setError,
} = profileSlice.actions;
export default profileSlice.reducer;
