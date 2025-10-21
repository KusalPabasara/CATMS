import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { usePatientStore } from '../../store/patientStore';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import api, { profileUploadApi } from '../../services/api';
import { format } from 'date-fns';

interface PatientData {
  patient_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  national_id: string;
  date_of_birth: string;
  gender: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  blood_type: string;
  allergies: string;
  medical_history: string;
  profile_picture?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { patient, updatePatient } = usePatientStore();
  const { isDark, toggleTheme } = useCustomTheme();
  const theme = useTheme();
  
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    national_id: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    blood_type: '',
    allergies: '',
    medical_history: '',
    profile_picture: '',
  });

  useEffect(() => {
    if (!patient) {
      navigate('/patient/login');
      return;
    }
    fetchPatientData();
  }, [patient, navigate]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patient-auth/profile');
      setPatientData(response.data);
      
      // Check if patient store has profile picture, otherwise use API response
      const currentPatient = patient;
      const storedProfilePicture = currentPatient?.profile_picture;
      const apiProfilePicture = response.data.profile_picture;
      
      // Use stored profile picture if available, otherwise use API response
      const profilePictureUrl = storedProfilePicture || 
        (apiProfilePicture ? `http://localhost:5000${apiProfilePicture}` : null);
      
      setProfilePicture(profilePictureUrl);
      setFormData({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        national_id: response.data.national_id || '',
        date_of_birth: response.data.date_of_birth ? response.data.date_of_birth.split('T')[0] : '',
        gender: response.data.gender || '',
        address: response.data.address || '',
        emergency_contact: response.data.emergency_contact || '',
        emergency_phone: response.data.emergency_phone || '',
        blood_type: response.data.blood_type || '',
        allergies: response.data.allergies || '',
        medical_history: response.data.medical_history || '',
        profile_picture: response.data.profile_picture || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 Profile picture change triggered');
    const file = event.target.files?.[0];
    console.log('📸 Selected file:', file);
    
    if (file) {
      console.log('📸 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('❌ Invalid file type:', file.type);
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('❌ File too large:', file.size, 'bytes');
        setError('Image size must be less than 5MB');
        return;
      }
      
      console.log('✅ File validation passed');
      setProfilePictureFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('📸 Preview URL created');
        setProfilePicture(e.target?.result as string);
      };
      reader.onerror = (e) => {
        console.error('❌ FileReader error:', e);
        setError('Failed to read file');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('❌ No file selected');
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePictureFile(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (patientData) {
      setFormData({
        full_name: patientData.full_name || '',
        email: patientData.email || '',
        phone: patientData.phone || '',
        national_id: patientData.national_id || '',
        date_of_birth: patientData.date_of_birth ? patientData.date_of_birth.split('T')[0] : '',
        gender: patientData.gender || '',
        address: patientData.address || '',
        emergency_contact: patientData.emergency_contact || '',
        emergency_phone: patientData.emergency_phone || '',
        blood_type: patientData.blood_type || '',
        allergies: patientData.allergies || '',
        medical_history: patientData.medical_history || '',
        profile_picture: patientData.profile_picture || '',
      });
    }
  };

  const handleSave = async () => {
    console.log('💾 Save profile triggered');
    console.log('💾 Current patient from store:', patient);
    console.log('💾 Current patientData:', patientData);
    console.log('💾 Profile picture file:', profilePictureFile);
    console.log('💾 Current profile picture state:', profilePicture);
    
    if (!patientData) {
      console.log('❌ No patient data available');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? `${formData.date_of_birth}T00:00:00` : null,
      };

      console.log('💾 Update data prepared:', updateData);

      // If there's a new profile picture file, upload it first
      if (profilePictureFile) {
        console.log('📸 Uploading profile picture...');
        console.log('📸 File to upload:', {
          name: profilePictureFile.name,
          size: profilePictureFile.size,
          type: profilePictureFile.type
        });
        
        // Check authentication before upload
        console.log('🔐 Checking authentication before upload...');
        console.log('🔐 Current token in localStorage:', localStorage.getItem('token'));
        console.log('🔐 Current patient storage:', localStorage.getItem('patient-auth-storage'));
        
        const formData = new FormData();
        formData.append('profile_picture', profilePictureFile);
        
        console.log('📸 FormData created, sending request to /api/patient-auth/profile-picture');
        console.log('📸 Request headers will be set by profileUploadApi interceptor');
        
        try {
          // Upload profile picture using the dedicated service
          const uploadResponse = await profileUploadApi.post('/api/patient-auth/profile-picture', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          console.log('📸 Upload response:', uploadResponse.data);
          updateData.profile_picture = `http://localhost:5000${uploadResponse.data.profile_picture}`;
          console.log('📸 Profile picture URL set:', updateData.profile_picture);
        } catch (uploadErr: any) {
          console.error('❌ Profile picture upload failed:', uploadErr);
          console.error('❌ Upload error details:', {
            status: uploadErr.response?.status,
            statusText: uploadErr.response?.statusText,
            data: uploadErr.response?.data,
            message: uploadErr.message,
            config: uploadErr.config,
            request: uploadErr.request
          });
          
          // Check if it's an authentication error
          if (uploadErr.response?.status === 401) {
            console.error('🔐 Authentication failed during profile picture upload');
            setError('Authentication failed. Please login again.');
            // Don't logout automatically, let user decide
            return;
          }
          
          throw uploadErr;
        }
      } else {
        console.log('📸 No profile picture file to upload');
      }

      console.log('💾 Updating profile with data:', updateData);
      console.log('🔐 Checking authentication before profile update...');
      
      const response = await api.put('/api/patient-auth/profile', updateData);
      console.log('💾 Profile update response:', response.data);
      
      setPatientData(response.data);
      
      // Update the patient store with the new profile picture
      // Handle nested patient structure
      const currentPatient = patient;
      const updatedPatient = {
        ...currentPatient,
        profile_picture: updateData.profile_picture
      };
      console.log('💾 Updating patient store with:', updatedPatient);
      updatePatient(updatedPatient);
      
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear the file after successful upload
      setProfilePictureFile(null);
      console.log('✅ Profile update completed successfully');
    } catch (err: any) {
      console.error('❌ Profile update failed:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        stack: err.stack,
        config: err.config,
        request: err.request
      });
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        console.error('🔐 Authentication failed during profile update');
        setError('Authentication failed. Please login again.');
        // Don't logout automatically, let user decide
      } else {
        setError(err.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (!patient) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
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
            <PersonIcon 
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
                My Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your personal information and medical details
              </Typography>
            </Box>
          </Box>
        </Box>
        
          <Box display="flex" gap={2} alignItems="center">
          {!isEditing ? (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
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
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  console.log('🔍 DEBUG: Current patient from store:', patient);
                  console.log('🔍 DEBUG: Current patientData:', patientData);
                  console.log('🔍 DEBUG: Token in localStorage:', localStorage.getItem('token'));
                  console.log('🔍 DEBUG: Patient storage:', localStorage.getItem('patient-auth-storage'));
                  console.log('🔍 DEBUG: Profile picture state:', profilePicture);
                  console.log('🔍 DEBUG: Profile picture file:', profilePictureFile);
                }}
                sx={{ ml: 1 }}
              >
                Debug Auth
              </Button>
            </>
          ) : (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: isDark
                    ? '0 4px 16px rgba(16, 185, 129, 0.3)'
                    : '0 4px 16px rgba(5, 150, 105, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(16, 185, 129, 0.4)'
                      : '0 6px 20px rgba(5, 150, 105, 0.4)',
                  },
                }}
              >
                {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          )}
          
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

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
        {/* Profile Overview */}
        <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
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
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                src={profilePicture || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  background: profilePicture 
                    ? undefined 
                    : isDark
                    ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                    : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: profilePicture ? undefined : 'white',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(59, 130, 246, 0.3)'
                    : '0 8px 32px rgba(30, 64, 175, 0.3)',
                }}
              >
                {!profilePicture && (patientData?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'P')}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" mb={1}>
                {patientData?.full_name || 'Unknown Patient'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" mb={3}>
                Patient ID: {patientData?.patient_id}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {patientData?.email}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {patientData?.phone || 'Not provided'}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <BadgeIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {patientData?.national_id}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarIcon fontSize="small" color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {patientData?.date_of_birth ? format(new Date(patientData.date_of_birth), 'MMM dd, yyyy') : 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Profile Form */}
        <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
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
                <PersonIcon color="primary" />
                Personal Information
              </Typography>
              
              {/* Profile Picture Upload Section */}
              {isEditing && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight="medium" mb={2}>
                    Profile Picture
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={profilePicture || undefined}
                      sx={{
                        width: 80,
                        height: 80,
                        background: profilePicture 
                          ? undefined 
                          : isDark
                          ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                          : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                        color: profilePicture ? undefined : 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {!profilePicture && (patientData?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'P')}
                    </Avatar>
                    
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profile-picture-upload"
                        type="file"
                        onChange={handleProfilePictureChange}
                      />
                      <label htmlFor="profile-picture-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<PhotoCameraIcon />}
                          sx={{
                            mr: 1,
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                            color: isDark ? 'white' : 'text.primary',
                            '&:hover': {
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                            },
                          }}
                        >
                          {profilePicture ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                      </label>
                      
                      {profilePicture && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleRemoveProfilePicture}
                          sx={{
                            borderColor: 'error.main',
                            color: 'error.main',
                            '&:hover': {
                              borderColor: 'error.dark',
                              backgroundColor: 'error.light',
                            },
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    Recommended: Square image, max 5MB. Supported formats: JPG, PNG, GIF
                  </Typography>
                </Box>
              )}
              
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="National ID"
                    value={formData.national_id}
                    onChange={(e) => handleInputChange('national_id', e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Gender"
                    select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={!isEditing}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </TextField>
                </Box>

                <Box sx={{ gridColumn: '1' }}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                <SecurityIcon color="primary" />
                Emergency Contact
              </Typography>
              
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    disabled={!isEditing}
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    value={formData.emergency_phone}
                    onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                <NotificationsIcon color="primary" />
                Medical Information
              </Typography>
              
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <Box sx={{ gridColumn: { xs: '1', md: 'span 1' } }}>
                  <TextField
                    fullWidth
                    label="Blood Type"
                    select
                    value={formData.blood_type}
                    onChange={(e) => handleInputChange('blood_type', e.target.value)}
                    disabled={!isEditing}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </TextField>
                </Box>

                <Box sx={{ gridColumn: '1' }}>
                  <TextField
                    fullWidth
                    label="Allergies"
                    multiline
                    rows={2}
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    disabled={!isEditing}
                    placeholder="List any known allergies (e.g., Penicillin, Latex, etc.)"
                  />
                </Box>

                <Box sx={{ gridColumn: '1' }}>
                  <TextField
                    fullWidth
                    label="Medical History"
                    multiline
                    rows={3}
                    value={formData.medical_history}
                    onChange={(e) => handleInputChange('medical_history', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Describe any relevant medical history, chronic conditions, or ongoing treatments"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
                </Box>
    </Box>
  );
}
