import { useEffect, useState } from "react";
import axios from "axios";
import type { AppointmentForm, Doctor, Patient } from "./types";
import { useAuthStore } from "../../store/authStore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';

interface BookFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BookForm({ onSuccess, onCancel }: BookFormProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState<AppointmentForm>({
    appointment_date: "",
    doctor_id: "",
    patient_id: "",
    reason: "",
    is_walkin: false,
    branch_id: user?.branch_id || 1,
    priority: "normal",
    notes: ""
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    national_id: '',
    phone: '',
    email: '',
    date_of_birth: '',
    address: ''
  });

  const isAdmin = user?.role === 'System Administrator' || user?.role === 'Branch Manager';

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      setLoadingData(true);
      const [patientsRes, doctorsRes] = await Promise.all([
        axios.get("/api/patients"),
        axios.get("/api/users")
      ]);
      
      setPatients(patientsRes.data);
      // Filter only doctors
      const doctorUsers = doctorsRes.data.filter((u: any) => u.Role?.name === 'Doctor');
      setDoctors(doctorUsers);
    } catch (err: any) {
      setError('Failed to load form data. Please try again.');
      console.error('Error fetching form data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const createNewPatient = async () => {
    try {
      const response = await axios.post("/api/patients", newPatient);
      setPatients(prev => [...prev, response.data]);
      setForm(prev => ({ ...prev, patient_id: response.data.patient_id.toString() }));
      setShowPatientForm(false);
      setNewPatient({
        full_name: '',
        national_id: '',
        phone: '',
        email: '',
        date_of_birth: '',
        address: ''
      });
    } catch (err: any) {
      setError('Failed to create patient. Please try again.');
      console.error('Error creating patient:', err);
    }
  };

  const validateForm = (): boolean => {
    if (!form.patient_id) {
      setError('Please select a patient');
      return false;
    }
    if (!form.doctor_id) {
      setError('Please select a doctor');
      return false;
    }
    if (!form.appointment_date) {
      setError('Please select appointment date and time');
      return false;
    }
    if (!form.reason.trim()) {
      setError('Please provide a reason for the appointment');
      return false;
    }
    
    // Check if appointment is in the past
    const selectedDate = new Date(form.appointment_date);
    const now = new Date();
    if (selectedDate < now) {
      setError('Appointment date cannot be in the past');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      
      const appointmentData = {
        ...form,
        patient_id: parseInt(form.patient_id),
        doctor_id: parseInt(form.doctor_id),
        branch_id: user?.branch_id || 1
      };
      
      await axios.post("/api/appointments", appointmentData);
      
      setSuccess('Appointment booked successfully! ✅');
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to book appointment. Please try again.';
      setError(errorMessage);
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppointmentForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Set default appointment time to next hour
  useEffect(() => {
    if (!form.appointment_date) {
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1);
      nextHour.setMinutes(0);
      nextHour.setSeconds(0);
      setForm(prev => ({ ...prev, appointment_date: formatDateForInput(nextHour) }));
    }
  }, []);

  if (loadingData) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={8}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading form data...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <HospitalIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h5" component="h3" fontWeight="bold">
              {isAdmin ? 'Admin: Book Patient Appointment' : 'Book New Appointment'}
            </Typography>
          </Box>
          <IconButton onClick={onCancel} color="default">
            <CloseIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
              {/* Patient Selection */}
              <Box flex={1}>
              <Box display="flex" alignItems="center" mb={1}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.primary">
                  Patient Selection
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <FormControl required fullWidth>
                  <InputLabel>Select Patient</InputLabel>
                  <Select
                    value={form.patient_id}
                    label="Select Patient"
                    onChange={(e) => handleInputChange('patient_id', e.target.value)}
                  >
                    <MenuItem value="">Select Patient</MenuItem>
                    {patients.map((patient) => (
                      <MenuItem key={patient.patient_id} value={patient.patient_id}>
                        {patient.full_name} - {patient.national_id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {isAdmin && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setShowPatientForm(!showPatientForm)}
                    sx={{ minWidth: 56, height: 56 }}
                    title="Add New Patient"
                  >
                    <AddIcon />
                  </Button>
                )}
              </Box>
              </Box>

              {/* Doctor Selection */}
              <Box flex={1}>
              <Box display="flex" alignItems="center" mb={1}>
                <HospitalIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.primary">
                  Doctor Selection
                </Typography>
              </Box>
              <FormControl required fullWidth>
                <InputLabel>Select Doctor</InputLabel>
                <Select
                  value={form.doctor_id}
                  label="Select Doctor"
                  onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                >
                  <MenuItem value="">Select Doctor</MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.user_id} value={doctor.user_id}>
                      Dr. {doctor.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Box>
            </Box>

            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
              {/* Appointment Date & Time */}
              <Box flex={1}>
              <Box display="flex" alignItems="center" mb={1}>
                <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.primary">
                  Appointment Date & Time
                </Typography>
              </Box>
              <TextField
                type="datetime-local"
                required
                fullWidth
                value={form.appointment_date}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              </Box>

              {/* Priority Level (Admin Only) */}
              {isAdmin && (
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.primary" mb={1}>
                    Priority Level
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Priority Level</InputLabel>
                    <Select
                      value={form.priority}
                      label="Priority Level"
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Branch */}
              {!isAdmin && (
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.primary" mb={1}>
                    Branch
                  </Typography>
                  <TextField
                    fullWidth
                    value={`Branch ${form.branch_id}`}
                    disabled
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* New Patient Form (Admin Only) */}
          <Collapse in={showPatientForm && isAdmin}>
            <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" component="h4" mb={2} fontWeight="medium">
                  Add New Patient
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={newPatient.full_name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                    <TextField
                      fullWidth
                      label="National ID"
                      value={newPatient.national_id}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, national_id: e.target.value }))}
                    />
                  </Box>
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                    <TextField
                      fullWidth
                      label="Phone"
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </Box>
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </Box>
                </Box>
                <Box display="flex" gap={2} mt={3}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={createNewPatient}
                  >
                    Create Patient
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setShowPatientForm(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Collapse>

          {/* Reason for Visit */}
          <Box mt={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <NotesIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.primary">
                Reason for Visit
              </Typography>
            </Box>
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              value={form.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Describe the reason for this appointment..."
            />
          </Box>

          {/* Admin Notes */}
          {isAdmin && (
            <Box mt={3}>
              <Typography variant="subtitle2" color="text.primary" mb={1}>
                Admin Notes (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={form.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes for staff..."
              />
            </Box>
          )}

          {/* Walk-in Toggle */}
          <Box mt={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_walkin}
                  onChange={(e) => handleInputChange('is_walkin', e.target.checked)}
                  color="primary"
                />
              }
              label="This is a walk-in appointment"
            />
          </Box>

          {/* Form Actions */}
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            gap={2} 
            mt={4} 
            pt={3} 
            sx={{ borderTop: 1, borderColor: 'divider' }}
          >
            <Button
              variant="outlined"
              color="secondary"
              onClick={onCancel}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <HospitalIcon />}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
