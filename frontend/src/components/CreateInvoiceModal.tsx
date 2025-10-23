import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { formatLKR } from '../utils/currency';
import api from '../services/api';

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Patient {
  patient_id: number;
  full_name: string;
  national_id: string;
}

interface Treatment {
  treatment_id: number;
  treatment_name: string;
  standard_cost: number;
  category: string;
}

interface InvoiceItem {
  treatment_id: number;
  treatment_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function CreateInvoiceModal({ open, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    notes: '',
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      fetchPatients();
      fetchTreatments();
    }
  }, [open]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await api.get('/api/treatments');
      setTreatments(response.data);
    } catch (err) {
      console.error('Failed to fetch treatments:', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInvoiceItem = () => {
    if (!selectedTreatment || quantity <= 0) return;

    const treatment = treatments.find(t => t.treatment_id.toString() === selectedTreatment);
    if (!treatment) return;

    const existingItem = invoiceItems.find(item => item.treatment_id === treatment.treatment_id);
    
    if (existingItem) {
      // Update existing item
      setInvoiceItems(prev => prev.map(item => 
        item.treatment_id === treatment.treatment_id
          ? { ...item, quantity: item.quantity + quantity, total_price: (item.quantity + quantity) * item.unit_price }
          : item
      ));
    } else {
      // Add new item
      const newItem: InvoiceItem = {
        treatment_id: treatment.treatment_id,
        treatment_name: treatment.treatment_name,
        quantity: quantity,
        unit_price: treatment.standard_cost,
        total_price: quantity * treatment.standard_cost,
      };
      setInvoiceItems(prev => [...prev, newItem]);
    }

    setSelectedTreatment('');
    setQuantity(1);
  };

  const removeInvoiceItem = (treatmentId: number) => {
    setInvoiceItems(prev => prev.filter(item => item.treatment_id !== treatmentId));
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || invoiceItems.length === 0) {
      setError('Please select a patient and add at least one treatment item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const invoiceData = {
        patient_id: parseInt(formData.patient_id),
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : null,
        notes: formData.notes,
        items: invoiceItems.map(item => ({
          treatment_id: item.treatment_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        total_amount: calculateTotal(),
      };

      await api.post('/api/invoices', invoiceData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patient_id: '',
      appointment_id: '',
      notes: '',
    });
    setInvoiceItems([]);
    setSelectedTreatment('');
    setQuantity(1);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Create New Invoice
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create an invoice for a patient with selected treatments
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Patient Selection */}
            <FormControl fullWidth required>
              <InputLabel>Select Patient</InputLabel>
              <Select
                value={formData.patient_id}
                onChange={(e) => handleInputChange('patient_id', e.target.value)}
                label="Select Patient"
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.patient_id} value={patient.patient_id.toString()}>
                    {patient.full_name} - {patient.national_id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Appointment ID (Optional) */}
            <TextField
              label="Appointment ID (Optional)"
              value={formData.appointment_id}
              onChange={(e) => handleInputChange('appointment_id', e.target.value)}
              type="number"
              fullWidth
            />

            {/* Notes */}
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            {/* Add Treatment Items */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add Treatment Items
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl sx={{ flex: 2 }}>
                  <InputLabel>Select Treatment</InputLabel>
                  <Select
                    value={selectedTreatment}
                    onChange={(e) => setSelectedTreatment(e.target.value)}
                    label="Select Treatment"
                  >
                    {treatments.map((treatment) => (
                      <MenuItem key={treatment.treatment_id} value={treatment.treatment_id.toString()}>
                        {treatment.treatment_name} - {formatLKR(treatment.standard_cost)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  sx={{ flex: 1 }}
                />
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addInvoiceItem}
                  disabled={!selectedTreatment || quantity <= 0}
                  sx={{ flex: 1 }}
                >
                  Add Item
                </Button>
              </Box>

              {/* Invoice Items Table */}
              {invoiceItems.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Treatment</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoiceItems.map((item) => (
                        <TableRow key={item.treatment_id}>
                          <TableCell>{item.treatment_name}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{formatLKR(item.unit_price)}</TableCell>
                          <TableCell align="right">{formatLKR(item.total_price)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeInvoiceItem(item.treatment_id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Total */}
              {invoiceItems.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Total Amount:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatLKR(calculateTotal())}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || invoiceItems.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Invoice'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
