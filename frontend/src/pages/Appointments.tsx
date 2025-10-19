import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  DirectionsWalk as WalkIcon,
  Today as TodayIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  appointment_date: string;
  status: string;
  is_walkin: boolean;
  reason: string;
  created_at: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/appointments");
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filterStatus === 'all') return true;
    return appointment.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Scheduled': { color: 'primary' as const, variant: 'outlined' as const },
      'Completed': { color: 'success' as const, variant: 'filled' as const },
      'Cancelled': { color: 'error' as const, variant: 'outlined' as const },
      'No-Show': { color: 'warning' as const, variant: 'filled' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default' as const, variant: 'outlined' as const };

    return (
      <Chip 
        label={status}
        color={config.color}
        variant={config.variant}
        size="small"
      />
    );
  };

  const getWalkinBadge = (isWalkin: boolean) => {
    return (
      <Chip 
        label={isWalkin ? 'Walk-in' : 'Scheduled'}
        color={isWalkin ? 'secondary' : 'default'}
        variant={isWalkin ? 'filled' : 'outlined'}
        size="small"
        icon={isWalkin ? <WalkIcon /> : <CalendarIcon />}
      />
    );
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading appointments...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchAppointments} startIcon={<RefreshIcon />}>
            Try again
          </Button>
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>Error loading appointments</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        alignItems={{ sm: 'center' }} 
        justifyContent="space-between" 
        mb={4}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage patient appointments and scheduling
          </Typography>
        </Box>
        {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Book Appointment
          </Button>
        )}
      </Box>

      {/* Stats Overview */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={3} 
        sx={{ mb: 4 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <CalendarIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Scheduled
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.filter(a => a.status === 'Scheduled').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <WalkIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Walk-ins
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.filter(a => a.is_walkin).length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <TodayIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Today
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.filter(a => {
                    const today = new Date().toDateString();
                    const apptDate = new Date(a.appointment_date).toDateString();
                    return today === apptDate;
                  }).length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'end' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="no-show">No-Show</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => setFilterStatus('all')}
              sx={{ height: 'fit-content' }}
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Appointment List ({filteredAppointments.length})
          </Typography>
        </CardContent>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appointment</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.appointment_id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Appointment #{appointment.appointment_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Patient ID: {appointment.patient_id}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Doctor ID: {appointment.doctor_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatDateTime(appointment.appointment_date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDateTime(appointment.created_at)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(appointment.status)}
                  </TableCell>
                  <TableCell>
                    {getWalkinBadge(appointment.is_walkin)}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                      {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && (
                        <IconButton size="small" color="secondary">
                          <EditIcon />
                        </IconButton>
                      )}
                      {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && (
                        <IconButton size="small" color="error">
                          <CancelIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredAppointments.length === 0 && (
          <Box textAlign="center" py={6}>
            <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              No appointments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterStatus !== 'all' ? 'Try adjusting your filters' : 'Get started by booking your first appointment'}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
