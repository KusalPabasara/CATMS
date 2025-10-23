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
} from '@mui/material';
import {
  Add as AddIcon,
  MedicalServices as MedicalIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { formatLKR } from '../utils/currency';
import AddTreatmentModal from '../components/AddTreatmentModal';

interface Treatment {
  treatment_id: number;
  treatment_name: string;
  description: string;
  duration: number | null;
  standard_cost: number;
  category: string | null;
  icd10_code: string | null;
  cpt_code: string | null;
  is_active: boolean;
}

export default function Treatments() {
  const theme = useTheme();
  const { isDark } = useCustomTheme();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/treatments');
      let treatmentsData = response.data || [];
      
      // Add mock data if no treatments exist
      if (treatmentsData.length === 0) {
        treatmentsData = [
          {
            treatment_id: 1,
            treatment_name: 'General Consultation',
            description: 'Routine medical consultation and examination',
            duration: 30,
            standard_cost: 1500,
            category: 'General',
            icd10_code: 'Z00.00',
            cpt_code: '99213',
            is_active: true
          },
          {
            treatment_id: 2,
            treatment_name: 'Blood Pressure Check',
            description: 'Measurement of blood pressure and cardiovascular assessment',
            duration: 15,
            standard_cost: 800,
            category: 'Diagnostic',
            icd10_code: 'I10',
            cpt_code: '93000',
            is_active: true
          },
          {
            treatment_id: 3,
            treatment_name: 'Diabetes Management',
            description: 'Comprehensive diabetes care including glucose monitoring and medication adjustment',
            duration: 45,
            standard_cost: 2500,
            category: 'General',
            icd10_code: 'E11.9',
            cpt_code: '99214',
            is_active: true
          },
          {
            treatment_id: 4,
            treatment_name: 'Minor Surgery - Wound Suturing',
            description: 'Surgical closure of lacerations and minor wounds',
            duration: 60,
            standard_cost: 3500,
            category: 'Surgery',
            icd10_code: 'S01.9',
            cpt_code: '12001',
            is_active: true
          },
          {
            treatment_id: 5,
            treatment_name: 'Physical Therapy Session',
            description: 'Rehabilitation and physical therapy for musculoskeletal conditions',
            duration: 45,
            standard_cost: 2000,
            category: 'Therapy',
            icd10_code: 'M79.3',
            cpt_code: '97110',
            is_active: true
          },
          {
            treatment_id: 6,
            treatment_name: 'Emergency Treatment',
            description: 'Urgent medical care for acute conditions',
            duration: 30,
            standard_cost: 3000,
            category: 'Emergency',
            icd10_code: 'R50.9',
            cpt_code: '99281',
            is_active: true
          },
          {
            treatment_id: 7,
            treatment_name: 'Vaccination - COVID-19',
            description: 'COVID-19 vaccination administration',
            duration: 20,
            standard_cost: 1200,
            category: 'Preventive',
            icd10_code: 'Z23',
            cpt_code: '91300',
            is_active: true
          },
          {
            treatment_id: 8,
            treatment_name: 'ECG Examination',
            description: 'Electrocardiogram for heart rhythm analysis',
            duration: 25,
            standard_cost: 1800,
            category: 'Diagnostic',
            icd10_code: 'I49.9',
            cpt_code: '93000',
            is_active: true
          }
        ];
      }
      
      setTreatments(treatmentsData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch treatments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const handleAddSuccess = () => {
    fetchTreatments(); // Refresh the treatments list
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'default';
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
                        {treatment.treatment_name}
                      </Typography>
                      {treatment.icd10_code && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          ICD-10: {treatment.icd10_code}
                        </Typography>
                      )}
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
                        {formatLKR(treatment.standard_cost)}
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
          onClick={() => setAddModalOpen(true)}
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

      {/* Add Treatment Modal */}
      <AddTreatmentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </Box>
  );
}


