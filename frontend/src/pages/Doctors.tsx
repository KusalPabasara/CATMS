import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';

interface Doctor {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  speciality?: string;
  branch_id?: number;
  is_active: boolean;
  created_at: string;
  Role?: {
    role_name: string;
  };
  Branch?: {
    name: string;
  };
}

interface Branch {
  branch_id: number;
  name: string;
}

const Doctors: React.FC = () => {
  const theme = useTheme();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    speciality: '',
    branch_id: '',
    password: '',
  });
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    speciality: '',
    branch_id: '',
    password: '',
    is_active: true,
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchBranches();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/doctors');
      setDoctors(response.data);
    } catch (err: any) {
      setError('Failed to fetch doctors');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/api/branches');
      setBranches(response.data);
    } catch (err: any) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleAddDoctor = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      if (!formData.full_name || !formData.email || !formData.password) {
        setError('Full name, email, and password are required');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      const doctorData = {
        ...formData,
        branch_id: formData.branch_id ? parseInt(formData.branch_id) : null,
      };

      await api.post('/api/doctors', doctorData);
      setSuccess('Doctor created successfully');
      setAddDialogOpen(false);
      resetForm();
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      setSubmitting(true);
      setError('');
      
      const updateData = {
        ...editFormData,
        branch_id: editFormData.branch_id ? parseInt(editFormData.branch_id) : null,
      };

      // Remove password if empty
      if (!updateData.password) {
        delete updateData.password;
      }

      await api.put(`/api/doctors/${selectedDoctor.user_id}`, updateData);
      setSuccess('Doctor updated successfully');
      setEditDialogOpen(false);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedDoctor) return;

    try {
      setSubmitting(true);
      setError('');
      
      if (!passwordData.new_password || !passwordData.confirm_password) {
        setError('Both password fields are required');
        return;
      }

      if (passwordData.new_password !== passwordData.confirm_password) {
        setError('Passwords do not match');
        return;
      }

      if (passwordData.new_password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      await api.post(`/api/doctors/${selectedDoctor.user_id}/reset-password`, {
        new_password: passwordData.new_password,
      });

      setSuccess('Password reset successfully');
      setPasswordDialogOpen(false);
      setSelectedDoctor(null);
      setPasswordData({ new_password: '', confirm_password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (doctor: Doctor) => {
    if (!window.confirm(`Are you sure you want to deactivate ${doctor.full_name}?`)) {
      return;
    }

    try {
      await api.delete(`/api/doctors/${doctor.user_id}`);
      setSuccess('Doctor deactivated successfully');
      fetchDoctors();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deactivate doctor');
    }
  };

  const openEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditFormData({
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone || '',
      speciality: doctor.speciality || '',
      branch_id: doctor.branch_id?.toString() || '',
      password: '',
      is_active: doctor.is_active,
    });
    setEditDialogOpen(true);
  };

  const openPasswordDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setPasswordData({ new_password: '', confirm_password: '' });
    setPasswordDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      speciality: '',
      branch_id: '',
      password: '',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Doctor Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDoctors}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Doctor
          </Button>
        </Box>
      </Box>

      {(error || success) && (
        <Alert 
          severity={error ? "error" : "success"} 
          sx={{ mb: 3 }}
          onClose={() => { setError(''); setSuccess(''); }}
        >
          {error || success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Speciality</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.user_id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {doctor.full_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {doctor.user_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{doctor.email}</Typography>
                        </Box>
                        {doctor.phone && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{doctor.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {doctor.speciality || 'General Practice'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {doctor.Branch?.name || 'Main Branch'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(doctor.is_active)}
                        color={getStatusColor(doctor.is_active)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit Doctor">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(doctor)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset Password">
                          <IconButton
                            size="small"
                            onClick={() => openPasswordDialog(doctor)}
                            color="secondary"
                          >
                            <KeyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={doctor.is_active ? "Deactivate" : "Activate"}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteDoctor(doctor)}
                            color={doctor.is_active ? "error" : "success"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Doctor Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Doctor</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <TextField
                fullWidth
                label="Speciality"
                value={formData.speciality}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                placeholder="e.g., Cardiology, Neurology"
              />
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  label="Branch"
                >
                  <MenuItem value="">Main Branch</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id.toString()}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddDoctor}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Add Doctor'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Doctor</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
              <TextField
                fullWidth
                label="Speciality"
                value={editFormData.speciality}
                onChange={(e) => setEditFormData({ ...editFormData, speciality: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={editFormData.branch_id}
                  onChange={(e) => setEditFormData({ ...editFormData, branch_id: e.target.value })}
                  label="Branch"
                >
                  <MenuItem value="">Main Branch</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id.toString()}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="New Password (optional)"
                type={showNewPassword ? 'text' : 'password'}
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditDoctor}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Update Doctor'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Reset password for: <strong>{selectedDoctor?.full_name}</strong>
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Doctors;