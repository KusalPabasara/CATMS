import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  LocalHospital,
  Schedule,
  Notes,
  Save,
  Close,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Patient {
  patient_id: number;
  full_name: string;
  email: string;
  phone: string;
  national_id: string;
}

interface Doctor {
  user_id: number;
  full_name: string;
  specialty?: string;
  email: string;
}

interface Treatment {
  treatment_type_id: number;
  treatment_name: string;
  description: string;
  standard_cost: number;
  category?: string;
}

interface Branch {
  branch_id: number;
  name: string;
  location: string;
  phone: string;
}

interface AdminBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AdminBookingModal: React.FC<AdminBookingModalProps> = ({ 
  open, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    branch_id: '',
    appointment_date: null as Date | null,
    reason: '',
    treatment_id: '',
    is_walkin: false,
    notes: '',
  });

  // Options data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [patientsRes, doctorsRes, treatmentsRes, branchesRes] = await Promise.all([
        api.get('/api/patients'),
        api.get('/api/users/by-role?role=doctor'),
        api.get('/api/treatment-catalogue'),
        api.get('/api/branches'),
      ]);

      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setTreatments(treatmentsRes.data);
      setBranches(branchesRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.patient_id) {
        throw new Error('Please select a patient');
      }
      if (!formData.doctor_id) {
        throw new Error('Please select a doctor');
      }
      if (!formData.appointment_date) {
        throw new Error('Please select appointment date and time');
      }
      if (!formData.reason.trim()) {
        throw new Error('Please provide a reason for the appointment');
      }

      // Check if appointment is in the future
      const now = new Date();
      if (formData.appointment_date <= now) {
        throw new Error('Appointment must be scheduled for a future date and time');
      }

      // Check if appointment is during working hours (9 AM - 5 PM)
      const appointmentHour = formData.appointment_date.getHours();
      if (appointmentHour < 9 || appointmentHour >= 17) {
        throw new Error('Appointments must be scheduled between 9:00 AM and 5:00 PM');
      }

      const appointmentData = {
        patient_id: parseInt(formData.patient_id),
        doctor_id: parseInt(formData.doctor_id),
        branch_id: formData.branch_id ? parseInt(formData.branch_id) : null,
        appointment_date: formData.appointment_date.toISOString(),
        reason: formData.reason.trim(),
        treatment_id: formData.treatment_id ? parseInt(formData.treatment_id) : null,
        is_walkin: formData.is_walkin,
        notes: formData.notes.trim(),
        created_by_role: user?.role, // This will make it auto-approved
      };

      await api.post('/api/appointments', appointmentData);
      
      setSuccess('Appointment booked successfully!');
      
      // Reset form
      setFormData({
        patient_id: '',
        doctor_id: '',
        branch_id: '',
        appointment_date: null,
        reason: '',
        treatment_id: '',
        is_walkin: false,
        notes: '',
      });

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.error || err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        patient_id: '',
        doctor_id: '',
        branch_id: '',
        appointment_date: null,
        reason: '',
        treatment_id: '',
        is_walkin: false,
        notes: '',
      });
      setError('');
      setSuccess('');
      onClose();
    }
  };

  const selectedPatient = patients.find(p => p.patient_id.toString() === formData.patient_id);
  const selectedDoctor = doctors.find(d => d.user_id.toString() === formData.doctor_id);
  const selectedTreatment = treatments.find(t => t.treatment_type_id.toString() === formData.treatment_id);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarToday color="primary" />
          <Typography variant="h6" component="div">
            Book New Appointment
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create a new appointment for a patient
        </Typography>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading data...
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
              gap={3}
            >
              {/* Patient Selection */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <FormControl fullWidth required>
                  <InputLabel>Select Patient</InputLabel>
                  <Select
                    value={formData.patient_id}
                    onChange={(e) => handleInputChange('patient_id', e.target.value)}
                    label="Select Patient"
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.patient_id} value={patient.patient_id.toString()}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {patient.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patient.email} • {patient.phone}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedPatient && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Patient ID:</strong> {selectedPatient.patient_id} • 
                      <strong> National ID:</strong> {selectedPatient.national_id}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Doctor Selection */}
              <Box>
                <FormControl fullWidth required>
                  <InputLabel>Select Doctor</InputLabel>
                  <Select
                    value={formData.doctor_id}
                    onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                    label="Select Doctor"
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.user_id} value={doctor.user_id.toString()}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {doctor.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.specialty || 'General Practice'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Branch Selection */}
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Select Branch (Optional)</InputLabel>
                  <Select
                    value={formData.branch_id}
                    onChange={(e) => handleInputChange('branch_id', e.target.value)}
                    label="Select Branch (Optional)"
                  >
                    <MenuItem value="">
                      <em>No specific branch</em>
                    </MenuItem>
                    {branches.map((branch) => (
                      <MenuItem key={branch.branch_id} value={branch.branch_id.toString()}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {branch.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {branch.location}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Appointment Date & Time */}
              <Box>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Appointment Date & Time"
                    value={formData.appointment_date}
                    onChange={(newValue) => handleInputChange('appointment_date', newValue)}
                    minDateTime={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        helperText: 'Select date and time (9 AM - 5 PM)',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              {/* Treatment Selection */}
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Select Treatment (Optional)</InputLabel>
                  <Select
                    value={formData.treatment_id}
                    onChange={(e) => handleInputChange('treatment_id', e.target.value)}
                    label="Select Treatment (Optional)"
                  >
                    <MenuItem value="">
                      <em>No specific treatment</em>
                    </MenuItem>
                    {treatments.map((treatment) => (
                      <MenuItem key={treatment.treatment_type_id} value={treatment.treatment_type_id.toString()}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {treatment.treatment_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${treatment.standard_cost} • {treatment.category || 'General'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Reason */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  required
                  label="Reason for Appointment"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="e.g., General checkup, Follow-up consultation, Specific symptoms..."
                  multiline
                  rows={2}
                />
              </Box>

              {/* Walk-in Toggle */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Divider sx={{ my: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_walkin}
                      onChange={(e) => handleInputChange('is_walkin', e.target.checked)}
                    />
                  }
                  label="Walk-in Appointment"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Check this if the patient is coming without a prior appointment
                </Typography>
              </Box>

              {/* Additional Notes */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  label="Additional Notes (Optional)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information about the appointment..."
                  multiline
                  rows={3}
                />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || loading}
          startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
          sx={{ minWidth: 120 }}
        >
          {submitting ? 'Booking...' : 'Book Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminBookingModal;
