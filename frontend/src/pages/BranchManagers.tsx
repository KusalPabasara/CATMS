import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Branch {
  branch_id: number;
  name: string;
  location: string;
  phone: string;
  email: string;
  manager_name?: string;
  staff_count?: number;
  appointment_count?: number;
}

interface BranchManager {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  branch_id: number;
  branch_name: string;
  is_active: boolean;
}

const BranchManagers: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managers, setManagers] = useState<BranchManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch branches
      const branchesResponse = await axios.get('/api/branches');
      let branchesData = branchesResponse.data;
      
      // Add mock data if empty
      if (!branchesData || branchesData.length === 0) {
        branchesData = [
          {
            branch_id: 1,
            name: 'Colombo Main Branch',
            location: 'Colombo 07, Sri Lanka',
            phone: '+94 11 234 5678',
            email: 'colombo@medsync.lk',
            manager_name: 'Dr. Priya Fernando',
            staff_count: 15,
            appointment_count: 45
          },
          {
            branch_id: 2,
            name: 'Kandy Branch',
            location: 'Kandy, Sri Lanka',
            phone: '+94 81 234 5678',
            email: 'kandy@medsync.lk',
            manager_name: 'Dr. Rajesh Perera',
            staff_count: 12,
            appointment_count: 38
          },
          {
            branch_id: 3,
            name: 'Galle Branch',
            location: 'Galle, Sri Lanka',
            phone: '+94 91 234 5678',
            email: 'galle@medsync.lk',
            manager_name: 'Dr. Anjali Silva',
            staff_count: 10,
            appointment_count: 32
          }
        ];
      }
      
      setBranches(branchesData);

      // Fetch branch managers
      const managersResponse = await axios.get('/api/users/by-role?role=Branch Manager');
      let managersData = managersResponse.data;
      
      // Add mock data if empty
      if (!managersData || managersData.length === 0) {
        managersData = [
          {
            user_id: 101,
            full_name: 'Dr. Priya Fernando',
            email: 'priya.fernando@medsync.lk',
            phone: '+94 77 123 4567',
            branch_id: 1,
            branch_name: 'Colombo Main Branch',
            is_active: true
          },
          {
            user_id: 102,
            full_name: 'Dr. Rajesh Perera',
            email: 'rajesh.perera@medsync.lk',
            phone: '+94 77 234 5678',
            branch_id: 2,
            branch_name: 'Kandy Branch',
            is_active: true
          },
          {
            user_id: 103,
            full_name: 'Dr. Anjali Silva',
            email: 'anjali.silva@medsync.lk',
            phone: '+94 77 345 6789',
            branch_id: 3,
            branch_name: 'Galle Branch',
            is_active: true
          }
        ];
      }
      
      setManagers(managersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = () => {
    setFormData({ name: '', location: '', phone: '', email: '' });
    setEditingBranch(null);
    setShowAddForm(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setFormData({
      name: branch.name,
      location: branch.location,
      phone: branch.phone,
      email: branch.email
    });
    setEditingBranch(branch);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingBranch) {
        await axios.put(`/api/branches/${editingBranch.branch_id}`, formData);
        setAlert({ type: 'success', message: 'Branch updated successfully' });
      } else {
        await axios.post('/api/branches', formData);
        setAlert({ type: 'success', message: 'Branch added successfully' });
      }
      
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving branch:', error);
      setAlert({ type: 'error', message: 'Failed to save branch' });
    }
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await axios.delete(`/api/branches/${branchId}`);
        setAlert({ type: 'success', message: 'Branch deleted successfully' });
        fetchData();
      } catch (error) {
        console.error('Error deleting branch:', error);
        setAlert({ type: 'error', message: 'Failed to delete branch' });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Branch Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBranch}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
        >
          Add Branch
        </Button>
      </Box>

      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)}
          sx={{ mb: 2 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Branches Table */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Branches ({branches.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Branch Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Staff Count</TableCell>
                <TableCell>Appointments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.branch_id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {branch.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{branch.phone}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {branch.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {branch.manager_name ? (
                      <Chip label={branch.manager_name} color="primary" size="small" />
                    ) : (
                      <Chip label="No Manager" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={branch.staff_count || 0} color="secondary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={branch.appointment_count || 0} color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditBranch(branch)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteBranch(branch.branch_id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Branch Managers Table */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Branch Managers ({managers.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Manager Name</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.user_id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {manager.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={manager.branch_name} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{manager.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {manager.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={manager.is_active ? 'Active' : 'Inactive'} 
                      color={manager.is_active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Branch Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBranch ? 'Edit Branch' : 'Add New Branch'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Branch Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddForm(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBranch ? 'Update' : 'Add'} Branch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchManagers;