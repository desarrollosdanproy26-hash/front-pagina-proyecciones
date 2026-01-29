import { createTheme } from '@mui/material/styles';

// Paleta de colores DANPER (Rojo y Blanco)
const theme = createTheme({
  palette: {
    primary: {
      main: '#E31837',      // Rojo Danper principal
      light: '#FF5252',     // Rojo claro
      dark: '#B71C1C',      // Rojo oscuro
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#424242',      // Gris oscuro
      light: '#6D6D6D',     // Gris medio
      dark: '#1B1B1B',      // Gris muy oscuro
      contrastText: '#FFFFFF'
    },
    success: {
      main: '#4CAF50',      // Verde éxito
      light: '#81C784',     // Verde claro
      dark: '#388E3C',      // Verde oscuro
      contrastText: '#FFFFFF'
    },
    info: {
      main: '#2196F3',      // Azul información
      light: '#64B5F6',     // Azul claro
      dark: '#1976D2',      // Azul oscuro
      contrastText: '#FFFFFF'
    },
    warning: {
      main: '#FF9800',      // Naranja advertencia
      light: '#FFB74D',     // Naranja claro
      dark: '#F57C00',      // Naranja oscuro
      contrastText: '#000000'
    },
    error: {
      main: '#D32F2F',      // Rojo error
      light: '#EF5350',     // Rojo claro
      dark: '#C62828',      // Rojo muy oscuro
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FAFAFA',   // Fondo general (gris muy claro)
      paper: '#FFFFFF'      // Fondo de componentes (blanco)
    },
    text: {
      primary: '#212121',   // Texto principal (negro suave)
      secondary: '#616161', // Texto secundario (gris oscuro)
      disabled: '#9E9E9E'   // Texto deshabilitado (gris)
    },
    divider: '#E0E0E0',     // Líneas divisoras (gris claro)
    action: {
      hover: 'rgba(227, 24, 55, 0.08)',    // Hover con rojo suave
      selected: 'rgba(227, 24, 55, 0.16)', // Seleccionado con rojo
      disabled: 'rgba(0, 0, 0, 0.26)',     // Deshabilitado
      focus: 'rgba(227, 24, 55, 0.12)'     // Foco con rojo
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#212121'
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#212121'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      color: '#212121'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#212121'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: '#212121'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#212121'
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.75,
      color: '#212121'
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      color: '#616161'
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#212121'
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#616161'
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      textTransform: 'none' // Sin mayúsculas automáticas
    }
  },
  shape: {
    borderRadius: 8 // Bordes redondeados modernos
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.08)',
    '0px 4px 8px rgba(0,0,0,0.12)',
    '0px 8px 16px rgba(0,0,0,0.16)',
    '0px 12px 24px rgba(0,0,0,0.20)',
    '0px 16px 32px rgba(0,0,0,0.24)',
    // ... resto de sombras por defecto
    ...Array(19).fill('0px 2px 4px rgba(0,0,0,0.08)')
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.12)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(227, 24, 55, 0.3)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)'
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0,0,0,0.12)'
        },
        elevation3: {
          boxShadow: '0px 8px 16px rgba(0,0,0,0.16)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#E31837'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E31837'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.12)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E0E0E0'
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#FAFAFA'
        }
      }
    }
  }
});

export default theme;
