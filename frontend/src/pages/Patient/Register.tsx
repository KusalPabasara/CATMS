import { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import MargaLogo from '../../components/MargaLogo';
export default function PatientRegister() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    national_id: '',
    dob: '',
    gender: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Clear any existing messages immediately
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 100);

    // Validate form
    if (!formData.email || !formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        national_id: formData.national_id,
        dob: formData.dob || null,
        gender: formData.gender || null,
        address: formData.address
      };

      const response = await api.post('/api/patient-auth/register', registrationData);
      
      if (response.data.patient) {
        setSuccess('Registration successful! Please login with your credentials.');
        
        // Clear the form
        setFormData({
          full_name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          national_id: '',
          dob: '',
          gender: '',
          address: ''
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/patient/login');
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0A0E1A 0%, #1E293B 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 4 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: (theme).palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          backgroundImage: (theme).palette.mode === 'dark'
            ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%233B82F6" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23059669" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4,
        },
      }}
    >
      <Card sx={{ 
        maxWidth: 600, 
        width: '100%', 
        boxShadow: 24,
        bgcolor: 'background.paper',
        color: 'text.primary'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
            <MargaLogo size="large" variant="horizontal" />
          </Box>

          <Typography variant="h5" component="h2" textAlign="center" mb={1} fontWeight="bold">
            Create Your Account
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" mb={4}>
            Join Marga.lk to book appointments and manage your health records online
          </Typography>

          {(error || success) && (
            <Alert 
              severity={error ? "error" : "success"} 
              sx={{ mb: 3 }}
            >
              {error || success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Personal Information */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  required
                  label="National ID"
                  value={formData.national_id}
                  onChange={(e) => handleInputChange('national_id', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Contact Information */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Account Security */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Account Security
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  required
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                sx={{ mt: 2, mb: 3 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?
              </Typography>
            </Divider>

            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="text"
                color="primary"
                size="large"
                onClick={() => navigate('/patient/login')}
              >
                Sign In to Your Account
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={() => navigate('/')}
              >
                ← Back to Main Site
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}