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
  Divider,
  useTheme,
  alpha,
  Fade,
  Slide,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Lock as LockIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { usePatientStore } from '../../store/patientStore';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { login } = usePatientStore();
  const theme = useTheme();
  const { isDark } = useCustomTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'national_id'>('email');
  const [formData, setFormData] = useState({
    email: 'kusal@gmail.com',
    national_id: '',
    password: 'kusal123',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password
    if (!formData.password || formData.password.trim().length === 0) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    // Validate email format if using email login
    if (loginType === 'email' && (!formData.email || !formData.email.includes('@') || !formData.email.includes('.'))) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Validate national_id if using national_id login
    if (loginType === 'national_id') {
      if (!formData.national_id || formData.national_id.trim().length === 0) {
        setError('Please enter your National ID');
        setLoading(false);
        return;
      }
      
      // Basic NIC format validation (Sri Lankan NIC format: 9 digits or 12 digits)
      const nicPattern = /^(\d{9}|\d{12})$/;
      if (!nicPattern.test(formData.national_id.trim())) {
        setError('Please enter a valid National ID format (9 or 12 digits)');
        setLoading(false);
        return;
      }
    }

    try {
      const loginData = loginType === 'email' 
        ? { email: formData.email, password: formData.password }
        : { national_id: formData.national_id, password: formData.password };

      console.log('🔐 Frontend: Login attempt with data:', {
        loginType,
        loginData: {
          ...loginData,
          password: '***' // Don't log password
        }
      });

      const response = await api.post('/api/patient-auth/login', loginData);
      
      console.log('🔐 Frontend: Login response received:', {
        status: response.status,
        hasPatient: !!response.data.patient,
        hasToken: !!response.data.token,
        patientId: response.data.patient?.patient_id
      });
      
      if (response.data.patient) {
        console.log('🔐 Frontend: Calling login store function...');
        await login(response.data.patient, response.data.token);
        console.log('🔐 Frontend: Login store function completed, navigating to dashboard');
        navigate('/patient/dashboard');
      } else {
        console.log('🔐 Frontend: No patient data in response');
        setError('Invalid login credentials');
      }
    } catch (err: any) {
      console.error('🔐 Frontend: Login error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 401) {
        if (loginType === 'national_id') {
          errorMessage = 'Invalid National ID or password. Please check your credentials and try again.';
        } else {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log('🔐 Frontend: Input change:', { field, value, loginType });
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: isDark 
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
          background: isDark
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
          backgroundImage: isDark
            ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%233B82F6" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23059669" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4,
        },
      }}
    >
      <Slide direction="up" in={true} timeout={800}>
        <Card sx={{ 
          maxWidth: 480, 
          width: '100%', 
          position: 'relative',
          zIndex: 1,
          background: isDark 
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: isDark
            ? `1px solid ${alpha('#3B82F6', 0.3)}`
            : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 40px rgba(59, 130, 246, 0.1)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)',
          },
          '&::after': isDark ? {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
            borderRadius: 'inherit',
            zIndex: -1,
            filter: 'blur(8px)',
          } : {},
        }}>
          <CardContent sx={{ p: 4 }}>
            <Fade in={true} timeout={1000}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: isDark
                      ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                      : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(16, 185, 129, 0.2)'
                      : '0 8px 32px rgba(30, 64, 175, 0.3), 0 4px 16px rgba(5, 150, 105, 0.2)',
                    mr: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      background: isDark
                        ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                        : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                      opacity: 0.3,
                      filter: 'blur(8px)',
                    },
                  }}
                >
                  <HospitalIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
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
                    CATMS
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Patient Portal
                  </Typography>
                </Box>
              </Box>
            </Fade>

          <Typography 
            variant="h5" 
            component="h2" 
            textAlign="center" 
            mb={1} 
            fontWeight="bold"
            sx={{
              color: isDark ? '#F8FAFC' : undefined,
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            variant="body2" 
            textAlign="center" 
            color="text.secondary" 
            mb={4}
            sx={{
              color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
            }}
          >
            Sign in to your patient account to book appointments and manage your health records
          </Typography>

          {error && (
            <Fade in={!!error} timeout={300}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: isDark ? alpha(theme.palette.error.main, 0.1) : undefined,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  '& .MuiAlert-icon': {
                    color: theme.palette.error.main,
                  },
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <Box 
            display="flex" 
            mb={3} 
            sx={{ 
              bgcolor: isDark ? alpha('#1E293B', 0.6) : alpha(theme.palette.grey[100], 0.8),
              borderRadius: 2, 
              p: 0.5,
              border: isDark ? `1px solid ${alpha('#3B82F6', 0.3)}` : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              backdropFilter: 'blur(10px)',
              boxShadow: isDark ? `0 4px 12px ${alpha('#3B82F6', 0.1)}` : undefined,
            }}
          >
            <Button
              variant={loginType === 'email' ? 'contained' : 'text'}
              onClick={() => {
                console.log('🔐 Frontend: Switching to email login');
                setLoginType('email');
                setError(''); // Clear any existing errors
                // Reset form data when switching to email
                setFormData(prev => ({
                  ...prev,
                  national_id: '', // Clear national_id when switching to email
                }));
              }}
              startIcon={<EmailIcon />}
              sx={{ 
                flex: 1, 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                ...(loginType === 'email' && {
                  background: isDark
                    ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                    : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(59, 130, 246, 0.3)'
                    : '0 4px 16px rgba(30, 64, 175, 0.3)',
                }),
              }}
              size="small"
            >
              Email
            </Button>
            <Button
              variant={loginType === 'national_id' ? 'contained' : 'text'}
              onClick={() => {
                console.log('🔐 Frontend: Switching to national_id login');
                setLoginType('national_id');
                setError(''); // Clear any existing errors
                // Reset form data when switching to national_id
                setFormData(prev => ({
                  ...prev,
                  email: '', // Clear email when switching to national_id
                }));
              }}
              startIcon={<PersonIcon />}
              sx={{ 
                flex: 1, 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                ...(loginType === 'national_id' && {
                  background: isDark
                    ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                    : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(59, 130, 246, 0.3)'
                    : '0 4px 16px rgba(30, 64, 175, 0.3)',
                }),
              }}
              size="small"
            >
              National ID
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {loginType === 'email' ? (
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
                      <EmailIcon color={isDark ? "primary" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDark ? alpha('#1E293B', 0.5) : 'transparent',
                    border: isDark ? `1px solid ${alpha('#3B82F6', 0.3)}` : undefined,
                    '&:hover': {
                      border: isDark ? `1px solid ${alpha('#3B82F6', 0.5)}` : undefined,
                    },
                    '&.Mui-focused': {
                      border: isDark ? `1px solid ${alpha('#3B82F6', 0.8)}` : undefined,
                      boxShadow: isDark ? `0 0 0 2px ${alpha('#3B82F6', 0.2)}` : undefined,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: isDark ? '#3B82F6' : undefined,
                  },
                }}
              />
            ) : (
              <TextField
                fullWidth
                required
                label="National ID"
                value={formData.national_id}
                onChange={(e) => handleInputChange('national_id', e.target.value)}
                helperText="Enter your 9 or 12 digit National ID"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color={isDark ? "primary" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDark ? alpha('#1E293B', 0.5) : 'transparent',
                    border: isDark ? `1px solid ${alpha('#3B82F6', 0.3)}` : undefined,
                    '&:hover': {
                      border: isDark ? `1px solid ${alpha('#3B82F6', 0.5)}` : undefined,
                    },
                    '&.Mui-focused': {
                      border: isDark ? `1px solid ${alpha('#3B82F6', 0.8)}` : undefined,
                      boxShadow: isDark ? `0 0 0 2px ${alpha('#3B82F6', 0.2)}` : undefined,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: isDark ? '#3B82F6' : undefined,
                  },
                  '& .MuiFormHelperText-root': {
                    color: isDark ? alpha('#E2E8F0', 0.6) : undefined,
                    fontSize: '0.75rem',
                  },
                }}
              />
            )}

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
                    <LockIcon color={isDark ? "primary" : "action"} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        color: isDark ? '#3B82F6' : 'inherit',
                        '&:hover': {
                          backgroundColor: isDark ? alpha('#3B82F6', 0.1) : undefined,
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark ? alpha('#1E293B', 0.5) : 'transparent',
                  border: isDark ? `1px solid ${alpha('#3B82F6', 0.3)}` : undefined,
                  '&:hover': {
                    border: isDark ? `1px solid ${alpha('#3B82F6', 0.5)}` : undefined,
                  },
                  '&.Mui-focused': {
                    border: isDark ? `1px solid ${alpha('#3B82F6', 0.8)}` : undefined,
                    boxShadow: isDark ? `0 0 0 2px ${alpha('#3B82F6', 0.2)}` : undefined,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: isDark ? '#3B82F6' : undefined,
                },
              }}
            />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    background: isDark
                      ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                      : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(16, 185, 129, 0.2)'
                      : '0 8px 32px rgba(30, 64, 175, 0.3), 0 4px 16px rgba(5, 150, 105, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 12px 40px rgba(59, 130, 246, 0.4), 0 6px 20px rgba(16, 185, 129, 0.3)'
                        : '0 12px 40px rgba(30, 64, 175, 0.4), 0 6px 20px rgba(5, 150, 105, 0.3)',
                    },
                    '&:disabled': {
                      background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>


            <Divider sx={{ 
              my: 3,
              '&::before, &::after': {
                borderColor: isDark ? alpha('#3B82F6', 0.3) : undefined,
              },
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  color: isDark ? alpha('#E2E8F0', 0.7) : undefined,
                }}
              >
                Need Help?
              </Typography>
            </Divider>

            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => navigate('/patient/register')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 1,
                  color: isDark ? '#3B82F6' : undefined,
                  '&:hover': {
                    backgroundColor: isDark 
                      ? alpha('#3B82F6', 0.15) 
                      : alpha(theme.palette.primary.main, 0.04),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Don't have an account? Register here
              </Button>
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={() => navigate('/patient/forgot-password')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 1,
                  color: isDark ? '#10B981' : undefined,
                  '&:hover': {
                    backgroundColor: isDark 
                      ? alpha('#10B981', 0.15) 
                      : alpha(theme.palette.secondary.main, 0.04),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Forgot your password?
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={() => navigate('/')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 1,
                  color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                  '&:hover': {
                    backgroundColor: isDark 
                      ? alpha('#E2E8F0', 0.1) 
                      : alpha(theme.palette.info.main, 0.04),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                ← Back to Main Site
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      </Slide>
    </Box>
  );
}