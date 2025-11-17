import { createTheme, darken, lighten } from '@mui/material/styles';
import { AccessibilitySettings } from '../types';

const palettePresets = {
  calm: {
    primary: { main: '#A8D5E2', light: '#C8E5F0', dark: '#88B5C2' },
    secondary: { main: '#B8E6D5', light: '#D8F6E5', dark: '#98C6B5' },
    background: { default: '#F0F4F8', paper: '#FFFFFF' },
    text: { primary: '#2F3B45', secondary: '#4F5A63' },
  },
  vibrant: {
    primary: { main: '#5D8BF4', light: '#8FB0FF', dark: '#325FCC' },
    secondary: { main: '#FFCA3A', light: '#FFE27A', dark: '#D3A017' },
    background: { default: '#F7F9FC', paper: '#FFFFFF' },
    text: { primary: '#1A1A1A', secondary: '#303030' },
  },
  monochrome: {
    primary: { main: '#000000', light: '#333333', dark: '#000000' },
    secondary: { main: '#666666', light: '#888888', dark: '#444444' },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    text: { primary: '#000000', secondary: '#111111' },
  },
};

const fontSizeMap: Record<AccessibilitySettings['fontSize'], number> = {
  small: 14,
  medium: 16,
  large: 18,
  'extra-large': 20,
};

const contrastMultipliers: Record<AccessibilitySettings['contrastLevel'], number> = {
  standard: 0,
  high: 0.08,
  maximum: 0.15,
};

const getPaletteWithContrast = (presetKey: AccessibilitySettings['palette'], contrast: AccessibilitySettings['contrastLevel']) => {
  const preset = palettePresets[presetKey];
  const delta = contrastMultipliers[contrast];

  if (delta === 0) return preset;

  return {
    ...preset,
    primary: {
      main: darken(preset.primary.main, delta),
      light: lighten(preset.primary.light, delta),
      dark: darken(preset.primary.dark, delta),
    },
    secondary: {
      main: darken(preset.secondary.main, delta / 2),
      light: lighten(preset.secondary.light, delta / 2),
      dark: darken(preset.secondary.dark, delta / 2),
    },
    background: {
      default: contrast === 'maximum' ? '#FFFFFF' : preset.background.default,
      paper: contrast === 'maximum' ? '#FFFFFF' : preset.background.paper,
    },
    text: {
      primary: contrast === 'maximum' ? '#000000' : preset.text.primary,
      secondary: contrast === 'maximum' ? '#000000' : preset.text.secondary,
    },
  };
};

export const createAppTheme = (accessibility: AccessibilitySettings) => {
  const palette = getPaletteWithContrast(accessibility.palette, accessibility.highContrast ? 'maximum' : accessibility.contrastLevel);
  const mode = accessibility.colorScheme === 'auto' ? 'light' : accessibility.colorScheme;
  const fontFamily = accessibility.dyslexiaFont
    ? '"OpenDyslexic", "Arial", sans-serif'
    : '"Arial", "Verdana", sans-serif';

  return createTheme({
    palette: {
      mode,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      text: palette.text,
      success: { main: '#C1E8C1', dark: '#A1C8A1' },
      warning: { main: '#FFF4B8', dark: '#DFD498' },
      error: { main: '#F5A5A5', dark: '#D58585' },
    },
    typography: {
      fontFamily,
      fontSize: fontSizeMap[accessibility.fontSize],
      h1: { fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.5 },
      h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.5 },
      h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.5 },
      h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.5 },
      body1: {
        fontSize: `${fontSizeMap[accessibility.fontSize] / 16}rem`,
        lineHeight: accessibility.dyslexiaFont ? 2 : 1.8,
        letterSpacing: accessibility.dyslexiaFont ? '0.04em' : undefined,
      },
      button: {
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    spacing: 8,
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minWidth: '44px',
            minHeight: '44px',
            padding: '12px 24px',
            fontSize: '1rem',
            borderRadius: '12px',
            boxShadow: 'none',
            transition: accessibility.reducedMotion ? 'none' : undefined,
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          },
          contained: {
            '&:active': {
              transform: accessibility.reducedMotion ? 'none' : 'scale(0.98)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            padding: '24px',
            boxShadow: accessibility.reducedMotion ? '0 1px 4px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              fontSize: '1rem',
              transition: accessibility.reducedMotion ? 'none' : undefined,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: '44px',
            minHeight: '44px',
            transition: accessibility.reducedMotion ? 'none' : undefined,
          },
        },
      },
    },
  });
};
