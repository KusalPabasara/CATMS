import { useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
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
  useTheme,
  alpha,
  Fade,
  Slide,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDark } = useCustomTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      
      // Decode JWT token to get user info
      const tokenParts = data.token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      
      login(data.token, payload);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
          backgroundImage: isDark
            ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%233B82F6" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23059669" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4,
        },
      }}
    >
        <Slide direction="up" in={true} timeout={800}>
          <Card
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: 480, md: 520, lg: 560 },
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
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderRadius: { xs: 2, sm: 3 },
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
            }}
          >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Fade in={true} timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: { xs: 70, sm: 80, md: 90 },
                    height: { xs: 70, sm: 80, md: 90 },
                    borderRadius: '50%',
                    background: isDark
                      ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                      : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(16, 185, 129, 0.2)'
                      : '0 8px 32px rgba(30, 64, 175, 0.3), 0 4px 16px rgba(5, 150, 105, 0.2)',
                    mx: 'auto',
                    mb: { xs: 2, sm: 3 },
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
                  <HospitalIcon sx={{ 
                    fontSize: { xs: 35, sm: 40, md: 45 }, 
                    color: 'white', 
                    position: 'relative', 
                    zIndex: 1 
                  }} />
                </Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
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
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{
                    color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    lineHeight: 1.5,
                  }}
                >
                  Clinic Appointment & Treatment Management System
                </Typography>
              </Box>
            </Fade>
            
            <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: isDark ? '#F8FAFC' : 'text.primary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                💼 Staff Login
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                For doctors, administrators, and clinic staff
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {error && (
                <Fade in={!!error} timeout={300}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2,
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
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color={isDark ? "primary" : "action"} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: { xs: 2, sm: 2.5 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDark ? alpha('#1E293B', 0.5) : 'transparent',
                    border: isDark ? `1px solid ${alpha('#3B82F6', 0.3)}` : undefined,
                    minHeight: { xs: '48px', sm: '56px' },
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
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: isDark ? '#3B82F6' : undefined,
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    padding: { xs: '12px 14px', sm: '16px 14px' },
                  },
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={isDark ? "primary" : "action"} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
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
                  mb: { xs: 2.5, sm: 3 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDark ? alpha('#1E293B', 0.5) : 'transparent',
                    border: isDark ? `1px solid ${alpha('#3B82F6', 0.3)}` : undefined,
                    minHeight: { xs: '48px', sm: '56px' },
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
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: isDark ? '#3B82F6' : undefined,
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    padding: { xs: '12px 14px', sm: '16px 14px' },
                  },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                sx={{
                  mt: { xs: 2, sm: 2.5 },
                  mb: { xs: 2, sm: 2.5 },
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  minHeight: { xs: '48px', sm: '56px' },
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
            </Box>
            
            <Box sx={{ mt: { xs: 2.5, sm: 3 } }}>
              {/* Patient Access Section */}
              <Box sx={{ 
                textAlign: 'center', 
                mb: { xs: 2.5, sm: 3 }, 
                p: { xs: 2, sm: 2.5 }, 
                bgcolor: isDark ? alpha('#1E293B', 0.6) : 'primary.50', 
                borderRadius: 2,
                border: isDark ? `1px solid ${alpha('#3B82F6', 0.3)}` : undefined,
                boxShadow: isDark ? `0 4px 12px ${alpha('#3B82F6', 0.1)}` : undefined,
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: { xs: 1.5, sm: 2 }, 
                    color: isDark ? '#3B82F6' : 'primary.main', 
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  👨‍⚕️ Patient Portal Access
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 1.5 }, 
                  justifyContent: 'center', 
                  flexWrap: 'wrap',
                  flexDirection: { xs: 'column', sm: 'row' },
                }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/patient/login')}
                    sx={{ 
                      minWidth: { xs: '100%', sm: 120 },
                      py: { xs: 1, sm: 1.25 },
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      borderColor: isDark ? '#3B82F6' : undefined,
                      color: isDark ? '#3B82F6' : undefined,
                      '&:hover': {
                        borderColor: isDark ? '#10B981' : undefined,
                        backgroundColor: isDark ? alpha('#3B82F6', 0.1) : undefined,
                      },
                    }}
                  >
                    Patient Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<GroupIcon />}
                    onClick={() => navigate('/patient/register')}
                    sx={{ 
                      minWidth: { xs: '100%', sm: 120 },
                      py: { xs: 1, sm: 1.25 },
                      fontSize: { xs: '0.85rem', sm: '0.9rem' },
                      background: isDark
                        ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                        : undefined,
                      '&:hover': {
                        background: isDark
                          ? 'linear-gradient(135deg, #2563EB 0%, #059669 100%)'
                          : undefined,
                      },
                    }}
                  >
                    Register Now
                  </Button>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: { xs: 1.5, sm: 2 },
                    color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Book appointments & manage your health records
                </Typography>
              </Box>
              
              {/* Staff Demo Credentials */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{
                    color: isDark ? alpha('#E2E8F0', 0.7) : undefined,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                >
                  Staff Demo Credentials:
                </Typography>
                <Typography 
                  variant="caption" 
                  display="block" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    mb: { xs: 0.5, sm: 0.75 },
                    color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                    backgroundColor: isDark ? alpha('#1E293B', 0.3) : undefined,
                    padding: isDark ? { xs: '6px 8px', sm: '8px 12px' } : undefined,
                    borderRadius: isDark ? 1 : undefined,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    wordBreak: 'break-all',
                  }}
                >
                  admin@catms.com / admin123
                </Typography>
                <Typography 
                  variant="caption" 
                  display="block" 
                  sx={{ 
                    fontFamily: 'monospace',
                    color: isDark ? alpha('#E2E8F0', 0.8) : undefined,
                    backgroundColor: isDark ? alpha('#1E293B', 0.3) : undefined,
                    padding: isDark ? { xs: '6px 8px', sm: '8px 12px' } : undefined,
                    borderRadius: isDark ? 1 : undefined,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    wordBreak: 'break-all',
                  }}
                >
                  doctor@catms.com / doctor123
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Slide>
    </Box>
  );
}
