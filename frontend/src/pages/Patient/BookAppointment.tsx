import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  BookOnline as BookIcon,
} from '@mui/icons-material';
import { usePatientStore } from '../../store/patientStore';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

interface Doctor {
  user_id: number;
  full_name: string;
  specialty?: string;
  email: string;
  branch_id?: number;
  branch_name?: string;
}


interface Branch {
  branch_id: number;
  name: string;
  location: string;
  phone?: string;
  email?: string;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const { patient } = usePatientStore();
  const { isDark, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    branch_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    priority: 'normal',
    notes: '',
  });

  useEffect(() => {
    if (!patient) {
      navigate('/patient/login');
      return;
    }
    fetchData();
  }, [patient, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Use patient-specific endpoints
      const [doctorsRes, branchesRes] = await Promise.all([
        api.get('/api/patient-auth/doctors'),
        api.get('/api/branches')
      ]);
      
      setDoctors(doctorsRes.data);
      setBranches(branchesRes.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const appointmentData = {
        ...formData,
        patient_id: patient?.patient_id,
        appointment_date: `${formData.appointment_date}T${formData.appointment_time}:00`,
      };

      // Use the new patient endpoint; backend enforces Pending status
      await api.post('/api/appointments/patient', appointmentData);
      setSuccess('Appointment request submitted. You will be notified after approval.');
      
      // Reset form
      setFormData({
        branch_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
        priority: 'normal',
        notes: '',
      });
      
      // Redirect to appointments after 2 seconds
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    
    // Reset doctor selection when branch changes
    if (field === 'branch_id') {
      setFormData(prev => ({ ...prev, doctor_id: '' }));
    }
  };

  const getFilteredDoctors = () => {
    if (!formData.branch_id) return doctors;
    
    // Handle both string and number comparisons
    const filtered = doctors.filter(doctor => {
      const doctorBranchId = doctor.branch_id?.toString();
      const selectedBranchId = formData.branch_id?.toString();
      return doctorBranchId === selectedBranchId;
    });
    
    return filtered;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

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
            <BookIcon 
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
                Book Appointment
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Schedule your appointment with our medical professionals
              </Typography>
            </Box>
          </Box>
        </Box>
        
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

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: isDark ? alpha(theme.palette.success.main, 0.1) : undefined,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={3}>
          {/* Appointment Form */}
          <Box>
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
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                  <CalendarIcon color="primary" />
                  Appointment Details
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit}>
                  {/* Branch Selection */}
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Branch *</InputLabel>
                      <Select
                        value={formData.branch_id}
                        onChange={(e) => handleInputChange('branch_id', e.target.value)}
                        label="Select Branch *"
                        required
                      >
                        {branches.map((branch) => (
                          <MenuItem key={branch.branch_id} value={branch.branch_id}>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                🏥 {branch.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                📍 {branch.location}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {!formData.branch_id && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Please select a branch to see available doctors
                      </Typography>
                    )}
                  </Box>

                  {/* Doctor Selection */}
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Doctor *</InputLabel>
                      <Select
                        value={formData.doctor_id}
                        onChange={(e) => handleInputChange('doctor_id', e.target.value)}
                        label="Select Doctor *"
                        required
                        disabled={!formData.branch_id}
                      >
                        {getFilteredDoctors().length === 0 && formData.branch_id ? (
                          <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                              No doctors available at this branch
                            </Typography>
                          </MenuItem>
                        ) : (
                          getFilteredDoctors().map((doctor) => (
                            <MenuItem key={doctor.user_id} value={doctor.user_id}>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  👨‍⚕️ {doctor.full_name}
                                </Typography>
                                {doctor.specialty && (
                                  <Typography variant="caption" color="text.secondary">
                                    {doctor.specialty}
                                  </Typography>
                                )}
                                {doctor.branch_name && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    📍 {doctor.branch_name}
                                  </Typography>
                                )}
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                    {!formData.doctor_id && formData.branch_id && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Please select a doctor for your appointment
                      </Typography>
                    )}
                  </Box>

                  <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>

                    <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Appointment Date"
                        value={formData.appointment_date}
                        onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: getMinDate(),
                          max: getMaxDate(),
                        }}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            '& fieldset': {
                              borderColor: '#d1d5db',
                            },
                            '&:hover fieldset': {
                              borderColor: '#9ca3af',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            '&.Mui-focused': {
                              color: '#3b82f6',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#000000',
                            '&::-webkit-calendar-picker-indicator': {
                              filter: 'invert(0)',
                              opacity: 1,
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Appointment Time"
                        value={formData.appointment_time}
                        onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            '& fieldset': {
                              borderColor: '#d1d5db',
                            },
                            '&:hover fieldset': {
                              borderColor: '#9ca3af',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#3b82f6',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#6b7280',
                            '&.Mui-focused': {
                              color: '#3b82f6',
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#000000',
                            '&::-webkit-calendar-picker-indicator': {
                              filter: 'invert(0)',
                              opacity: 1,
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                      <TextField
                        fullWidth
                        label="Reason for Visit"
                        value={formData.reason}
                        onChange={(e) => handleInputChange('reason', e.target.value)}
                        placeholder="Brief description of your symptoms or concerns"
                        required
                      />
                    </Box>

                    <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          label="Priority"
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="normal">Normal</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ gridColumn: '1' }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Additional Notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any additional information you'd like to share with your doctor"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/patient/dashboard')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
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
                      {submitting ? <CircularProgress size={20} color="inherit" /> : 'Book Appointment'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Appointment Info */}
          <Box>
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
                position: 'sticky',
                top: 24,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                  <PersonIcon color="info" />
                  Patient Information
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {patient.full_name}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {patient.email}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {patient.phone || 'Not provided'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      National ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {patient.national_id}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon color="primary" />
                  Booking Tips
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="1" size="small" color="primary" />
                    <Typography variant="body2">
                      Select your preferred branch
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="2" size="small" color="primary" />
                    <Typography variant="body2">
                      Choose your doctor
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="3" size="small" color="primary" />
                    <Typography variant="body2">
                      Select date & time
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="4" size="small" color="primary" />
                    <Typography variant="body2">
                      Describe your symptoms
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="5" size="small" color="primary" />
                    <Typography variant="body2">
                      Submit your request
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}
