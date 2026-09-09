import { createTheme, type ThemeOptions } from '@mui/material/styles'

export function getMuiTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark'

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#FF3E00',
        dark: '#D93200',
        light: '#FF6B00',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#252F40' : '#E9ECEF',
        dark: isDark ? '#181F2A' : '#DDE2E7',
        light: isDark ? '#323E54' : '#FFFFFF',
        contrastText: isDark ? '#F6F1D7' : '#0E1217',
      },
      background: {
        default: isDark ? '#0E1217' : '#F4F6F8',
        paper: isDark ? '#181F2A' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F6F1D7' : '#0E1217',
        secondary: isDark ? '#9BA8BA' : '#4B5563',
      },
      divider: isDark ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7',
      error: {
        main: '#EF4444',
      },
      success: {
        main: '#00C875',
      },
      warning: {
        main: '#F5A623',
      },
      info: {
        main: '#0084FF',
      },
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", -apple-system, sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 800,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 800,
      },
      h6: {
        fontWeight: 700,
      },
      button: {
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'none',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0E1217' : '#F4F6F8',
            color: isDark ? '#F6F1D7' : '#0E1217',
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.88rem',
            boxShadow: 'none',
            transition: 'all 0.18s ease',
            '&:hover': {
              boxShadow: 'none',
            },
            '&.MuiButton-containedPrimary': {
              background: 'linear-gradient(135deg, #FF3E00 0%, #FF0055 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(255, 62, 0, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF5722 0%, #FF1744 100%)',
                boxShadow: '0 0 24px rgba(255, 62, 0, 0.45)',
                transform: 'translateY(-1px)',
              },
            },
            '&.MuiButton-outlinedPrimary': {
              borderColor: 'rgba(255, 62, 0, 0.4)',
              color: '#FF3E00',
              '&:hover': {
                backgroundColor: 'rgba(255, 62, 0, 0.08)',
                borderColor: '#FF3E00',
                boxShadow: '0 0 16px rgba(255, 62, 0, 0.2)',
                transform: 'translateY(-1px)',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#181F2A' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(246, 241, 215, 0.1)' : '#DDE2E7'}`,
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.6)'
              : '0 2px 8px rgba(14, 18, 23, 0.04)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: '"Fira Code", monospace',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: 6,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundColor: isDark ? '#181F2A' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(246, 241, 215, 0.12)' : '#DDE2E7'}`,
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 20px 48px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 62, 0, 0.2)'
              : '0 12px 32px rgba(14, 18, 23, 0.12)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderBottom: `1px solid ${isDark ? 'rgba(246, 241, 215, 0.08)' : '#DDE2E7'}`,
            backgroundColor: isDark ? 'rgba(14, 18, 23, 0.92)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            color: isDark ? '#F6F1D7' : '#0E1217',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isDark ? '#181F2A' : '#FFFFFF',
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FF3E00',
              borderWidth: 2,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            '&.Mui-selected': {
              color: '#FF3E00',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: '#FF3E00',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
    },
  }

  return createTheme(themeOptions)
}
