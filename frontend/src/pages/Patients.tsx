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
  Switch,
  FormControlLabel,
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

type PatientForm = {
  full_name: string;
  national_id: string;
  dob: string;
  gender: string;
  blood_type: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  allergies: string;
  insurance_provider: string;
  insurance_policy_number: string;
  active?: boolean; // only used in edit
};

export default function Patients() {
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Patient dialog
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState('');
  const [formData, setFormData] = useState<PatientForm>({
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

  // View Patient dialog
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);

  // Edit Patient dialog
  const [showEditForm, setShowEditForm] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editFormData, setEditFormData] = useState<PatientForm>({
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
    insurance_policy_number: '',
    active: true
  });
  const [editError, setEditError] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PatientForm, value: string | boolean, isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, [field]: value as any }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value as any }));
    }
  };

  const handleAddPatient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAddError('');

    try {
      const response = await axios.post('/api/patients', formData);
      setPatients(prev => [...prev, response.data]);
      resetAddForm();
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to add patient');
      console.error('Error adding patient:', err);
    }
  };

  const resetAddForm = () => {
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
    setAddError('');
  };

  const openViewDialog = (patient: Patient) => {
    setViewPatient(patient);
    setShowViewDialog(true);
  };

  const closeViewDialog = () => {
    setShowViewDialog(false);
    setViewPatient(null);
  };

  const toInputDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    // format YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const openEditDialog = (patient: Patient) => {
    setEditPatient(patient);
    setEditFormData({
      full_name: patient.full_name || '',
      national_id: patient.national_id || '',
      dob: toInputDate(patient.dob),
      gender: patient.gender || '',
      blood_type: patient.blood_type || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      allergies: patient.allergies || '',
      insurance_provider: patient.insurance_provider || '',
      insurance_policy_number: patient.insurance_policy_number || '',
      active: patient.active
    });
    setEditError('');
    setShowEditForm(true);
  };

  const closeEditDialog = () => {
    setShowEditForm(false);
    setEditPatient(null);
    setEditError('');
  };

  const handleUpdatePatient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editPatient) return;
    setEditError('');

    try {
      const payload = { ...editFormData };
      // Some servers may not accept undefined; ensure booleans and strings present
      if (typeof payload.active === 'undefined') payload.active = editPatient.active;

      const response = await axios.put(`/api/patients/${editPatient.patient_id}`, payload);
      const updated: Patient = response.data;

      setPatients(prev =>
        prev.map(p => (p.patient_id === updated.patient_id ? updated : p))
      );
      closeEditDialog();
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Failed to update patient');
      console.error('Error updating patient:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
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

  const canEdit = user?.role === 'Receptionist' || user?.role === 'System Administrator';

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
              {canEdit && (
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
                        <Button size="small" color="primary" onClick={() => openViewDialog(patient)}>
                          View
                        </Button>
                        {canEdit && (
                          <Button size="small" color="secondary" onClick={() => openEditDialog(patient)}>
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
        onClose={resetAddForm}
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
            <IconButton onClick={resetAddForm} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {addError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {addError}
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
          <Button onClick={resetAddForm} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={() => handleAddPatient()}
            variant="contained" 
            startIcon={<AddIcon />}
          >
            Add Patient
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Patient Dialog */}
      <Dialog
        open={showViewDialog}
        onClose={closeViewDialog}
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
              Patient Details
            </Typography>
            <IconButton onClick={closeViewDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewPatient && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box display="flex" alignItems="center" gap={2} sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {viewPatient.full_name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{viewPatient.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getGenderIcon(viewPatient.gender)} {viewPatient.gender} • DOB: {formatDate(viewPatient.dob)}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">National ID</Typography>
                <Typography>{viewPatient.national_id || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography>{viewPatient.phone || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{viewPatient.email || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Blood Type</Typography>
                <Typography>{viewPatient.blood_type || '—'}</Typography>
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography>{viewPatient.address || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Emergency Contact Name</Typography>
                <Typography>{viewPatient.emergency_contact_name || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Emergency Contact Phone</Typography>
                <Typography>{viewPatient.emergency_contact_phone || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Insurance Provider</Typography>
                <Typography>{viewPatient.insurance_provider || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Policy Number</Typography>
                <Typography>{viewPatient.insurance_policy_number || '—'}</Typography>
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Typography variant="subtitle2" color="text.secondary">Allergies</Typography>
                <Typography whiteSpace="pre-wrap">{viewPatient.allergies || '—'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Registered</Typography>
                <Typography>{formatDate(viewPatient.created_at)}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                {getStatusBadge(viewPatient.active)}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeViewDialog} variant="contained">
            Close
          </Button>
          {canEdit && viewPatient && (
            <Button
              variant="outlined"
              onClick={() => {
                closeViewDialog();
                openEditDialog(viewPatient);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog
        open={showEditForm}
        onClose={closeEditDialog}
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
              Edit Patient
            </Typography>
            <IconButton onClick={closeEditDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {editError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleUpdatePatient}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box>
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  value={editFormData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value, true)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  required
                  label="National ID"
                  value={editFormData.national_id}
                  onChange={(e) => handleInputChange('national_id', e.target.value, true)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Date of Birth"
                  value={editFormData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value, true)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={editFormData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value, true)}
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
                  value={editFormData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, true)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={editFormData.email}
                  onChange={(e) => handleInputChange('email', e.target.value, true)}
                />
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Blood Type</InputLabel>
                  <Select
                    value={editFormData.blood_type}
                    onChange={(e) => handleInputChange('blood_type', e.target.value, true)}
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
                  value={editFormData.address}
                  onChange={(e) => handleInputChange('address', e.target.value, true)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={editFormData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value, true)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  type="tel"
                  label="Emergency Contact Phone"
                  value={editFormData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value, true)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  value={editFormData.insurance_provider}
                  onChange={(e) => handleInputChange('insurance_provider', e.target.value, true)}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Insurance Policy Number"
                  value={editFormData.insurance_policy_number}
                  onChange={(e) => handleInputChange('insurance_policy_number', e.target.value, true)}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Allergies"
                  placeholder="List any known allergies..."
                  value={editFormData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value, true)}
                />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editFormData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked, true)}
                    />
                  }
                  label="Active"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={() => handleUpdatePatient()}
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}