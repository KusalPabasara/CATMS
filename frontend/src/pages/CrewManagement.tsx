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
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface CrewMember {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  staff_title: string;
  branch_id: number;
  branch_name: string;
  is_active: boolean;
  hire_date?: string;
  salary?: number;
}

const CrewManagement: React.FC = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    staff_title: '',
    branch_id: '',
    salary: '',
    hire_date: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const roles = [
    { value: 'Receptionist', label: 'Receptionist' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Billing Staff', label: 'Billing Staff' },
    { value: 'Lab Technician', label: 'Lab Technician' },
    { value: 'Pharmacist', label: 'Pharmacist' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch branches
      const branchesResponse = await axios.get('/api/branches');
      let branchesData = branchesResponse.data;
      
      if (!branchesData || branchesData.length === 0) {
        branchesData = [
          { branch_id: 1, name: 'Colombo Main Branch' },
          { branch_id: 2, name: 'Kandy Branch' },
          { branch_id: 3, name: 'Galle Branch' }
        ];
      }
      setBranches(branchesData);

      // Fetch crew members (non-doctor staff)
      const crewResponse = await axios.get('/api/users/by-role?role=Receptionist');
      const nursesResponse = await axios.get('/api/users/by-role?role=Nurse');
      const billingResponse = await axios.get('/api/users/by-role?role=Billing Staff');
      
      let allCrewMembers = [
        ...(crewResponse.data || []),
        ...(nursesResponse.data || []),
        ...(billingResponse.data || [])
      ];
      
      // Add mock data if empty
      if (allCrewMembers.length === 0) {
        allCrewMembers = [
          {
            user_id: 201,
            full_name: 'Kumari Perera',
            email: 'kumari.perera@medsync.lk',
            phone: '+94 77 111 2222',
            role: 'Receptionist',
            staff_title: 'Senior Receptionist',
            branch_id: 1,
            branch_name: 'Colombo Main Branch',
            is_active: true,
            hire_date: '2023-01-15',
            salary: 45000
          },
          {
            user_id: 202,
            full_name: 'Nimal Silva',
            email: 'nimal.silva@medsync.lk',
            phone: '+94 77 222 3333',
            role: 'Nurse',
            staff_title: 'Registered Nurse',
            branch_id: 1,
            branch_name: 'Colombo Main Branch',
            is_active: true,
            hire_date: '2023-02-20',
            salary: 55000
          },
          {
            user_id: 203,
            full_name: 'Sanduni Fernando',
            email: 'sanduni.fernando@medsync.lk',
            phone: '+94 77 333 4444',
            role: 'Billing Staff',
            staff_title: 'Billing Coordinator',
            branch_id: 1,
            branch_name: 'Colombo Main Branch',
            is_active: true,
            hire_date: '2023-03-10',
            salary: 40000
          },
          {
            user_id: 204,
            full_name: 'Chamara Jayawardena',
            email: 'chamara.jayawardena@medsync.lk',
            phone: '+94 77 444 5555',
            role: 'Receptionist',
            staff_title: 'Receptionist',
            branch_id: 2,
            branch_name: 'Kandy Branch',
            is_active: true,
            hire_date: '2023-04-05',
            salary: 42000
          },
          {
            user_id: 205,
            full_name: 'Priyanka Rathnayake',
            email: 'priyanka.rathnayake@medsync.lk',
            phone: '+94 77 555 6666',
            role: 'Nurse',
            staff_title: 'Staff Nurse',
            branch_id: 2,
            branch_name: 'Kandy Branch',
            is_active: true,
            hire_date: '2023-05-12',
            salary: 50000
          },
          {
            user_id: 206,
            full_name: 'Dilshan Karunaratne',
            email: 'dilshan.karunaratne@medsync.lk',
            phone: '+94 77 666 7777',
            role: 'Lab Technician',
            staff_title: 'Senior Lab Technician',
            branch_id: 3,
            branch_name: 'Galle Branch',
            is_active: true,
            hire_date: '2023-06-18',
            salary: 48000
          }
        ];
      }
      
      setCrewMembers(allCrewMembers);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: '',
      staff_title: '',
      branch_id: '',
      salary: '',
      hire_date: ''
    });
    setEditingMember(null);
    setShowAddForm(true);
  };

  const handleEditMember = (member: CrewMember) => {
    setFormData({
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      staff_title: member.staff_title,
      branch_id: member.branch_id.toString(),
      salary: member.salary?.toString() || '',
      hire_date: member.hire_date || ''
    });
    setEditingMember(member);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        branch_id: parseInt(formData.branch_id),
        salary: formData.salary ? parseFloat(formData.salary) : null
      };

      if (editingMember) {
        await axios.put(`/api/users/${editingMember.user_id}`, submitData);
        setAlert({ type: 'success', message: 'Crew member updated successfully' });
      } else {
        await axios.post('/api/users', submitData);
        setAlert({ type: 'success', message: 'Crew member added successfully' });
      }
      
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving crew member:', error);
      setAlert({ type: 'error', message: 'Failed to save crew member' });
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to delete this crew member?')) {
      try {
        await axios.delete(`/api/users/${memberId}`);
        setAlert({ type: 'success', message: 'Crew member deleted successfully' });
        fetchData();
      } catch (error) {
        console.error('Error deleting crew member:', error);
        setAlert({ type: 'error', message: 'Failed to delete crew member' });
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Receptionist': return 'primary';
      case 'Nurse': return 'success';
      case 'Billing Staff': return 'warning';
      case 'Lab Technician': return 'info';
      case 'Pharmacist': return 'secondary';
      default: return 'default';
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
          Crew Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddMember}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
        >
          Add Crew Member
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

      {/* Crew Members Table */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Staff Members ({crewMembers.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {crewMembers.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {member.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.staff_title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={member.role} 
                      color={getRoleColor(member.role) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={member.branch_name} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{member.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {member.salary ? (
                      <Typography variant="body2">
                        Rs. {member.salary.toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={member.is_active ? 'Active' : 'Inactive'} 
                      color={member.is_active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditMember(member)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteMember(member.user_id)}
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

      {/* Add/Edit Crew Member Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMember ? 'Edit Crew Member' : 'Add New Crew Member'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Role"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Staff Title"
                value={formData.staff_title}
                onChange={(e) => setFormData({ ...formData, staff_title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={formData.branch_id}
                  onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                  label="Branch"
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Salary (Rs.)"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddForm(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMember ? 'Update' : 'Add'} Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrewManagement;