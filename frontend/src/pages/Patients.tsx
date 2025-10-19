import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

interface Patient {
  patient_id: number;
  full_name: string;
  national_id: string;
  dob: string;
  gender: string;
  blood_type?: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  allergies?: string;
  active: boolean;
  created_at: string;
}

export default function Patients() {
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    national_id: '',
    dob: '',
    gender: '',
    blood_type: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: '',
    insurance_provider: '',
    insurance_policy_number: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      return patient.full_name.toLowerCase().includes(searchLower) ||
        patient.national_id.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower));
    });
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/patients', formData);
      setPatients([...patients, response.data]);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add patient');
      console.error('Error adding patient:', err);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setFormData({
      full_name: '',
      national_id: '',
      dob: '',
      gender: '',
      blood_type: '',
      phone: '',
      email: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      allergies: '',
      insurance_provider: '',
      insurance_policy_number: ''
    });
    setError('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <Chip
        label={active ? 'Active' : 'Inactive'}
        color={active ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const getGenderIcon = (gender: string) => {
    if (gender === 'Male') return <MaleIcon sx={{ fontSize: 16, mr: 0.5 }} />;
    if (gender === 'Female') return <FemaleIcon sx={{ fontSize: 16, mr: 0.5 }} />;
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading patients...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Patient Management
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                Export
              </Button>
              {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddForm(true)}
                >
                  Add Patient
                </Button>
              )}
            </Box>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search patients by name, ID, phone or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Details</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Medical Info</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.patient_id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {patient.full_name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {patient.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {patient.national_id}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {getGenderIcon(patient.gender)} {patient.gender} • {formatDate(patient.dob)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{patient.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Blood: {patient.blood_type || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Registered: {formatDate(patient.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(patient.active)}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button size="small" color="primary">
                          View
                        </Button>
                        {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && (
                          <Button size="small" color="secondary">
                            Edit
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredPatients.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                👥
              </Typography>
              <Typography variant="h6" gutterBottom>
                No patients found
              </Typography>
              <Typography color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first patient'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Patient Dialog */}
      <Dialog
        open={showAddForm}
        onClose={resetForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Add New Patient
            </Typography>
            <IconButton onClick={resetForm} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleAddPatient}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  required
                  label="National ID"
                  value={formData.national_id}
                  onChange={(e) => handleInputChange('national_id', e.target.value)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box>
                <FormControl fullWidth required>
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

              <Box>
                <TextField
                  fullWidth
                  required
                  type="tel"
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Blood Type</InputLabel>
                  <Select
                    value={formData.blood_type}
                    onChange={(e) => handleInputChange('blood_type', e.target.value)}
                    label="Blood Type"
                  >
                    <MenuItem value="">Select Blood Type</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  type="tel"
                  label="Emergency Contact Phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  value={formData.insurance_provider}
                  onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Insurance Policy Number"
                  value={formData.insurance_policy_number}
                  onChange={(e) => handleInputChange('insurance_policy_number', e.target.value)}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Allergies"
                  placeholder="List any known allergies..."
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={resetForm} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleAddPatient} 
            variant="contained" 
            startIcon={<AddIcon />}
          >
            Add Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}