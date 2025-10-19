import { useTheme } from '@mui/material/styles';

// Theme-aware utility functions
export const useThemeColors = () => {
  const theme = useTheme();

  return {
    // Get colors based on theme mode
    getStatusColor: (status: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary') => {
      return theme.palette[status].main;
    },
    
    // Get background colors
    getBackgroundColor: (level: 'default' | 'paper' | 'elevated' = 'paper') => {
      if (level === 'elevated') {
        return theme.palette.mode === 'dark' 
          ? theme.customColors.surfaceElevated 
          : theme.palette.background.paper;
      }
      return theme.palette.background[level];
    },
    
    // Get text colors
    getTextColor: (variant: 'primary' | 'secondary' | 'disabled' = 'primary') => {
      return theme.palette.text[variant];
    },
    
    // Get border color
    getBorderColor: () => {
      return theme.customColors.borderColor;
    },
    
    // Get accent color
    getAccentColor: () => {
      return theme.customColors.accentColor;
    },
    
    // Helper to determine if dark mode
    isDark: theme.palette.mode === 'dark',
    
    // Helper to get appropriate shadow
    getShadow: (elevation: number = 1) => {
      const shadows = {
        1: theme.palette.mode === 'dark' 
          ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        2: theme.palette.mode === 'dark' 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        3: theme.palette.mode === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
          : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
      };
      return shadows[elevation as keyof typeof shadows] || shadows[1];
    },
    
    // Get hover colors
    getHoverColor: (_color: string, intensity: number = 0.08) => {
      return theme.palette.mode === 'dark' 
        ? `rgba(255, 255, 255, ${intensity})`
        : `rgba(0, 0, 0, ${intensity})`;
    },
  };
};

// Status color mapping for medical context
export const getAppointmentStatusColor = (status: string, theme: any) => {
  const statusMap = {
    'Scheduled': theme.palette.primary.main,
    'Completed': theme.palette.success.main,
    'Cancelled': theme.palette.error.main,
    'No-Show': theme.palette.warning.main,
    'In-Progress': theme.palette.info.main,
  };
  
  return statusMap[status as keyof typeof statusMap] || theme.palette.grey[500];
};

// Medical priority colors
export const getMedicalPriorityColor = (priority: 'low' | 'normal' | 'high' | 'urgent', theme: any) => {
  const priorityMap = {
    'low': theme.palette.success.main,
    'normal': theme.palette.primary.main,
    'high': theme.palette.warning.main,
    'urgent': theme.palette.error.main,
  };
  
  return priorityMap[priority] || theme.palette.grey[500];
};

// Utility to create consistent spacing
export const getSpacing = (multiplier: number = 1, theme: any) => {
  return theme.spacing(multiplier);
};

// Utility for consistent border radius
export const getBorderRadius = (size: 'small' | 'medium' | 'large' = 'medium', theme: any) => {
  const radiusMap = {
    'small': theme.shape.borderRadius * 0.5,
    'medium': theme.shape.borderRadius,
    'large': theme.shape.borderRadius * 1.5,
  };
  
  return radiusMap[size];
};
