import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { usePatientStore } from '../../store/patientStore';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

interface Appointment {
  appointment_id: number;
  appointment_date: string;
  status: string;
  reason: string;
  priority: string;
  notes?: string;
  doctor?: {
    full_name: string;
    specialty?: string;
  };
  treatment?: {
    name: string;
    cost: number;
  };
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AppointmentHistory() {
  const navigate = useNavigate();
  const { patient } = usePatientStore();
  const { isDark, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!patient) {
      navigate('/patient/login');
      return;
    }
    fetchAppointments();
  }, [patient, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patient-auth/appointments');
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'warning';
      case 'in progress': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return <PendingIcon />;
      case 'completed': return <CheckCircleIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'no-show': return <AccessTimeIcon />;
      case 'in progress': return <ScheduleIcon />;
      default: return <PendingIcon />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return {
        date: format(date, 'MMM dd, yyyy'),
        time: format(date, 'h:mm a'),
        full: format(date, 'EEEE, MMMM dd, yyyy \'at\' h:mm a')
      };
    } catch (error) {
      return {
        date: 'Invalid Date',
        time: '',
        full: 'Invalid Date'
      };
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    isAfter(parseISO(apt.appointment_date), startOfDay(new Date())) && 
    apt.status.toLowerCase() === 'scheduled'
  );

  const pastAppointments = appointments.filter(apt => 
    isBefore(parseISO(apt.appointment_date), startOfDay(new Date())) || 
    apt.status.toLowerCase() === 'completed' ||
    apt.status.toLowerCase() === 'cancelled' ||
    apt.status.toLowerCase() === 'no-show'
  );

  const allAppointments = appointments;

  if (!patient) {
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
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            onClick={() => navigate('/patient/dashboard')}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: isDark 
                  ? alpha(theme.palette.primary.main, 0.1) 
                  : alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={2}>
            <HistoryIcon 
              sx={{ 
                fontSize: 40, 
                color: 'primary.main',
                filter: isDark ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : undefined,
              }} 
            />
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
                Appointment History
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View your past and upcoming appointments
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchAppointments}
              disabled={loading}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: isDark 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
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
            Book New
          </Button>
          
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
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: isDark ? alpha(theme.palette.error.main, 0.1) : undefined,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card
        sx={{
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="appointment tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarIcon />
                  All Appointments
                  <Badge badgeContent={allAppointments.length} color="primary" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon />
                  Upcoming
                  <Badge badgeContent={upcomingAppointments.length} color="success" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <HistoryIcon />
                  Past
                  <Badge badgeContent={pastAppointments.length} color="default" />
                </Box>
              } 
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AppointmentTable 
            appointments={allAppointments} 
            loading={loading} 
            isDark={isDark} 
            theme={theme}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getPriorityColor={getPriorityColor}
            formatAppointmentDate={formatAppointmentDate}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AppointmentTable 
            appointments={upcomingAppointments} 
            loading={loading} 
            isDark={isDark} 
            theme={theme}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getPriorityColor={getPriorityColor}
            formatAppointmentDate={formatAppointmentDate}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AppointmentTable 
            appointments={pastAppointments} 
            loading={loading} 
            isDark={isDark} 
            theme={theme}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getPriorityColor={getPriorityColor}
            formatAppointmentDate={formatAppointmentDate}
          />
        </TabPanel>
      </Card>
    </Box>
  );
}

interface AppointmentTableProps {
  appointments: Appointment[];
  loading: boolean;
  isDark: boolean;
  theme: any;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  formatAppointmentDate: (dateString: string) => { date: string; time: string; full: string };
}

function AppointmentTable({ 
  appointments, 
  loading, 
  isDark, 
  theme, 
  getStatusColor, 
  getStatusIcon, 
  getPriorityColor, 
  formatAppointmentDate 
}: AppointmentTableProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (appointments.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <CalendarIcon 
          sx={{ 
            fontSize: 64, 
            color: 'text.disabled', 
            mb: 2,
            filter: isDark ? 'drop-shadow(0 0 8px rgba(156, 163, 175, 0.3))' : undefined,
          }} 
        />
        <Typography variant="h6" color="text.secondary" mb={1}>
          No Appointments Found
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {appointments.length === 0 ? 'You haven\'t booked any appointments yet.' : 'No appointments match the current filter.'}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Date & Time
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Doctor
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Reason
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Status
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Priority
                </Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => {
            const { date, time, full } = formatAppointmentDate(appointment.appointment_date);
            return (
              <TableRow 
                key={appointment.appointment_id}
                sx={{
                  '&:hover': {
                    backgroundColor: isDark 
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.01)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                      {date}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {time}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {appointment.doctor?.full_name?.charAt(0) || 'D'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {appointment.doctor?.full_name || 'Dr. Unknown'}
                      </Typography>
                      {appointment.doctor?.specialty && (
                        <Typography variant="caption" color="text.secondary">
                          {appointment.doctor.specialty}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {appointment.reason}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(appointment.status)}
                    label={appointment.status}
                    color={getStatusColor(appointment.status) as any}
                    size="small"
                    variant="filled"
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
