import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { formatLKRInput } from '../utils/currency';
import api from '../services/api';

interface AddTreatmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TREATMENT_CATEGORIES = [
  'Consultation',
  'Diagnostic',
  'Laboratory',
  'Treatment',
  'Dental',
  'Surgery',
  'Emergency',
  'Preventive Care',
  'Therapy',
  'Other'
];

const COMMON_ICD10_CODES = [
  'Z00.00', // General adult medical examination
  'Z01.20', // Dental examination
  'Z01.89', // Other specified examination
  'R91',    // Abnormal findings on diagnostic imaging of lung
  'I49.9',  // Cardiac arrhythmia, unspecified
  'D64.9',  // Anemia, unspecified
  'M79.3',  // Panniculitis, unspecified
  'R93.5',  // Abnormal findings on diagnostic imaging of other abdominal regions
];

const COMMON_CPT_CODES = [
  '99213', // Office visit, established patient
  '71020', // Radiologic examination, chest
  '85025', // Blood count; complete
  '93000', // Electrocardiogram, routine ECG
  'D1110', // Prophylaxis - adult
  '96365', // Intravenous infusion
  '76700', // Abdominal ultrasound
  '97110', // Therapeutic exercise
];

export default function AddTreatmentModal({ open, onClose, onSuccess }: AddTreatmentModalProps) {
  const [formData, setFormData] = useState({
    treatment_name: '',
    description: '',
    standard_cost: '',
    duration: '',
    category: '',
    icd10_code: '',
    cpt_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (field === 'standard_cost') {
      setFormData(prev => ({
        ...prev,
        [field]: formatLKRInput(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        standard_cost: parseFloat(formData.standard_cost) || 0,
        duration: parseInt(formData.duration) || null,
      };

      await api.post('/api/treatments', submitData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create treatment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      treatment_name: '',
      description: '',
      standard_cost: '',
      duration: '',
      category: '',
      icd10_code: '',
      cpt_code: '',
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Add New Treatment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new medical treatment or procedure to the system
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
            <TextField
              label="Treatment Name"
              value={formData.treatment_name}
              onChange={handleInputChange('treatment_name')}
              required
              fullWidth
              placeholder="e.g., General Consultation"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              multiline
              rows={3}
              fullWidth
              placeholder="Detailed description of the treatment"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Cost (LKR)"
                value={formData.standard_cost}
                onChange={handleInputChange('standard_cost')}
                required
                type="text"
                placeholder="0.00"
                sx={{ flex: 1 }}
                helperText="Enter amount in Sri Lankan Rupees"
              />
              
              <TextField
                label="Duration (minutes)"
                value={formData.duration}
                onChange={handleInputChange('duration')}
                type="number"
                placeholder="30"
                sx={{ flex: 1 }}
                inputProps={{ min: 1, max: 480 }}
              />
            </Box>
            
            <TextField
              label="Category"
              value={formData.category}
              onChange={handleInputChange('category')}
              select
              fullWidth
              required
            >
              {TREATMENT_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="ICD-10 Code"
                value={formData.icd10_code}
                onChange={handleInputChange('icd10_code')}
                select
                sx={{ flex: 1 }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {COMMON_ICD10_CODES.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                label="CPT Code"
                value={formData.cpt_code}
                onChange={handleInputChange('cpt_code')}
                select
                sx={{ flex: 1 }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {COMMON_CPT_CODES.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>
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
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Add Treatment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
