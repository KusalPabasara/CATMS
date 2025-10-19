import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  Tooltip,
  Fab,
  useTheme,
  alpha,
  Skeleton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MedicalServices as MedicalIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

interface Treatment {
  treatment_id: number;
  name: string;
  description: string;
  duration: number | null;
  cost: number;
  category: string | null;
  icd10_code: string | null;
  cpt_code: string | null;
  is_active: boolean;
}

type TreatmentForm = {
  name: string;
  description: string;
  duration: string; // keep as string for input; convert to number in payload
  cost: string;     // keep as string for input; convert to number in payload
  category: string;
  icd10_code: string;
  cpt_code: string;
  is_active: boolean;
};

const defaultForm: TreatmentForm = {
  name: '',
  description: '',
  duration: '',
  cost: '',
  category: '',
  icd10_code: '',
  cpt_code: '',
  is_active: true,
};

export default function Treatments() {
  const theme = useTheme();
  const { isDark } = useCustomTheme();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  // Forms and selected item
  const [form, setForm] = useState<TreatmentForm>(defaultForm);
  const [editTarget, setEditTarget] = useState<Treatment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Treatment | null>(null);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setError('');
        setLoading(true);
        const response = await api.get('/api/treatments');
        setTreatments(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch treatments');
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'default' as const;
    const categoryColors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
      'General': 'primary',
      'Surgery': 'error',
      'Therapy': 'success',
      'Diagnostic': 'info',
      'Emergency': 'warning',
      'Preventive': 'secondary',
    };
    return categoryColors[category] || 'default';
  };

  // Helpers for dialogs
  const openAddDialog = () => {
    setForm(defaultForm);
    setFormError('');
    setOpenAdd(true);
  };
  const closeAddDialog = () => {
    setOpenAdd(false);
  };

  const openEditDialog = (t: Treatment) => {
    setEditTarget(t);
    setForm({
      name: t.name || '',
      description: t.description || '',
      duration: t.duration != null ? String(t.duration) : '',
      cost: t.cost != null ? String(t.cost) : '',
      category: t.category || '',
      icd10_code: t.icd10_code || '',
      cpt_code: t.cpt_code || '',
      is_active: !!t.is_active,
    });
    setFormError('');
    setOpenEdit(true);
  };
  const closeEditDialog = () => {
    setOpenEdit(false);
    setEditTarget(null);
  };

  const openDeleteDialog = (t: Treatment) => {
    setDeleteTarget(t);
    setOpenDelete(true);
  };
  const closeDeleteDialog = () => {
    setOpenDelete(false);
    setDeleteTarget(null);
  };

  const validateForm = (f: TreatmentForm) => {
    if (!f.name.trim()) return 'Name is required';
    if (!f.cost || isNaN(Number(f.cost))) return 'Valid cost is required';
    if (Number(f.cost) < 0) return 'Cost cannot be negative';
    if (f.duration && (isNaN(Number(f.duration)) || Number(f.duration) < 0)) return 'Duration must be a positive number';
    return '';
  };

  const handleCreate = async () => {
    const errMsg = validateForm(form);
    if (errMsg) {
      setFormError(errMsg);
      return;
    }
    try {
      setFormError('');
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        duration: form.duration ? Number(form.duration) : null,
        cost: Number(form.cost),
        category: form.category || null,
        icd10_code: form.icd10_code || null,
        cpt_code: form.cpt_code || null,
        is_active: !!form.is_active,
      };
      const { data } = await api.post('/api/treatments', payload);
      setTreatments(prev => [data, ...prev]);
      setOpenAdd(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create treatment');
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    const errMsg = validateForm(form);
    if (errMsg) {
      setFormError(errMsg);
      return;
    }
    try {
      setFormError('');
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        duration: form.duration ? Number(form.duration) : null,
        cost: Number(form.cost),
        category: form.category || null,
        icd10_code: form.icd10_code || null,
        cpt_code: form.cpt_code || null,
        is_active: !!form.is_active,
      };
      const { data } = await api.put(`/api/treatments/${editTarget.treatment_id}`, payload);
      setTreatments(prev => prev.map(t => (t.treatment_id === data.treatment_id ? data : t)));
      setOpenEdit(false);
      setEditTarget(null);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to update treatment');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/treatments/${deleteTarget.treatment_id}`);
      setTreatments(prev => prev.filter(t => t.treatment_id !== deleteTarget.treatment_id));
      setOpenDelete(false);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete treatment');
      setOpenDelete(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={60} />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            backgroundColor: isDark ? alpha(theme.palette.error.main, 0.1) : undefined,
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <MedicalIcon 
            sx={{ 
              fontSize: 40, 
              color: 'primary.main',
              filter: isDark ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : undefined,
            }} 
          />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              background: isDark 
                ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
                : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Treatments
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage and view all available medical treatments and procedures
        </Typography>
      </Box>

      {/* Treatments Table */}
      {treatments.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <MedicalIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No treatments found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              No treatments are currently available in the system.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ overflow: 'hidden' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MedicalIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Treatment Name
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Description
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimeIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Duration
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Cost
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Category
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {treatments.map((treatment) => (
                  <TableRow 
                    key={treatment.treatment_id}
                    sx={{
                      '&:hover': {
                        backgroundColor: isDark 
                          ? alpha(theme.palette.primary.main, 0.08)
                          : alpha(theme.palette.primary.main, 0.04),
                        transform: 'scale(1.01)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                        {treatment.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        {treatment.icd10_code && (
                          <Chip size="small" label={`ICD-10: ${treatment.icd10_code}`} />
                        )}
                        {treatment.cpt_code && (
                          <Chip size="small" label={`CPT: ${treatment.cpt_code}`} />
                        )}
                        <Chip
                          size="small"
                          label={treatment.is_active ? 'Active' : 'Inactive'}
                          color={treatment.is_active ? 'success' : 'default'}
                          variant={treatment.is_active ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {treatment.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {treatment.duration ? (
                        <Chip
                          icon={<TimeIcon />}
                          label={`${treatment.duration} min`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          Not specified
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600}
                        color="success.main"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <MoneyIcon fontSize="small" />
                        {formatCurrency(treatment.cost)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {treatment.category ? (
                        <Chip
                          label={treatment.category}
                          size="small"
                          color={getCategoryColor(treatment.category)}
                          variant="filled"
                        />
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          Uncategorized
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                          <IconButton color="primary" size="small" onClick={() => openEditDialog(treatment)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" size="small" onClick={() => openDeleteDialog(treatment)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Floating Action Button */}
      <Tooltip title="Add New Treatment" placement="left">
        <Fab
          color="primary"
          onClick={openAddDialog}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: isDark 
              ? 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
              : 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
            boxShadow: isDark 
              ? '0 8px 32px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(16, 185, 129, 0.2)'
              : '0 8px 32px rgba(30, 64, 175, 0.3), 0 4px 16px rgba(5, 150, 105, 0.2)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: isDark 
                ? '0 12px 40px rgba(59, 130, 246, 0.4), 0 6px 20px rgba(16, 185, 129, 0.3)'
                : '0 12px 40px rgba(30, 64, 175, 0.4), 0 6px 20px rgba(5, 150, 105, 0.3)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Add Treatment Dialog */}
      <Dialog open={openAdd} onClose={closeAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">Add Treatment</Typography>
            <IconButton onClick={closeAddDialog} size="small"><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
            <TextField label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <TextField label="Cost" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} required type="number" inputProps={{ step: '0.01', min: 0 }} />
            <TextField label="Duration (minutes)" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} type="number" inputProps={{ step: '1', min: 0 }} />
            <TextField select label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Surgery">Surgery</MenuItem>
              <MenuItem value="Therapy">Therapy</MenuItem>
              <MenuItem value="Diagnostic">Diagnostic</MenuItem>
              <MenuItem value="Emergency">Emergency</MenuItem>
              <MenuItem value="Preventive">Preventive</MenuItem>
            </TextField>
            <TextField label="ICD-10 Code" value={form.icd10_code} onChange={e => setForm(p => ({ ...p, icd10_code: e.target.value }))} />
            <TextField label="CPT Code" value={form.cpt_code} onChange={e => setForm(p => ({ ...p, cpt_code: e.target.value }))} />
            <TextField label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} multiline rows={3} sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }} />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />} label="Active" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeAddDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" startIcon={<AddIcon />}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Treatment Dialog */}
      <Dialog open={openEdit} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">Edit Treatment</Typography>
            <IconButton onClick={closeEditDialog} size="small"><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
            <TextField label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <TextField label="Cost" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} required type="number" inputProps={{ step: '0.01', min: 0 }} />
            <TextField label="Duration (minutes)" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} type="number" inputProps={{ step: '1', min: 0 }} />
            <TextField select label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Surgery">Surgery</MenuItem>
              <MenuItem value="Therapy">Therapy</MenuItem>
              <MenuItem value="Diagnostic">Diagnostic</MenuItem>
              <MenuItem value="Emergency">Emergency</MenuItem>
              <MenuItem value="Preventive">Preventive</MenuItem>
            </TextField>
            <TextField label="ICD-10 Code" value={form.icd10_code} onChange={e => setForm(p => ({ ...p, icd10_code: e.target.value }))} />
            <TextField label="CPT Code" value={form.cpt_code} onChange={e => setForm(p => ({ ...p, cpt_code: e.target.value }))} />
            <TextField label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} multiline rows={3} sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }} />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />} label="Active" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeEditDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={openDelete} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Treatment</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete treatment{' '}
            <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDeleteDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}