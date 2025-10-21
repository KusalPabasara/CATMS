import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import MargaLogo from '../components/MargaLogo';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  MedicalServices as MedicalIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Psychology as PsychologyIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

export default function MainLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based access control flags
  const canSeeDoctors = ['System Administrator', 'Branch Manager', 'Receptionist'].includes(user?.role || '');
  const canSeeStaff = ['System Administrator', 'Branch Manager'].includes(user?.role || '');
  const canSeeBilling = ['System Administrator', 'Billing Staff', 'Branch Manager', 'Accountant'].includes(user?.role || '');
  const canSeeAuditLogs = user?.role === 'System Administrator';
  const canSeeAIMedical = user?.role === 'Doctor';

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
    { name: 'Patients', href: '/admin/patients', icon: <PeopleIcon /> },
    // Doctors tab - hidden from doctors
    ...(canSeeDoctors ? [{ name: 'Doctors', href: '/admin/doctors', icon: <PersonAddIcon /> }] : []),
    // Staff tab - only for System Administrator and Branch Manager
    ...(canSeeStaff ? [{ name: 'Staff', href: '/admin/staff', icon: <GroupIcon /> }] : []),
    // Appointments - visible to everyone including doctors
    { name: 'Appointments', href: '/admin/appointments', icon: <CalendarIcon /> },
    { name: 'Calendar View', href: '/admin/appointments/calendar', icon: <EventIcon /> },
    { name: 'Treatments', href: '/admin/treatments', icon: <MedicalIcon /> },
    // Billing tab - hidden from doctors
    ...(canSeeBilling ? [{ name: 'Billing', href: '/admin/billing', icon: <PaymentIcon /> }] : []),
    // Audit Logs - only for System Administrator
    ...(canSeeAuditLogs ? [{ name: 'Audit Logs', href: '/admin/audit-logs', icon: <SecurityIcon /> }] : []),
    // AI Medical Assistant - only for doctors
    ...(canSeeAIMedical ? [{ name: 'AI Medical Assistant', href: '/admin/doctor-profile', icon: <PsychologyIcon /> }] : []),
  ];

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <MargaLogo size="small" variant="horizontal" />
      </Toolbar>
      <Divider />
      
      <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
        {navigation.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={Link}
              to={item.href}
              selected={isActive(item.href)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  '&:hover': {
                    backgroundColor: 'primary.100',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive(item.href) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.name}
                primaryTypographyProps={{
                  fontWeight: isActive(item.href) ? 600 : 400,
                  color: isActive(item.href) ? 'primary.main' : 'inherit',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
              {user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.50',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          display: { lg: 'none' },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Marga.lk
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar sx={{ display: { lg: 'none' } }} />
        <Box sx={{ animation: 'fadeIn 0.3s ease-in' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}