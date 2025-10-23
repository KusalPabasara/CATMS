import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LocalHospital as EmergencyIcon } from '@mui/icons-material';
import axios from 'axios';

interface EmergencyAppointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  appointment_date: string;
  status: string;
  is_walkin: boolean;
  reason: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  Patient?: {
    full_name: string;
    phone: string;
    national_id: string;
  };
  Doctor?: {
    full_name: string;
    specialty: string;
  };
  Branch?: {
    name: string;
  };
}

const EmergencyWalkIns: React.FC = () => {
  const [emergencyAppointments, setEmergencyAppointments] = useState<EmergencyAppointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<EmergencyAppointment | null>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    branch_id: '',
    appointment_date: '',
    reason: '',
    priority: 'Medium'
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const priorities = [
    { value: 'Low', label: 'Low', color: 'success' },
    { value: 'Medium', label: 'Medium', color: 'warning' },
    { value: 'High', label: 'High', color: 'error' },
    { value: 'Critical', label: 'Critical', color: 'error' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch emergency appointments
      const emergencyResponse = await axios.get('/api/appointments/emergency/list');
      let emergencyData = emergencyResponse.data;
      
      // Add mock data if empty
      if (!emergencyData || emergencyData.length === 0) {
        emergencyData = [
          {
            appointment_id: 1001,
            patient_id: 1,
            doctor_id: 1,
            branch_id: 1,
            appointment_date: new Date().toISOString(),
            status: 'Scheduled',
            is_walkin: true,
            reason: 'Severe chest pain',
            priority: 'Critical',
            Patient: {
              full_name: 'Kamal Perera',
              phone: '+94 77 123 4567',
              national_id: '123456789V'
            },
            Doctor: {
              full_name: 'Dr. Priya Fernando',
              specialty: 'Cardiology'
            },
            Branch: {
              name: 'Colombo Main Branch'
            }
          },
          {
            appointment_id: 1002,
            patient_id: 2,
            doctor_id: 2,
            branch_id: 2,
            appointment_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'Completed',
            is_walkin: true,
            reason: 'High fever and headache',
            priority: 'High',
            Patient: {
              full_name: 'Nimal Silva',
              phone: '+94 77 234 5678',
              national_id: '234567890V'
            },
            Doctor: {
              full_name: 'Dr. Rajesh Perera',
              specialty: 'General Medicine'
            },
            Branch: {
              name: 'Kandy Branch'
            }
          },
          {
            appointment_id: 1003,
            patient_id: 3,
            doctor_id: 3,
            branch_id: 3,
            appointment_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            status: 'Scheduled',
            is_walkin: true,
            reason: 'Accident injury',
            priority: 'High',
            Patient: {
              full_name: 'Sanduni Fernando',
              phone: '+94 77 345 6789',
              national_id: '345678901V'
            },
            Doctor: {
              full_name: 'Dr. Anjali Silva',
              specialty: 'Emergency Medicine'
            },
            Branch: {
              name: 'Galle Branch'
            }
          }
        ];
      }
      
      setEmergencyAppointments(emergencyData);

      // Fetch patients
      const patientsResponse = await axios.get('/api/patients');
      setPatients(patientsResponse.data || []);

      // Fetch doctors
      const doctorsResponse = await axios.get('/api/users/by-role?role=Doctor');
      setDoctors(doctorsResponse.data || []);

      // Fetch branches
      const branchesResponse = await axios.get('/api/branches');
      setBranches(branchesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmergency = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      branch_id: '',
      appointment_date: new Date().toISOString().slice(0, 16),
      reason: '',
      priority: 'Medium'
    });
    setEditingAppointment(null);
    setShowAddForm(true);
  };

  const handleEditEmergency = (appointment: EmergencyAppointment) => {
    setFormData({
      patient_id: appointment.patient_id.toString(),
      doctor_id: appointment.doctor_id.toString(),
      branch_id: appointment.branch_id.toString(),
      appointment_date: new Date(appointment.appointment_date).toISOString().slice(0, 16),
      reason: appointment.reason,
      priority: appointment.priority
    });
    setEditingAppointment(appointment);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        branch_id: parseInt(formData.branch_id),
        is_walkin: true,
        status: 'Scheduled'
      };

      if (editingAppointment) {
        await axios.put(`/api/appointments/${editingAppointment.appointment_id}`, submitData);
        setAlert({ type: 'success', message: 'Emergency appointment updated successfully' });
      } else {
        await axios.post('/api/appointments/emergency', submitData);
        setAlert({ type: 'success', message: 'Emergency appointment created successfully' });
      }
      
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving emergency appointment:', error);
      setAlert({ type: 'error', message: 'Failed to save emergency appointment' });
    }
  };

  const handleDeleteEmergency = async (appointmentId: number) => {
    if (window.confirm('Are you sure you want to delete this emergency appointment?')) {
      try {
        await axios.delete(`/api/appointments/${appointmentId}`);
        setAlert({ type: 'success', message: 'Emergency appointment deleted successfully' });
        fetchData();
      } catch (error) {
        console.error('Error deleting emergency appointment:', error);
        setAlert({ type: 'error', message: 'Failed to delete emergency appointment' });
      }
    }
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}`, { status: newStatus });
      setAlert({ type: 'success', message: 'Status updated successfully' });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      setAlert({ type: 'error', message: 'Failed to update status' });
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'default';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      case 'No-Show': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Emergency Walk-ins
        </Typography>
        <Button
          variant="contained"
          startIcon={<EmergencyIcon />}
          onClick={handleAddEmergency}
          sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
        >
          Add Emergency
        </Button>
      </Box>

      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Emergency Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Emergencies
              </Typography>
              <Typography variant="h4">
                {emergencyAppointments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Cases
              </Typography>
              <Typography variant="h4" color="error">
                {emergencyAppointments.filter(apt => apt.priority === 'Critical').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Cases
              </Typography>
              <Typography variant="h4" color="warning">
                {emergencyAppointments.filter(apt => apt.status === 'Scheduled').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Today
              </Typography>
              <Typography variant="h4" color="success">
                {emergencyAppointments.filter(apt => apt.status === 'Completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emergency Appointments Table */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Emergency Cases ({emergencyAppointments.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emergencyAppointments.map((appointment) => (
                <TableRow key={appointment.appointment_id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {appointment.Patient?.full_name || `Patient ID: ${appointment.patient_id}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.Patient?.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {appointment.Doctor?.full_name || `Doctor ID: ${appointment.doctor_id}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.Doctor?.specialty || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.Branch?.name || `Branch ID: ${appointment.branch_id}`} 
                      color="primary" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.priority} 
                      color={getPriorityColor(appointment.priority) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {appointment.reason}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(appointment.appointment_date).toLocaleString()}
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditEmergency(appointment)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      {appointment.status === 'Scheduled' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleStatusChange(appointment.appointment_id, 'Completed')}
                        >
                          Complete
                        </Button>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteEmergency(appointment.appointment_id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Emergency Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? 'Edit Emergency Appointment' : 'Add New Emergency Case'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  label="Patient"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.patient_id} value={patient.patient_id}>
                      {patient.full_name} - {patient.national_id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  label="Doctor"
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.user_id} value={doctor.user_id}>
                      {doctor.full_name} - {doctor.specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  label="Branch"
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  label="Priority"
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Date & Time"
                type="datetime-local"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Reason"
                multiline
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                placeholder="Describe the emergency situation..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddForm(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="error">
            {editingAppointment ? 'Update' : 'Create'} Emergency
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyWalkIns;