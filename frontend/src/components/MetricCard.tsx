import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 12,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0px 8px 16px -4px rgba(0,0,0,0.3), 0px 4px 8px -2px rgba(0,0,0,0.2)'
            : '0px 8px 16px -4px rgba(0,0,0,0.1), 0px 4px 8px -2px rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              backgroundColor: color,
              borderRadius: '12px',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.palette.mode === 'dark' 
                ? '0px 4px 8px rgba(0,0,0,0.3)'
                : '0px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {icon}
          </Avatar>
          <Box flex={1}>
            <Typography 
              variant="h4" 
              color="text.primary" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.75rem',
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 500,
                fontSize: '0.875rem',
                mt: 0.5,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 400,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
