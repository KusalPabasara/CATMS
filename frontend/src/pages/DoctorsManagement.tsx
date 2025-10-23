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
  InputLabel,
  Card,
  CardContent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import axios from 'axios';

interface Doctor {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  staff_title: string;
  specialty: string;
  branch_id: number;
  branch_name: string;
  is_active: boolean;
  consultation_fee?: number;
  experience_years?: number;
}

const DoctorsManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    staff_title: '',
    specialty: '',
    branch_id: '',
    consultation_fee: '',
    experience_years: '',
    password: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors
      const doctorsResponse = await axios.get('/api/users/by-role?role=Doctor');
      let doctorsData = doctorsResponse.data;
      
      // Add mock data if empty
      if (!doctorsData || doctorsData.length === 0) {
        doctorsData = [
          {
            user_id: 301,
            full_name: 'Dr. Priya Fernando',
            email: 'priya.fernando@medsync.lk',
            phone: '+94 77 111 1111',
            staff_title: 'Senior Cardiologist',
            specialty: 'Cardiology',
            branch_id: 1,
            branch_name: 'Colombo Main Branch',
            is_active: true,
            consultation_fee: 5000,
            experience_years: 15
          },
          {
            user_id: 302,
            full_name: 'Dr. Rajesh Perera',
            email: 'rajesh.perera@medsync.lk',
            phone: '+94 77 222 2222',
            staff_title: 'General Physician',
            specialty: 'General Medicine',
            branch_id: 2,
            branch_name: 'Kandy Branch',
            is_active: true,
            consultation_fee: 3500,
            experience_years: 12
          },
          {
            user_id: 303,
            full_name: 'Dr. Anjali Silva',
            email: 'anjali.silva@medsync.lk',
            phone: '+94 77 333 3333',
            staff_title: 'Emergency Medicine Specialist',
            specialty: 'Emergency Medicine',
            branch_id: 3,
            branch_name: 'Galle Branch',
            is_active: true,
            consultation_fee: 4000,
            experience_years: 10
          },
          {
            user_id: 304,
            full_name: 'Dr. Chamara Jayawardena',
            email: 'chamara.jayawardena@medsync.lk',
            phone: '+94 77 444 4444',
            staff_title: 'Pediatrician',
            specialty: 'Pediatrics',
            branch_id: 1,
            branch_name: 'Colombo Main Branch',
            is_active: true,
            consultation_fee: 4500,
            experience_years: 8
          },
          {
            user_id: 305,
            full_name: 'Dr. Sanduni Rathnayake',
            email: 'sanduni.rathnayake@medsync.lk',
            phone: '+94 77 555 5555',
            staff_title: 'Orthopedic Surgeon',
            specialty: 'Orthopedics',
            branch_id: 2,
            branch_name: 'Kandy Branch',
            is_active: true,
            consultation_fee: 6000,
            experience_years: 18
          }
        ];
      }
      
      setDoctors(doctorsData);

      // Fetch specialties
      const specialtiesResponse = await axios.get('/api/specialties');
      let specialtiesData = specialtiesResponse.data;
      
      if (!specialtiesData || specialtiesData.length === 0) {
        specialtiesData = [
          { specialty_id: 1, name: 'Cardiology' },
          { specialty_id: 2, name: 'General Medicine' },
          { specialty_id: 3, name: 'Emergency Medicine' },
          { specialty_id: 4, name: 'Pediatrics' },
          { specialty_id: 5, name: 'Orthopedics' },
          { specialty_id: 6, name: 'Dermatology' },
          { specialty_id: 7, name: 'Neurology' },
          { specialty_id: 8, name: 'Gynecology' },
          { specialty_id: 9, name: 'Psychiatry' },
          { specialty_id: 10, name: 'Radiology' }
        ];
      }
      setSpecialties(specialtiesData);

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
    } catch (error) {
      console.error('Error fetching data:', error);
      setAlert({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      staff_title: '',
      specialty: '',
      branch_id: '',
      consultation_fee: '',
      experience_years: '',
      password: ''
    });
    setEditingDoctor(null);
    setShowAddForm(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setFormData({
      full_name: doctor.full_name,
      email: doctor.email,
      phone: doctor.phone,
      staff_title: doctor.staff_title,
      specialty: doctor.specialty,
      branch_id: doctor.branch_id.toString(),
      consultation_fee: doctor.consultation_fee?.toString() || '',
      experience_years: doctor.experience_years?.toString() || '',
      password: ''
    });
    setEditingDoctor(doctor);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        role: 'Doctor',
        branch_id: parseInt(formData.branch_id),
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
      };

      if (editingDoctor) {
        await axios.put(`/api/users/${editingDoctor.user_id}`, submitData);
        setAlert({ type: 'success', message: 'Doctor updated successfully' });
      } else {
        await axios.post('/api/users', submitData);
        setAlert({ type: 'success', message: 'Doctor added successfully' });
      }
      
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving doctor:', error);
      setAlert({ type: 'error', message: 'Failed to save doctor' });
    }
  };

  const handleDeleteDoctor = async (doctorId: number) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`/api/users/${doctorId}`);
        setAlert({ type: 'success', message: 'Doctor deleted successfully' });
        fetchData();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        setAlert({ type: 'error', message: 'Failed to delete doctor' });
      }
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
    const index = specialty.length % colors.length;
    return colors[index];
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
          Doctors Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDoctor}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
        >
          Add Doctor
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

      {/* Doctor Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Doctors
              </Typography>
              <Typography variant="h4">
                {doctors.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Doctors
              </Typography>
              <Typography variant="h4" color="success">
                {doctors.filter(d => d.is_active).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Specialties
              </Typography>
              <Typography variant="h4" color="primary">
                {specialties.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Experience
              </Typography>
              <Typography variant="h4" color="warning">
                {doctors.length > 0 ? Math.round(doctors.reduce((sum, d) => sum + (d.experience_years || 0), 0) / doctors.length) : 0} yrs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Doctors Table */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Doctors ({doctors.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor Name</TableCell>
                <TableCell>Specialty</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Consultation Fee</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.user_id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {doctor.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.staff_title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={doctor.specialty} 
                      color={getSpecialtyColor(doctor.specialty) as any} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={doctor.branch_name} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{doctor.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {doctor.consultation_fee ? (
                      <Typography variant="body2">
                        Rs. {doctor.consultation_fee.toLocaleString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {doctor.experience_years || 0} years
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={doctor.is_active ? 'Active' : 'Inactive'} 
                      color={doctor.is_active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditDoctor(doctor)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteDoctor(doctor.user_id)}
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

      {/* Add/Edit Doctor Dialog */}
      <Dialog open={showAddForm} onClose={() => setShowAddForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
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
                <InputLabel>Specialty</InputLabel>
                <Select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  label="Specialty"
                  sx={{ minWidth: 300 }}
                >
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty.specialty_id || specialty.name} value={specialty.name}>
                      {specialty.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                label="Consultation Fee (Rs.)"
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Experience (Years)"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              />
            </Grid>
            {!editingDoctor && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddForm(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDoctor ? 'Update' : 'Add'} Doctor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorsManagement;