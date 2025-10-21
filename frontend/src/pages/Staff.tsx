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
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  VpnKey as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface StaffMember {
  staff_id: number;
  first_name: string;
  last_name: string;
  role: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Other';
  speciality?: string;
  email: string;
  branch_id: number;
  branch_name?: string;
  branch_location?: string;
  is_active: boolean;
  created_at: string;
}

interface Branch {
  branch_id: number;
  branch_name: string;
  location: string;
}

const Staff: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'Other' as 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Other',
    speciality: '',
    email: '',
    branch_id: '',
    password: '',
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchBranches();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/staff');
      setStaff(response.data);
    } catch (err: any) {
      setError('Failed to fetch staff members');
      console.error('Error fetching staff:', err);
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

  const handleAddStaff = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.branch_id) {
        setError('Please fill in all required fields');
        return;
      }

      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      await api.post('/api/staff', {
        ...formData,
        branch_id: parseInt(formData.branch_id),
      });
      
      setSuccess('Staff member created successfully with login credentials');
      setAddDialogOpen(false);
      resetForm();
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    try {
      setSubmitting(true);
      setError('');
      
      await api.put(`/api/staff/${selectedStaff.staff_id}`, {
        ...formData,
        branch_id: parseInt(formData.branch_id),
        is_active: selectedStaff.is_active,
      });
      
      setSuccess('Staff member updated successfully');
      setEditDialogOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update staff member');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active/Inactive (soft toggle)
  const handleToggleActive = async (staffMember: StaffMember) => {
    const willActivate = !staffMember.is_active;
    const confirmMsg = willActivate
      ? `Activate ${staffMember.first_name} ${staffMember.last_name}?`
      : `Deactivate ${staffMember.first_name} ${staffMember.last_name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/api/staff/${staffMember.staff_id}/status`, {
        is_active: willActivate
      });
      setSuccess(`Staff ${willActivate ? 'activated' : 'deactivated'} successfully`);
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  // HARD DELETE (permanent removal)
  const handleHardDelete = async (staffMember: StaffMember) => {
    if (!window.confirm(`Permanently remove ${staffMember.first_name} ${staffMember.last_name}? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/staff/${staffMember.staff_id}`);
      setSuccess('Staff member permanently removed');
      fetchStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove staff member');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStaff) return;

    if (!resetPasswordData.new_password || resetPasswordData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (resetPasswordData.new_password !== resetPasswordData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.post(`/api/staff/${selectedStaff.staff_id}/reset-password`, {
        new_password: resetPasswordData.new_password,
      });

      setSuccess('Password reset successfully');
      setResetPasswordDialogOpen(false);
      setSelectedStaff(null);
      setResetPasswordData({ new_password: '', confirm_password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      role: staffMember.role,
      speciality: staffMember.speciality || '',
      email: staffMember.email,
      branch_id: staffMember.branch_id.toString(),
      password: '',
    });
    setEditDialogOpen(true);
  };

  const openResetPasswordDialog = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setResetPasswordData({ new_password: '', confirm_password: '' });
    setResetPasswordDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      role: 'Other',
      speciality: '',
      email: '',
      branch_id: '',
      password: '',
    });
    setShowPassword(false);
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      'Admin': 'error',
      'Doctor': 'primary',
      'Nurse': 'success',
      'Receptionist': 'secondary',
      'Other': 'warning',
    };
    return colors[role] || 'warning';
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
          Staff Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStaff}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
            Add Staff Member
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
                  <TableCell>STAFF MEMBER</TableCell>
                  <TableCell>ROLE</TableCell>
                  <TableCell>SPECIALITY</TableCell>
                  <TableCell>BRANCH</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.staff_id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {member.first_name} {member.last_name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={member.role} size="small" color={getRoleColor(member.role)} variant="filled" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{member.speciality || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {member.branch_name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.branch_location || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.is_active ? 'Active' : 'Inactive'}
                        color={member.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center">
                        {/* Toggle Active/Inactive */}
                        <Tooltip title={member.is_active ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(member)}
                            color={member.is_active ? 'warning' : 'success'}
                          >
                            {member.is_active ? <ToggleOffIcon /> : <ToggleOnIcon />}
                          </IconButton>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip title="Edit Staff Member">
                          <IconButton size="small" onClick={() => openEditDialog(member)} color="primary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Reset Password */}
                        <Tooltip title="Reset Password">
                          <IconButton size="small" onClick={() => openResetPasswordDialog(member)} color="secondary">
                            <KeyIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Hard Delete */}
                        {user?.role === 'System Administrator' && (
                          <Tooltip title="Remove Permanently">
                            <IconButton
                              size="small"
                              onClick={() => handleHardDelete(member)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Staff Member</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              helperText="Minimum 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                label="Role"
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Doctor">Doctor</MenuItem>
                <MenuItem value="Nurse">Nurse</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Speciality (Optional)"
              value={formData.speciality}
              onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
            />
            <FormControl fullWidth required sx={{ gridColumn: 'span 2' }}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                label="Branch"
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id.toString()}>
                    {branch.branch_name} - {branch.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStaff} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Add Staff Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Staff Member</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
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
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                label="Role"
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Doctor">Doctor</MenuItem>
                <MenuItem value="Nurse">Nurse</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Speciality (Optional)"
              value={formData.speciality}
              onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel>Branch</InputLabel>
              <Select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                label="Branch"
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id.toString()}>
                    {branch.branch_name} - {branch.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditStaff} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Update Staff Member'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password for {selectedStaff?.first_name} {selectedStaff?.last_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={resetPasswordData.new_password}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, new_password: e.target.value })}
              required
              helperText="Minimum 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={resetPasswordData.confirm_password}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirm_password: e.target.value })}
              required
              error={resetPasswordData.confirm_password !== '' && resetPasswordData.new_password !== resetPasswordData.confirm_password}
              helperText={
                resetPasswordData.confirm_password !== '' && resetPasswordData.new_password !== resetPasswordData.confirm_password
                  ? 'Passwords do not match'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;