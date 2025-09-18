import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { usePatientStore } from '../../store/patientStore';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { format } from 'date-fns';

interface Appointment {
  appointment_id: number;
  appointment_date: string;
  status: string;
  reason: string;
  doctor?: {
    full_name: string;
  };
  priority: string;
  created_at: string;
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patient, logout } = usePatientStore();
  const { isDark, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('🏠 Dashboard: Patient data changed:', patient);
    // Handle nested patient structure
    const currentPatient = patient?.patient || patient;
    console.log('🏠 Dashboard: Current patient:', currentPatient);
    console.log('🏠 Dashboard: Profile picture URL:', currentPatient?.profile_picture);
    if (!currentPatient) {
      navigate('/patient/login');
      return;
    }
    
    fetchAppointments();
  }, [patient, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/patient-auth/appointments');
      setAppointments(response.data);
    } catch (err: any) {
      console.error('Error fetching patient appointments:', err);
      setError(err.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/patient/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'primary';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      case 'No-Show': return 'warning';
      case 'In Progress': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) > new Date() && apt.status === 'Scheduled'
  ).slice(0, 3);

  // Handle nested patient structure
  const currentPatient = patient?.patient || patient;
  
  if (!currentPatient) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        bgcolor: isDark ? 'background.default' : 'grey.50',
        p: 3,
        background: isDark 
          ? 'linear-gradient(135deg, #0A0E1A 0%, #1E293B 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)',
      }}
    >
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        flexWrap="wrap"
        gap={2}
        sx={{
          background: isDark 
            ? 'rgba(17, 24, 39, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          p: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar 
            src={currentPatient?.profile_picture || undefined}
            sx={{ 
              width: 64, 
              height: 64, 
              mr: 3, 
              background: currentPatient?.profile_picture 
                ? undefined 
                : isDark
                ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: currentPatient?.profile_picture ? undefined : 'white',
              boxShadow: isDark
                ? '0 8px 32px rgba(59, 130, 246, 0.3)'
                : '0 8px 32px rgba(30, 64, 175, 0.3)',
            }}
            onLoad={() => console.log('🏠 Dashboard: Avatar image loaded successfully')}
            onError={(e) => console.log('🏠 Dashboard: Avatar image failed to load:', e)}
          >
            {!currentPatient?.profile_picture && (currentPatient?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'P')}
          </Avatar>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                  : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome back, {currentPatient?.full_name?.split(' ')[0] || 'Patient'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your appointments and health records
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center">
          <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: isDark ? 'warning.main' : 'info.main',
                '&:hover': {
                  backgroundColor: isDark 
                    ? alpha(theme.palette.warning.main, 0.1) 
                    : alpha(theme.palette.info.main, 0.1),
                },
              }}
            >
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate('/patient/profile')}
            sx={{
              borderColor: isDark ? 'primary.main' : 'primary.main',
              color: isDark ? 'primary.main' : 'primary.main',
              '&:hover': {
                backgroundColor: isDark 
                  ? alpha(theme.palette.primary.main, 0.1) 
                  : alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
        gap={3}
        mb={4}
      >
        <Card 
          sx={{ 
            cursor: 'pointer', 
            background: isDark 
              ? 'rgba(17, 24, 39, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDark
                ? '0 12px 40px rgba(59, 130, 246, 0.3)'
                : '0 12px 40px rgba(30, 64, 175, 0.2)',
            } 
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <AddIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main', 
                mb: 2,
                filter: isDark ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : undefined,
              }} 
            />
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Book Appointment
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Schedule a new appointment with our doctors
            </Typography>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => navigate('/patient/book-appointment')}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                  : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                boxShadow: isDark
                  ? '0 4px 16px rgba(59, 130, 246, 0.3)'
                  : '0 4px 16px rgba(30, 64, 175, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark
                    ? '0 6px 20px rgba(59, 130, 246, 0.4)'
                    : '0 6px 20px rgba(30, 64, 175, 0.4)',
                },
              }}
            >
              Book Now
            </Button>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            cursor: 'pointer', 
            background: isDark 
              ? 'rgba(17, 24, 39, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDark
                ? '0 12px 40px rgba(16, 185, 129, 0.3)'
                : '0 12px 40px rgba(5, 150, 105, 0.2)',
            } 
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <HistoryIcon 
              sx={{ 
                fontSize: 48, 
                color: 'secondary.main', 
                mb: 2,
                filter: isDark ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' : undefined,
              }} 
            />
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Appointment History
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              View your past and upcoming appointments
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              onClick={() => navigate('/patient/appointments')}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: isDark
                  ? '0 4px 16px rgba(16, 185, 129, 0.3)'
                  : '0 4px 16px rgba(5, 150, 105, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark
                    ? '0 6px 20px rgba(16, 185, 129, 0.4)'
                    : '0 6px 20px rgba(5, 150, 105, 0.4)',
                },
              }}
            >
              View History
            </Button>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            cursor: 'pointer', 
            background: isDark 
              ? 'rgba(17, 24, 39, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDark
                ? '0 12px 40px rgba(59, 130, 246, 0.3)'
                : '0 12px 40px rgba(30, 64, 175, 0.2)',
            } 
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <PersonIcon 
              sx={{ 
                fontSize: 48, 
                color: 'info.main', 
                mb: 2,
                filter: isDark ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : undefined,
              }} 
            />
            <Typography variant="h6" fontWeight="bold" mb={1}>
              My Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Update your personal information
            </Typography>
            <Button 
              variant="contained" 
              color="info"
              fullWidth
              onClick={() => navigate('/patient/profile')}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
                  : 'linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)',
                boxShadow: isDark
                  ? '0 4px 16px rgba(59, 130, 246, 0.3)'
                  : '0 4px 16px rgba(30, 64, 175, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark
                    ? '0 6px 20px rgba(59, 130, 246, 0.4)'
                    : '0 6px 20px rgba(30, 64, 175, 0.4)',
                },
              }}
            >
              Manage Profile
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Upcoming Appointments */}
      <Card 
        sx={{ 
          mb: 4,
          background: isDark 
            ? 'rgba(17, 24, 39, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <ScheduleIcon 
                sx={{ 
                  mr: 2, 
                  color: 'primary.main',
                  filter: isDark ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : undefined,
                }} 
              />
              <Typography variant="h6" fontWeight="bold">
                Upcoming Appointments
              </Typography>
            </Box>
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/patient/appointments')}
              endIcon={<CalendarIcon />}
              sx={{
                '&:hover': {
                  backgroundColor: isDark 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              View All
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : upcomingAppointments.length === 0 ? (
            <Box textAlign="center" py={4}>
              <ScheduleIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'text.disabled', 
                  mb: 2,
                  filter: isDark ? 'drop-shadow(0 0 8px rgba(156, 163, 175, 0.3))' : undefined,
                }} 
              />
              <Typography variant="h6" color="text.secondary" mb={1}>
                No Upcoming Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Book your next appointment to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/patient/book-appointment')}
                sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                    : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(59, 130, 246, 0.3)'
                    : '0 4px 16px rgba(30, 64, 175, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(59, 130, 246, 0.4)'
                      : '0 6px 20px rgba(30, 64, 175, 0.4)',
                  },
                }}
              >
                Book Appointment
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingAppointments.map((appointment) => (
                    <TableRow key={appointment.appointment_id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(appointment.appointment_date), 'h:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.doctor?.full_name || 'TBD'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.priority}
                          color={getPriorityColor(appointment.priority) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Patient Info Summary */}
      <Card
        sx={{
          background: isDark 
            ? 'rgba(17, 24, 39, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <PersonIcon 
              sx={{ 
                mr: 2, 
                color: 'info.main',
                filter: isDark ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : undefined,
              }} 
            />
            <Typography variant="h6" fontWeight="bold">
              Patient Information
            </Typography>
          </Box>
          
          <Box 
            display="grid" 
            gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
            gap={3}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Full Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {currentPatient?.full_name || 'Unknown Patient'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Email
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {currentPatient?.email || 'Not provided'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Phone
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {currentPatient?.phone || 'Not provided'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                National ID
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {currentPatient?.national_id || 'Not provided'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Date of Birth
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {currentPatient?.dob ? format(new Date(currentPatient.dob), 'MMM dd, yyyy') : 'Not provided'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Address
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {currentPatient?.address || 'Not provided'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}