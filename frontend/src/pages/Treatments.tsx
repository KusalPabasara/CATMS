import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LocalHospital as TreatmentIcon,
  Add as AddIcon,
  SmartToy as BotIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../services/api';

type Catalogue = {
  treatment_type_id: number;
  treatment_name: string | null;
  description: string | null;
  icd10_code: string | null;
  cpt_code: string | null;
  standard_cost: number | null;
  category: string | null;
  is_active: boolean | null;
};

export default function Treatments() {
  const [rows, setRows] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<Catalogue | null>(null);

  const [form, setForm] = useState({
    treatment_name: '',
    description: '',
    icd10_code: '',
    cpt_code: '',
    standard_cost: '',
    category: '',
    is_active: 'true', // as string for Select
  });

  const hasData = useMemo(() => rows.length > 0, [rows]);

  useEffect(() => {
    fetchRows();
  }, []);

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/treatment-catalogue');
      setRows(res.data || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load treatments catalogue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      treatment_name: '',
      description: '',
      icd10_code: '',
      cpt_code: '',
      standard_cost: '',
      category: '',
      is_active: 'true',
    });
  };

  const openAddDialog = () => {
    resetForm();
    setOpenAdd(true);
  };

  const openEditDialog = (row: Catalogue) => {
    setSelected(row);
    setForm({
      treatment_name: row.treatment_name || '',
      description: row.description || '',
      icd10_code: row.icd10_code || '',
      cpt_code: row.cpt_code || '',
      standard_cost: row.standard_cost != null ? String(row.standard_cost) : '',
      category: row.category || '',
      is_active: String(row.is_active ?? true),
    });
    setOpenEdit(true);
  };

  const toPayload = () => {
    return {
      treatment_name: form.treatment_name.trim(),
      description: form.description.trim() || undefined,
      icd10_code: form.icd10_code.trim() || undefined,
      cpt_code: form.cpt_code.trim() || undefined,
      standard_cost: form.standard_cost ? Number(form.standard_cost) : undefined,
      category: form.category.trim() || undefined,
      is_active: form.is_active === 'true',
    };
  };

  const handleCreate = async () => {
    try {
      if (!form.treatment_name.trim()) {
        setError('Treatment name is required');
        return;
      }
      await api.post('/api/treatment-catalogue', toPayload());
      setSuccess('Treatment type added successfully');
      setOpenAdd(false);
      await fetchRows();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to add treatment type');
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      if (!form.treatment_name.trim()) {
        setError('Treatment name is required');
        return;
      }
      await api.put(`/api/treatment-catalogue/${selected.treatment_type_id}`, toPayload());
      setSuccess('Treatment type updated successfully');
      setOpenEdit(false);
      setSelected(null);
      await fetchRows();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update treatment type');
    }
  };

  const handleDelete = async (row: Catalogue) => {
    if (!window.confirm(`Deactivate "${row.treatment_name}"?`)) return;
    try {
      await api.delete(`/api/treatment-catalogue/${row.treatment_type_id}`);
      setSuccess('Treatment type deactivated');
      await fetchRows();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to deactivate treatment type');
    }
  };

  return (
    <Box>
      {/* Header with actions row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TreatmentIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>
              Treatments
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage and view all available treatments (catalogue)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Keep your bot icon in the header so it doesn't overlap your FAB */}
          <Tooltip title="My Bot">
            <span>
              <IconButton color="primary" aria-label="assistant">
                <BotIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
          >
            Add Treatment
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRows}
        >
          Refresh
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
              <CircularProgress />
            </Box>
          ) : hasData ? (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>ICD‑10</TableCell>
                    <TableCell>CPT</TableCell>
                    <TableCell align="right">Standard Cost</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((t) => (
                    <TableRow key={t.treatment_type_id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{t.treatment_name}</TableCell>
                      <TableCell sx={{ maxWidth: 360 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {t.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>{t.icd10_code || '—'}</TableCell>
                      <TableCell>{t.cpt_code || '—'}</TableCell>
                      <TableCell align="right">
                        {t.standard_cost != null ? `Rs. ${Number(t.standard_cost).toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell>{t.category || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={t.is_active === false ? 'Inactive' : 'Active'}
                          color={t.is_active === false ? 'default' : 'success'}
                          size="small"
                          variant={t.is_active === false ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEditDialog(t)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Deactivate">
                            <IconButton size="small" color="error" onClick={() => handleDelete(t)}>
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
          ) : (
            <Box
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  mb: 2,
                }}
              >
                <AddIcon color="action" />
              </Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                No treatments found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No treatments are currently available in the system.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
                Add Treatment
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Treatment Type</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={form.treatment_name}
                onChange={(e) => setForm((f) => ({ ...f, treatment_name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ICD‑10 Code"
                fullWidth
                value={form.icd10_code}
                onChange={(e) => setForm((f) => ({ ...f, icd10_code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CPT Code"
                fullWidth
                value={form.cpt_code}
                onChange={(e) => setForm((f) => ({ ...f, cpt_code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Standard Cost (LKR)"
                type="number"
                fullWidth
                value={form.standard_cost}
                onChange={(e) => setForm((f) => ({ ...f, standard_cost: e.target.value }))}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                fullWidth
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value }))}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Treatment Type</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={form.treatment_name}
                onChange={(e) => setForm((f) => ({ ...f, treatment_name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ICD‑10 Code"
                fullWidth
                value={form.icd10_code}
                onChange={(e) => setForm((f) => ({ ...f, icd10_code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CPT Code"
                fullWidth
                value={form.cpt_code}
                onChange={(e) => setForm((f) => ({ ...f, cpt_code: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Standard Cost (LKR)"
                type="number"
                fullWidth
                value={form.standard_cost}
                onChange={(e) => setForm((f) => ({ ...f, standard_cost: e.target.value }))}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                fullWidth
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value }))}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}