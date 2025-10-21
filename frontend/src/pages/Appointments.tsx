import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import api from "../services/api";
import AdminBookingModal from '../components/AdminBookingModal';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Tooltip,
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
  Close as CloseIcon,
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
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    appointment_date: '',
    reason: '',
    status: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBookingSuccess = () => {
    fetchAppointments();
    setSuccess('Appointment booked successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get("/api/appointments");
      console.log('📋 Fetched appointments:', response.data);
      setAppointments(response.data);
    } catch (err: any) {
      console.error('❌ Fetch appointments error:', err);
      setError(err.response?.data?.error || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const approveAppointment = async (id: number) => {
    try {
      console.log('✅ Approving appointment:', id);
      await api.patch(`/api/appointments/${id}/approve`);
      setSuccess('Appointment approved successfully');
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Approve error:', err);
      setError(err.response?.data?.error || 'Failed to approve appointment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const rejectAppointment = async (id: number) => {
    try {
      const reason = prompt('Enter rejection reason (optional):') || '';
      console.log('❌ Rejecting appointment:', id, 'Reason:', reason);
      await api.patch(`/api/appointments/${id}/reject`, { reason });
      setSuccess('Appointment rejected successfully');
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Reject error:', err);
      setError(err.response?.data?.error || 'Failed to reject appointment');
      setTimeout(() => setError(''), 3000);
    }
  };

  /**
   * Parse datetime string from database (ignoring timezone)
   * Handles formats: "2025-10-25T16:20:00.000Z" or "2025-10-25 16:20:00"
   * Returns format: "2025-10-25T16:20" for datetime-local input
   */
  const parseDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    // Remove timezone info and parse as local time
    // If format is "2025-10-25T16:20:00.000Z", extract "2025-10-25 16:20:00"
    let cleanDate = dateString.replace('T', ' ').replace('.000Z', '').substring(0, 16);
    
    // If it has 'T', it's already in ISO format, just truncate
    if (dateString.includes('T')) {
      cleanDate = dateString.substring(0, 16);
    } else {
      // If format is "2025-10-25 16:20:00", convert to "2025-10-25T16:20"
      cleanDate = dateString.substring(0, 16).replace(' ', 'T');
    }
    
    console.log('📅 Parsing date for input:', dateString, '→', cleanDate);
    return cleanDate;
  };

  /**
   * Format datetime for display (ignoring timezone)
   * Input: "2025-10-25T16:20:00.000Z" or "2025-10-25 16:20:00"
   * Output: "Oct 25, 2025, 04:20 PM"
   */
  const formatDateTimeDisplay = (dateString: string): string => {
    if (!dateString) return 'Invalid Date';
    
    try {
      // Extract date components manually to avoid timezone conversion
      let dateStr = dateString;
      
      // Handle ISO format with timezone
      if (dateStr.includes('T')) {
        dateStr = dateStr.replace('T', ' ').replace('.000Z', '');
      }
      
      // Parse: "2025-10-25 16:20:00"
      const parts = dateStr.split(' ');
      const datePart = parts[0]; // "2025-10-25"
      const timePart = parts[1] ? parts[1].substring(0, 5) : '00:00'; // "16:20"
      
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
      
      // Create date without timezone conversion
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
      
      // Format manually to avoid timezone issues
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      
      return `${monthNames[date.getMonth()]} ${day}, ${year}, ${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid Date';
    }
  };

  /**
   * Convert datetime-local input to MySQL format
   * Input: "2025-10-25T16:20"
   * Output: "2025-10-25 16:20:00"
   */
  const formatDateForDatabase = (localDatetime: string): string => {
    if (!localDatetime) return '';
    
    // localDatetime format: "2025-10-25T16:20"
    const [datePart, timePart] = localDatetime.split('T');
    const result = `${datePart} ${timePart}:00`;
    
    console.log('📅 Formatting date for database:', localDatetime, '→', result);
    return result;
  };

  // VIEW APPOINTMENT HANDLER
  const handleViewAppointment = (appointment: Appointment) => {
    console.log('👁️ Viewing appointment:', appointment);
    setSelectedAppointment(appointment);
    setViewModalOpen(true);
  };

  // CLOSE VIEW MODAL
  const handleCloseView = () => {
    setViewModalOpen(false);
    setSelectedAppointment(null);
  };

  // EDIT APPOINTMENT HANDLER
  const handleEditAppointment = (appointment: Appointment) => {
    console.log('✏️ Editing appointment:', appointment);
    console.log('📅 Original appointment_date:', appointment.appointment_date);
    
    setSelectedAppointment(appointment);
    
    // Parse the date for the input field
    const formattedDate = parseDateForInput(appointment.appointment_date);
    console.log('📅 Formatted for input:', formattedDate);
    
    setEditFormData({
      appointment_date: formattedDate,
      reason: appointment.reason || '',
      status: appointment.status,
    });
    setEditModalOpen(true);
  };

  // CLOSE EDIT MODAL
  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setSelectedAppointment(null);
    setEditFormData({
      appointment_date: '',
      reason: '',
      status: '',
    });
  };

  // SAVE EDITED APPOINTMENT
  const handleSaveEdit = async () => {
    if (!selectedAppointment) return;

    // Validation
    if (!editFormData.appointment_date) {
      setError('Appointment date is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!editFormData.status) {
      setError('Status is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSaving(true);
      setError('');

      console.log('💾 Input datetime:', editFormData.appointment_date);

      // Convert to MySQL format
      const mysqlDatetime = formatDateForDatabase(editFormData.appointment_date);
      console.log('💾 MySQL datetime:', mysqlDatetime);

      const updateData = {
        appointment_date: mysqlDatetime,
        reason: editFormData.reason.trim(),
        status: editFormData.status,
      };

      console.log('📤 Sending update request:', updateData);

      const response = await api.put(`/api/appointments/${selectedAppointment.appointment_id}`, updateData);

      console.log('✅ Update response:', response.data);

      setSuccess('Appointment updated successfully');
      handleCloseEdit();
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Update error:', err);
      console.error('❌ Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to update appointment';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // CANCEL APPOINTMENT HANDLER
  const handleCancelAppointment = async (appointment: Appointment) => {
    const confirmMessage = user?.role === 'Doctor' 
      ? `Are you sure you want to cancel appointment #${appointment.appointment_id}? This will notify the patient.`
      : `Are you sure you want to cancel appointment #${appointment.appointment_id}?`;
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('🚫 Cancelling appointment:', appointment.appointment_id, 'by', user?.role);
      
      const response = await api.patch(`/api/appointments/${appointment.appointment_id}`, {
        status: 'Cancelled'
      });

      console.log('✅ Cancel response:', response.data);
      
      setSuccess('Appointment cancelled successfully');
      await fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Cancel error:', err);
      console.error('❌ Error response:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to cancel appointment';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Check permissions for different actions
  const canScheduleAppointments = ['System Administrator', 'Branch Manager', 'Receptionist'].includes(user?.role || '');
  const canEditAppointment = ['System Administrator', 'Branch Manager', 'Receptionist', 'Doctor'].includes(user?.role || '');
  const canCancelAppointment = ['System Administrator', 'Branch Manager', 'Receptionist', 'Doctor'].includes(user?.role || '');
  const canApproveReject = ['System Administrator', 'Branch Manager', 'Receptionist'].includes(user?.role || '');
  const isDoctor = user?.role === 'Doctor';

  const filteredAppointments = appointments
    .filter(a => {
      // Doctors only see Approved appointments
      if (isDoctor) {
        return a.status === 'Approved';
      }
      return true;
    })
    .filter(appointment => {
      if (filterStatus === 'all') return true;
      return appointment.status.toLowerCase() === filterStatus.toLowerCase();
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Scheduled': { color: 'primary' as const, variant: 'outlined' as const },
      'Completed': { color: 'success' as const, variant: 'filled' as const },
      'Cancelled': { color: 'error' as const, variant: 'outlined' as const },
      'No-Show': { color: 'warning' as const, variant: 'filled' as const },
      'Approved': { color: 'success' as const, variant: 'filled' as const },
      'Pending': { color: 'warning' as const, variant: 'outlined' as const },
      'Rejected': { color: 'error' as const, variant: 'filled' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: 'default' as const, 
      variant: 'outlined' as const 
    };

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
            {isDoctor 
              ? 'View and manage your approved appointments' 
              : 'Manage patient appointments and scheduling'}
          </Typography>
        </Box>
        {canScheduleAppointments && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setBookingModalOpen(true)}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Book Appointment
          </Button>
        )}
      </Box>

      {/* Snackbar for Messages */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={5000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Stats Cards */}
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
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="h4" component="div">{filteredAppointments.length}</Typography>
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
                  {isDoctor ? 'Approved' : 'Scheduled'}
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Approved').length}
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
                <Typography variant="body2" color="text.secondary">Walk-ins</Typography>
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
                <Typography variant="body2" color="text.secondary">Today</Typography>
                <Typography variant="h4" component="div">
                  {appointments.filter(a => {
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    return a.appointment_date.startsWith(todayStr);
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
                <MenuItem value="approved">Approved</MenuItem>
                {!isDoctor && <MenuItem value="pending">Pending</MenuItem>}
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                {!isDoctor && <MenuItem value="no-show">No-Show</MenuItem>}
                {!isDoctor && <MenuItem value="rejected">Rejected</MenuItem>}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => setFilterStatus('all')}
              sx={{ height: 'fit-content' }}
            >
              Clear Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAppointments}
              sx={{ height: 'fit-content' }}
            >
              Refresh
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
                <TableRow key={appointment.appointment_id} hover>
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
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                        {formatDateTimeDisplay(appointment.appointment_date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDateTimeDisplay(appointment.created_at)}
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
                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                      {/* VIEW BUTTON */}
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewAppointment(appointment)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      {/* EDIT BUTTON */}
                      {canEditAppointment && (
                        <Tooltip title="Edit Appointment">
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* CANCEL BUTTON */}
                      {canCancelAppointment && appointment.status !== 'Cancelled' && (
                        <Tooltip title="Cancel Appointment">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleCancelAppointment(appointment)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* APPROVE/REJECT BUTTONS */}
                      {canApproveReject && appointment.status === 'Pending' && (
                        <>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="success" 
                            onClick={() => approveAppointment(appointment.appointment_id)}
                            sx={{ minWidth: 80 }}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error" 
                            onClick={() => rejectAppointment(appointment.appointment_id)}
                            sx={{ minWidth: 80 }}
                          >
                            Reject
                          </Button>
                        </>
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
              {filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : isDoctor 
                  ? 'No approved appointments available' 
                  : 'Get started by booking your first appointment'}
            </Typography>
          </Box>
        )}
      </Card>

      {/* VIEW MODAL */}
      <Dialog open={viewModalOpen} onClose={handleCloseView} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Appointment Details</Typography>
            <IconButton onClick={handleCloseView} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAppointment && (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Appointment ID</Typography>
                <Typography variant="body1">{selectedAppointment.appointment_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Patient ID</Typography>
                <Typography variant="body1">{selectedAppointment.patient_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Doctor ID</Typography>
                <Typography variant="body1">{selectedAppointment.doctor_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {formatDateTimeDisplay(selectedAppointment.appointment_date)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 1 }}>{getStatusBadge(selectedAppointment.status)}</Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                <Box sx={{ mt: 1 }}>{getWalkinBadge(selectedAppointment.is_walkin)}</Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                <Typography variant="body1">{selectedAppointment.reason || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                <Typography variant="body1">{formatDateTimeDisplay(selectedAppointment.created_at)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Appointment</Typography>
            <IconButton onClick={handleCloseEdit} size="small" disabled={saving}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Appointment Date & Time"
              type="datetime-local"
              value={editFormData.appointment_date}
              onChange={(e) => {
                console.log('📅 Date input changed:', e.target.value);
                setEditFormData({ ...editFormData, appointment_date: e.target.value });
              }}
              InputLabelProps={{ shrink: true }}
              required
              disabled={saving}
              helperText="Select the appointment date and time (your local timezone)"
            />
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={editFormData.reason}
              onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
              placeholder="Enter reason for appointment..."
              disabled={saving}
            />
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={editFormData.status}
                label="Status"
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                disabled={saving}
              >
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                {!isDoctor && <MenuItem value="Pending">Pending</MenuItem>}
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="No-Show">No-Show</MenuItem>
                {!isDoctor && <MenuItem value="Rejected">Rejected</MenuItem>}
              </Select>
            </FormControl>
            {isDoctor && (
              <Alert severity="info">
                You can reschedule appointments and change their status. Patients will be notified of any changes.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEdit} disabled={saving} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Booking Modal */}
      {canScheduleAppointments && (
        <AdminBookingModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </Box>
  );
}