import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccessibilitySettings } from '../../types';

interface SettingsState {
  accessibility: AccessibilitySettings;
  theme: 'default' | 'highContrast' | 'dyslexia';
}

const initialState: SettingsState = {
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    fontSize: 'medium',
    colorScheme: 'light',
    soundEnabled: true,
    dyslexiaFont: false,
    autoRead: false,
  },
  theme: 'default',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateAccessibility: (state, action: PayloadAction<Partial<AccessibilitySettings>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    toggleSetting: (state, action: PayloadAction<keyof AccessibilitySettings>) => {
      const key = action.payload;
      if (typeof state.accessibility[key] === 'boolean') {
        (state.accessibility[key] as boolean) = !state.accessibility[key];
      }
    },
    setTheme: (state, action: PayloadAction<'default' | 'highContrast' | 'dyslexia'>) => {
      state.theme = action.payload;
      if (action.payload === 'highContrast') {
        state.accessibility.highContrast = true;
      } else if (action.payload === 'dyslexia') {
        state.accessibility.dyslexiaFont = true;
      }
    },
    setFontSize: (state, action: PayloadAction<AccessibilitySettings['fontSize']>) => {
      state.accessibility.fontSize = action.payload;
    },
  },
});

export const { updateAccessibility, toggleSetting, setTheme, setFontSize } = settingsSlice.actions;
export default settingsSlice.reducer;
