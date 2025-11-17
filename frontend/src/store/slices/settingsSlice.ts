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
    audioCuesEnabled: true,
    animationsEnabled: true,
    contrastLevel: 'standard',
    palette: 'calm',
    globalVolume: 80,
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
        state.accessibility.contrastLevel = 'high';
        state.accessibility.palette = 'monochrome';
      } else if (action.payload === 'dyslexia') {
        state.accessibility.dyslexiaFont = true;
        state.accessibility.fontSize = 'large';
      } else {
        state.accessibility.highContrast = false;
      }
    },
    setFontSize: (state, action: PayloadAction<AccessibilitySettings['fontSize']>) => {
      state.accessibility.fontSize = action.payload;
    },
    setPalette: (state, action: PayloadAction<AccessibilitySettings['palette']>) => {
      state.accessibility.palette = action.payload;
    },
    setContrastLevel: (state, action: PayloadAction<AccessibilitySettings['contrastLevel']>) => {
      state.accessibility.contrastLevel = action.payload;
      state.accessibility.highContrast = action.payload !== 'standard';
    },
    setColorScheme: (state, action: PayloadAction<AccessibilitySettings['colorScheme']>) => {
      state.accessibility.colorScheme = action.payload;
    },
    setGlobalVolume: (state, action: PayloadAction<number>) => {
      state.accessibility.globalVolume = Math.max(0, Math.min(100, action.payload));
      state.accessibility.soundEnabled = state.accessibility.globalVolume > 0;
    },
  },
});

export const {
  updateAccessibility,
  toggleSetting,
  setTheme,
  setFontSize,
  setPalette,
  setContrastLevel,
  setColorScheme,
  setGlobalVolume,
} = settingsSlice.actions;
export default settingsSlice.reducer;
