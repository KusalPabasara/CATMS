import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import { 
  LightMode as LightModeIcon, 
  DarkMode as DarkModeIcon,
  SettingsBrightness as SystemIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme, isDark } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    handleClose();
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <SystemIcon />;
    }
    return isDark ? <LightModeIcon /> : <DarkModeIcon />;
  };

  const getTooltipText = () => {
    if (theme === 'system') {
      return `Using system theme (${resolvedTheme})`;
    }
    return `Switch to ${isDark ? 'light' : 'dark'} mode`;
  };

  return (
    <>
      <Tooltip title={getTooltipText()}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label="Theme settings"
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(180deg)',
            },
          }}
        >
          {getThemeIcon()}
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary' }}>
            Theme
          </Box>
        </Box>
        <Divider />
        
        <MenuItem 
          onClick={() => handleThemeSelect('light')}
          selected={theme === 'light'}
        >
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Light" />
          {theme === 'light' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleThemeSelect('dark')}
          selected={theme === 'dark'}
        >
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Dark" />
          {theme === 'dark' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleThemeSelect('system')}
          selected={theme === 'system'}
        >
          <ListItemIcon>
            <SystemIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="System" 
            secondary={theme === 'system' ? `Currently ${resolvedTheme}` : undefined}
          />
          {theme === 'system' && <CheckIcon fontSize="small" color="primary" />}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeToggle;
