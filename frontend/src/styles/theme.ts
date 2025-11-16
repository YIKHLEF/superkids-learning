import { createTheme } from '@mui/material/styles';

// Palette neuro-inclusive selon les spécifications
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A8D5E2', // Bleu ciel doux
      light: '#C8E5F0',
      dark: '#88B5C2',
    },
    secondary: {
      main: '#B8E6D5', // Vert menthe
      light: '#D8F6E5',
      dark: '#98C6B5',
    },
    background: {
      default: '#F0F4F8', // Bleu pâle
      paper: '#FFFFFF',
    },
    text: {
      primary: '#3A3A3A', // Gris anthracite
      secondary: '#5A5A5A',
    },
    success: {
      main: '#C1E8C1', // Vert pastel
      dark: '#A1C8A1',
    },
    warning: {
      main: '#FFF4B8', // Jaune doux
      dark: '#DFD498',
    },
    error: {
      main: '#F5A5A5',
      dark: '#D58585',
    },
  },
  typography: {
    fontFamily: '"Arial", "Verdana", "OpenDyslexic", sans-serif',
    fontSize: 16,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.8,
    },
    button: {
      textTransform: 'none',
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  spacing: 8, // Espacement généreux
  shape: {
    borderRadius: 12, // Coins arrondis doux
  },
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
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            fontSize: '1rem',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: '44px',
          minHeight: '44px',
        },
      },
    },
  },
});

// Thème haute contraste pour accessibilité
export const highContrastTheme = createTheme({
  ...theme,
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#FFFF00',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
  },
});

// Thème dyslexie avec police spéciale
export const dyslexiaTheme = createTheme({
  ...theme,
  typography: {
    ...theme.typography,
    fontFamily: '"OpenDyslexic", "Arial", sans-serif',
    fontSize: 18,
    body1: {
      fontSize: '1.125rem',
      lineHeight: 2,
      letterSpacing: '0.05em',
    },
  },
});
