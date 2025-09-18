import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// Extend the theme interface to include custom properties
declare module '@mui/material/styles' {
  interface Theme {
    customColors: {
      medicalPrimary: string;
      medicalSecondary: string;
      surfaceElevated: string;
      borderColor: string;
      accentColor: string;
    };
  }

  interface ThemeOptions {
    customColors?: {
      medicalPrimary?: string;
      medicalSecondary?: string;
      surfaceElevated?: string;
      borderColor?: string;
      accentColor?: string;
    };
  }
}

// Enhanced medical color palette with high accuracy light/dark mode support
const medicalColors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  secondary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  // Enhanced dark mode with better visual hierarchy
  dark: {
    background: {
      default: '#0A0E1A', // Deeper, richer dark background
      paper: '#111827', // Slightly lighter for cards
      elevated: '#1F2937', // For elevated surfaces
      surface: '#374151', // For secondary surfaces
      overlay: 'rgba(0, 0, 0, 0.7)', // For overlays
    },
    text: {
      primary: '#F9FAFB', // Pure white for primary text
      secondary: '#D1D5DB', // Light gray for secondary text
      disabled: '#6B7280', // Medium gray for disabled text
      hint: '#9CA3AF', // Hint text
    },
    divider: '#374151', // Subtle dividers
    border: '#4B5563', // Borders
    accent: '#3B82F6', // Accent color for highlights
    gradient: {
      primary: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
      secondary: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      surface: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
    },
  },
  // Enhanced light mode with better contrast
  light: {
    background: {
      default: '#FAFBFC', // Very light background
      paper: '#FFFFFF', // Pure white for cards
      elevated: '#F8FAFC', // For elevated surfaces
      surface: '#F1F5F9', // For secondary surfaces
      overlay: 'rgba(255, 255, 255, 0.9)', // For overlays
    },
    text: {
      primary: '#111827', // Dark gray for primary text
      secondary: '#374151', // Medium gray for secondary text
      disabled: '#9CA3AF', // Light gray for disabled text
      hint: '#6B7280', // Hint text
    },
    divider: '#E5E7EB', // Light dividers
    border: '#D1D5DB', // Light borders
    accent: '#2563EB', // Accent color for highlights
    gradient: {
      primary: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      secondary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      surface: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    },
  },
};

export const createMUITheme = (mode: 'light' | 'dark' = 'light') => {
  const isDark = mode === 'dark';
  const colors = isDark ? medicalColors.dark : medicalColors.light;
  
  const themeOptions: ThemeOptions = {
    customColors: {
      medicalPrimary: medicalColors.primary[600],
      medicalSecondary: medicalColors.secondary[600],
      surfaceElevated: colors.background.elevated,
      borderColor: colors.border,
      accentColor: colors.accent,
    },
    palette: {
      mode,
      primary: {
        main: medicalColors.primary[600],
        light: medicalColors.primary[400],
        dark: medicalColors.primary[800],
        contrastText: isDark ? '#ffffff' : '#ffffff',
        ...(isDark && {
          50: medicalColors.primary[50],
          100: medicalColors.primary[100],
          200: medicalColors.primary[200],
          300: medicalColors.primary[300],
          400: medicalColors.primary[400],
          500: medicalColors.primary[500],
          600: medicalColors.primary[600],
          700: medicalColors.primary[700],
          800: medicalColors.primary[800],
          900: medicalColors.primary[900],
        }),
      },
      secondary: {
        main: medicalColors.secondary[600],
        light: medicalColors.secondary[400],
        dark: medicalColors.secondary[800],
        contrastText: isDark ? '#ffffff' : '#ffffff',
        ...(isDark && {
          50: medicalColors.secondary[50],
          100: medicalColors.secondary[100],
          200: medicalColors.secondary[200],
          300: medicalColors.secondary[300],
          400: medicalColors.secondary[400],
          500: medicalColors.secondary[500],
          600: medicalColors.secondary[600],
          700: medicalColors.secondary[700],
          800: medicalColors.secondary[800],
          900: medicalColors.secondary[900],
        }),
      },
      error: {
        main: medicalColors.error[600],
        light: medicalColors.error[400],
        dark: medicalColors.error[800],
        contrastText: isDark ? '#ffffff' : '#ffffff',
        ...(isDark && {
          50: medicalColors.error[50],
          100: medicalColors.error[100],
          200: medicalColors.error[200],
          300: medicalColors.error[300],
          400: medicalColors.error[400],
          500: medicalColors.error[500],
          600: medicalColors.error[600],
          700: medicalColors.error[700],
          800: medicalColors.error[800],
          900: medicalColors.error[900],
        }),
      },
      warning: {
        main: medicalColors.warning[600],
        light: medicalColors.warning[400],
        dark: medicalColors.warning[800],
        contrastText: isDark ? '#000000' : '#000000',
        ...(isDark && {
          50: medicalColors.warning[50],
          100: medicalColors.warning[100],
          200: medicalColors.warning[200],
          300: medicalColors.warning[300],
          400: medicalColors.warning[400],
          500: medicalColors.warning[500],
          600: medicalColors.warning[600],
          700: medicalColors.warning[700],
          800: medicalColors.warning[800],
          900: medicalColors.warning[900],
        }),
      },
      success: {
        main: medicalColors.success[600],
        light: medicalColors.success[400],
        dark: medicalColors.success[800],
        contrastText: isDark ? '#ffffff' : '#ffffff',
        ...(isDark && {
          50: medicalColors.success[50],
          100: medicalColors.success[100],
          200: medicalColors.success[200],
          300: medicalColors.success[300],
          400: medicalColors.success[400],
          500: medicalColors.success[500],
          600: medicalColors.success[600],
          700: medicalColors.success[700],
          800: medicalColors.success[800],
          900: medicalColors.success[900],
        }),
      },
      info: {
        main: medicalColors.info[600],
        light: medicalColors.info[400],
        dark: medicalColors.info[800],
        contrastText: isDark ? '#ffffff' : '#ffffff',
        ...(isDark && {
          50: medicalColors.info[50],
          100: medicalColors.info[100],
          200: medicalColors.info[200],
          300: medicalColors.info[300],
          400: medicalColors.info[400],
          500: medicalColors.info[500],
          600: medicalColors.info[600],
          700: medicalColors.info[700],
          800: medicalColors.info[800],
          900: medicalColors.info[900],
        }),
      },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
        ...(isDark && {
          elevated: colors.background.elevated,
        }),
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
      divider: colors.divider,
      ...(isDark && {
        grey: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 12,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: isDark 
                ? '0 4px 12px rgba(255, 255, 255, 0.1)' 
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: isDark 
                ? '0 6px 16px rgba(255, 255, 255, 0.15)' 
                : '0 6px 16px rgba(0, 0, 0, 0.2)',
            },
          },
          outlined: {
            borderColor: isDark ? colors.border : medicalColors.primary[300],
            '&:hover': {
              borderColor: medicalColors.primary[600],
              backgroundColor: isDark 
                ? 'rgba(59, 130, 246, 0.1)' 
                : 'rgba(59, 130, 246, 0.04)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: colors.background.paper,
            background: isDark ? colors.gradient.surface : 'none',
            border: `1px solid ${colors.border}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': isDark ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
            } : {},
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: isDark 
                ? '0 16px 48px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                : '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-4px)',
              borderColor: colors.accent,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: colors.background.paper,
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease',
          },
          elevation1: {
            boxShadow: isDark 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          },
          elevation2: {
            boxShadow: isDark 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isDark ? colors.background.elevated : '#ffffff',
              transition: 'all 0.3s ease',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: medicalColors.primary[500],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: medicalColors.primary[600],
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              color: colors.text.secondary,
              '&.Mui-focused': {
                color: medicalColors.primary[600],
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${colors.divider}`,
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            borderRadius: 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&::before': isDark ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
            } : {},
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: `1px solid ${colors.divider}`,
            boxShadow: isDark 
              ? '8px 0 32px rgba(0, 0, 0, 0.4), 4px 0 16px rgba(0, 0, 0, 0.2), inset 1px 0 0 rgba(255, 255, 255, 0.1)'
              : '8px 0 32px rgba(0, 0, 0, 0.08), 4px 0 16px rgba(0, 0, 0, 0.04), inset 1px 0 0 rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&::before': isDark ? {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '1px',
              background: 'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
            } : {},
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            margin: '4px 8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDark 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&.Mui-selected': {
              backgroundColor: isDark 
                ? 'rgba(59, 130, 246, 0.15)' 
                : medicalColors.primary[50],
              background: isDark 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)',
              border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : medicalColors.primary[200]}`,
              boxShadow: isDark 
                ? '0 4px 16px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 2px 8px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: isDark 
                  ? 'rgba(59, 130, 246, 0.25)' 
                  : medicalColors.primary[100],
                transform: 'translateX(4px)',
              },
              '&::before': {
                opacity: 1,
              },
            },
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
              transform: 'translateX(2px)',
              '&::before': {
                opacity: 1,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            transition: 'all 0.3s ease',
            backgroundColor: isDark ? colors.background.elevated : '#f1f5f9',
            color: colors.text.primary,
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.08)',
            },
          },
          colorPrimary: {
            backgroundColor: isDark 
              ? 'rgba(59, 130, 246, 0.2)' 
              : medicalColors.primary[100],
            color: isDark ? medicalColors.primary[300] : medicalColors.primary[700],
          },
          colorSuccess: {
            backgroundColor: isDark 
              ? 'rgba(16, 185, 129, 0.2)' 
              : medicalColors.success[100],
            color: isDark ? medicalColors.success[300] : medicalColors.success[700],
          },
          colorError: {
            backgroundColor: isDark 
              ? 'rgba(239, 68, 68, 0.2)' 
              : medicalColors.error[100],
            color: isDark ? medicalColors.error[300] : medicalColors.error[700],
          },
          colorWarning: {
            backgroundColor: isDark 
              ? 'rgba(245, 158, 11, 0.2)' 
              : medicalColors.warning[100],
            color: isDark ? medicalColors.warning[300] : medicalColors.warning[700],
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
            background: isDark ? colors.gradient.surface : 'none',
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            '&::before': isDark ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
            } : {},
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'rgba(248, 250, 252, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: isDark 
                ? 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.divider}`,
            color: colors.text.primary,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
          },
          head: {
            fontWeight: 600,
            color: colors.text.primary,
            backgroundColor: 'transparent',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            padding: '16px 24px',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(59, 130, 246, 0.08)' 
                : 'rgba(59, 130, 246, 0.04)',
              transform: 'scale(1.01)',
              boxShadow: isDark 
                ? '0 4px 16px rgba(59, 130, 246, 0.1)'
                : '0 2px 8px rgba(59, 130, 246, 0.05)',
            },
            '&:nth-of-type(even)': {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.02)' 
                : 'rgba(0, 0, 0, 0.02)',
            },
            '&:nth-of-type(odd)': {
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.01)' 
                : 'rgba(0, 0, 0, 0.01)',
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#0f172a',
            color: isDark ? '#f8fafc' : '#ffffff',
            fontSize: '0.875rem',
            borderRadius: 8,
            boxShadow: isDark 
              ? '0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
              : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
