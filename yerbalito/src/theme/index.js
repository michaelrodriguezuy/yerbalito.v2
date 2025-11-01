import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Verde del club
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff', // Blanco
      light: '#f5f5f5',
      dark: '#F57F17',
      contrastText: '#000000',
    },
    background: {
      default: 'rgba(0, 0, 0, 0.1)',
      paper: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    common: {
      white: '#ffffff',
      black: '#000000',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontSize: '2.5rem', 
      fontWeight: 600,
      color: '#ffffff',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    },
    h2: { 
      fontSize: '2rem', 
      fontWeight: 500,
      color: '#ffffff',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    },
    h3: { 
      fontSize: '1.75rem', 
      fontWeight: 500,
      color: '#ffffff',
    },
    h4: { 
      fontSize: '1.5rem', 
      fontWeight: 500,
      color: '#ffffff',
    },
    h5: { 
      fontSize: '1.25rem', 
      fontWeight: 500,
      color: '#ffffff',
    },
    h6: { 
      fontSize: '1rem', 
      fontWeight: 500,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      color: '#ffffff',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px',
        },
        contained: {
          backgroundColor: '#2E7D32',
          '&:hover': {
            backgroundColor: '#1B5E20',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.5)',
          color: '#ffffff',
          '&:hover': {
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2E7D32',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#2E7D32',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#ffffff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(46, 125, 50, 0.2)',
          color: '#ffffff',
          border: '1px solid rgba(46, 125, 50, 0.3)',
        },
      },
    },
    // Configuración de z-index para diferentes componentes
    // Menus y Popovers (navbar) - alta prioridad
    MuiMenu: {
      defaultProps: {
        // Asegurar que los menús funcionen correctamente
        disablePortal: false,
      },
    },
    MuiPopover: {
      defaultProps: {
        // Los Popovers (usados por Menus) no deben ser afectados por restricciones de modal
        disablePortal: false,
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
});

export default theme;




