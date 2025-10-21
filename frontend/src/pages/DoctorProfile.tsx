import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Schedule as ScheduleIcon,
  LocalHospital as LocalHospitalIcon,
  Assessment as AssessmentIcon,
  Medication as MedicationIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import AIMedicalAssistant from '../components/AIMedicalAssistant';

interface DoctorProfile {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  specialty?: string;
  experience_years?: number;
  education?: string;
  certifications?: string[];
  languages?: string[];
  bio?: string;
  profile_picture?: string;
  rating?: number;
  total_appointments?: number;
  availability?: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DoctorProfile: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/users/${user?.user_id}`);
      setDoctorProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!doctorProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Doctor profile not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Doctor Profile
        </Typography>
      </Box>

      {/* Profile Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={doctorProfile.profile_picture}
                sx={{ width: 120, height: 120 }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Dr. {doctorProfile.full_name}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {doctorProfile.specialty || 'General Practice'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {doctorProfile.bio || 'Experienced medical professional dedicated to providing quality healthcare.'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit Profile">
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton onClick={fetchDoctorProfile}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography variant="body2">{doctorProfile.email}</Typography>
                </Box>
                {doctorProfile.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography variant="body2">{doctorProfile.phone}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon color="warning" />
                  <Typography variant="body2">
                    {doctorProfile.rating ? `${doctorProfile.rating}/5` : 'No rating yet'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospitalIcon color="action" />
                  <Typography variant="body2">
                    {doctorProfile.total_appointments || 0} appointments
                  </Typography>
                </Box>
              </Box>

              {/* Certifications and Languages */}
              <Box sx={{ mt: 2 }}>
                {doctorProfile.certifications && doctorProfile.certifications.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Certifications:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {doctorProfile.certifications.map((cert, index) => (
                        <Chip key={index} label={cert} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                {doctorProfile.languages && doctorProfile.languages.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Languages:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {doctorProfile.languages.map((lang, index) => (
                        <Chip key={index} label={lang} size="small" color="primary" />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="doctor profile tabs">
            <Tab
              icon={<PersonIcon />}
              label="Profile"
              iconPosition="start"
            />
            <Tab
              icon={<PsychologyIcon />}
              label="AI Medical Assistant"
              iconPosition="start"
            />
            <Tab
              icon={<ScheduleIcon />}
              label="Schedule"
              iconPosition="start"
            />
            <Tab
              icon={<AssessmentIcon />}
              label="Statistics"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Professional Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LocalHospitalIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Specialty"
                      secondary={doctorProfile.specialty || 'General Practice'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Experience"
                      secondary={`${doctorProfile.experience_years || 0} years`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MedicationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Education"
                      secondary={doctorProfile.education || 'Not specified'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={doctorProfile.email}
                    />
                  </ListItem>
                  {doctorProfile.phone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={doctorProfile.phone}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* AI Medical Assistant Tab */}
        <TabPanel value={tabValue} index={1}>
          <AIMedicalAssistant />
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedule management functionality would be implemented here.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Practice Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Statistics and analytics would be implemented here.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default DoctorProfile;
