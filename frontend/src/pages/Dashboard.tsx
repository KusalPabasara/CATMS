import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  Line,
  Doughnut
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
  Filler
} from 'chart.js';
import { useAuthStore } from '../store/authStore';
import ReportPrint from './Dashboard/ReportPrint';
import ThemeToggle from '../components/ThemeToggle';
import MetricCard from '../components/MetricCard';
import { formatLKR } from '../utils/currency';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Tooltip as MuiTooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Pending as PendingIcon,
  Print as PrintIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(
  Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
  Filler
);

interface DashboardData {
  totalAppointments: number;
  totalPatients: number;
  totalRevenue: number;
  todayAppointments: number;
  pendingInvoices: number;
  pendingAmount: number;
  totalInvoices: number;
}

interface ChartData {
  date?: string;
  month?: string;
  total: number;
  completed?: number;
  scheduled?: number;
  cancelled?: number;
  invoices?: number;
}

interface TopDoctor {
  doctor_name: string;
  total_appointments: number;
  total_revenue: number;
  collected_amount: number;
}

interface PaymentMethod {
  method: string;
  count: number;
  total_amount: number;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [overview, setOverview] = useState<DashboardData>({
    totalAppointments: 0,
    totalPatients: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    totalInvoices: 0
  });
  
  const [appointmentChart, setAppointmentChart] = useState<ChartData[]>([]);
  const [revenueChart, setRevenueChart] = useState<ChartData[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [patientGrowth, setPatientGrowth] = useState<ChartData[]>([]);
  
  // Advanced analytics state
  const [topTreatments, setTopTreatments] = useState<any[]>([]);
  const [paymentMethodTrends, setPaymentMethodTrends] = useState<any[]>([]);
  const [insuranceClaimStatus, setInsuranceClaimStatus] = useState<any[]>([]);
  const [appointmentStatusDistribution, setAppointmentStatusDistribution] = useState<any[]>([]);
  const [revenueBySpecialty, setRevenueBySpecialty] = useState<any[]>([]);

  // Print functionality
  const reportPrintRef = useRef<HTMLDivElement>(null);
  const handleReportPrint = useReactToPrint({
    content: () => reportPrintRef.current,
    documentTitle: `CATMS_Dashboard_Report_${new Date().toISOString().split('T')[0]}`,
  } as any);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Always fetch overview data (accessible to all authenticated users)
      const overviewRes = await api.get('/api/reports/overview');
      setOverview(overviewRes.data);

      // Fetch role-specific data based on user permissions
      const userRole = user?.role;
      
      if (!userRole) {
        return;
      }
      
      try {
        // Basic charts - accessible to staff and above
        if (['Doctor', 'Receptionist', 'Billing Staff', 'System Administrator', 'Branch Manager'].includes(userRole)) {
          const appointmentChartRes = await api.get('/api/reports/appointment-chart');
          setAppointmentChart(appointmentChartRes.data);
        }
      } catch (err) {
        // Appointment chart not accessible for this role
      }

      try {
        // Revenue data - accessible to billing staff and above
        if (['Billing Staff', 'System Administrator', 'Branch Manager'].includes(userRole)) {
          const revenueChartRes = await api.get('/api/reports/revenue-monthly');
          setRevenueChart(revenueChartRes.data);
        }
      } catch (err) {
        // Revenue chart not accessible for this role
      }

      try {
        // Top doctors - accessible to managers and admins
        if (['System Administrator', 'Branch Manager'].includes(userRole)) {
          const topDoctorsRes = await api.get('/api/reports/top-doctors');
          setTopDoctors(topDoctorsRes.data);
        }
      } catch (err) {
        // Top doctors not accessible for this role
      }

      try {
        // Payment methods - accessible to billing staff and above
        if (['Billing Staff', 'System Administrator', 'Branch Manager'].includes(userRole)) {
          const paymentMethodsRes = await api.get('/api/reports/payment-methods');
          setPaymentMethods(paymentMethodsRes.data);
        }
      } catch (err) {
        // Payment methods not accessible for this role
      }

      try {
        // Patient growth - accessible to doctors and above
        if (['Doctor', 'System Administrator', 'Branch Manager'].includes(userRole)) {
          const patientGrowthRes = await api.get('/api/reports/patient-growth');
          setPatientGrowth(patientGrowthRes.data);
        }
      } catch (err) {
        // Patient growth not accessible for this role
      }

      try {
        // Top treatments - accessible to managers and admins
        if (['System Administrator', 'Branch Manager'].includes(userRole)) {
          const topTreatmentsRes = await api.get('/api/reports/top-treatments');
          setTopTreatments(topTreatmentsRes.data);
        }
      } catch (err) {
        // Top treatments not accessible for this role
      }

      try {
        // Payment method trends - accessible to billing staff and above
        if (['Billing Staff', 'System Administrator', 'Branch Manager'].includes(userRole)) {
          const paymentMethodTrendsRes = await api.get('/api/reports/payment-method-trends');
          setPaymentMethodTrends(paymentMethodTrendsRes.data);
        }
      } catch (err) {
        // Payment method trends not accessible for this role
      }

      try {
        // Insurance claims status - accessible to managers and admins
        if (['System Administrator', 'Branch Manager'].includes(userRole)) {
          const insuranceClaimStatusRes = await api.get('/api/reports/insurance-claims-status');
          setInsuranceClaimStatus(insuranceClaimStatusRes.data);
        }
      } catch (err) {
        // Insurance claims status not accessible for this role
      }

      try {
        // Appointment status distribution - accessible to staff and above
        if (['Doctor', 'Receptionist', 'System Administrator', 'Branch Manager'].includes(userRole)) {
          const appointmentStatusDistributionRes = await api.get('/api/reports/appointment-status-distribution');
          setAppointmentStatusDistribution(appointmentStatusDistributionRes.data);
        }
      } catch (err) {
        // Appointment status distribution not accessible for this role
      }

      try {
        // Revenue by specialty - accessible to managers and admins
        if (['System Administrator', 'Branch Manager'].includes(userRole)) {
          const revenueBySpecialtyRes = await api.get('/api/reports/revenue-by-specialty');
          setRevenueBySpecialty(revenueBySpecialtyRes.data);
        }
      } catch (err) {
        // Revenue by specialty not accessible for this role
      }

    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatLKR(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading user information...</Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading dashboard data...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Try again
          </Button>
        }
      >
        <Typography variant="h6" gutterBottom>
          Error loading dashboard
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                CATMS Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's your clinic overview and key performance indicators.
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <ThemeToggle />
              {/* Book Appointment Button for Admin Users */}
              {(user?.role === 'System Administrator' || user?.role === 'Branch Manager' || user?.role === 'Receptionist') && (
                <MuiTooltip title="Book new appointment for patients">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/appointments?action=book')}
                    sx={{ textTransform: 'none' }}
                  >
                    Book Appointment
                  </Button>
                </MuiTooltip>
              )}
              <MuiTooltip title="Print dashboard report">
                <IconButton
                  color="primary"
                  onClick={handleReportPrint}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </MuiTooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        <MetricCard
          title="Total Appointments"
          value={overview.totalAppointments}
          icon={<CalendarIcon />}
          color="#2196f3"
          subtitle={`${overview.todayAppointments} today`}
        />
        <MetricCard
          title="Total Patients"
          value={overview.totalPatients}
          icon={<PeopleIcon />}
          color="#4caf50"
          subtitle="Active patients"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          icon={<MoneyIcon />}
          color="#ff9800"
          subtitle={`${overview.totalInvoices} invoices`}
        />
        <MetricCard
          title="Pending Amount"
          value={formatCurrency(overview.pendingAmount)}
          icon={<PendingIcon />}
          color="#f44336"
          subtitle={`${overview.pendingInvoices} invoices`}
        />
      </Box>

      {/* Charts Row 1 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Appointments Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Appointments - Last 7 Days
            </Typography>
            {appointmentChart.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <Bar
                  data={{
                    labels: appointmentChart.map(d => formatDate(d.date!)),
                    datasets: [
                      {
                        label: 'Completed',
                        data: appointmentChart.map(d => d.completed || 0),
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1
                      },
                      {
                        label: 'Scheduled',
                        data: appointmentChart.map(d => d.scheduled || 0),
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        borderWidth: 1
                      },
                      {
                        label: 'Cancelled',
                        data: appointmentChart.map(d => d.cancelled || 0),
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No appointment data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Monthly Revenue - Last 6 Months
            </Typography>
            {revenueChart.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <Line
                  data={{
                    labels: revenueChart.map(r => formatMonth(r.month!)),
                    datasets: [
                      {
                        label: 'Revenue',
                        data: revenueChart.map(r => r.total),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(Number(value));
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No revenue data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Charts Row 2 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Payment Methods Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Methods - Last 3 Months
            </Typography>
            {paymentMethods.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <Doughnut
                  data={{
                    labels: paymentMethods.map(p => p.method),
                    datasets: [
                      {
                        data: paymentMethods.map(p => p.total_amount),
                        backgroundColor: [
                          '#3b82f6',
                          '#10b981',
                          '#f59e0b',
                          '#ef4444',
                          '#8b5cf6'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            return `${label}: ${formatCurrency(value)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No payment data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Patient Growth Chart */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Patient Growth - Last 12 Months
            </Typography>
            {patientGrowth.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <Line
                  data={{
                    labels: patientGrowth.map(p => formatMonth(p.month!)),
                    datasets: [
                      {
                        label: 'New Patients',
                        data: patientGrowth.map(p => p.total),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No patient growth data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Top Treatments Chart */}
        {(user?.role === 'System Administrator' || user?.role === 'Branch Manager') && topTreatments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Treatments</h3>
            <Bar
              data={{
                labels: topTreatments.map((t: any) => t.treatment_name),
                datasets: [{
                  label: 'Usage Count',
                  data: topTreatments.map((t: any) => t.usage_count),
                  backgroundColor: '#f97316',
                  borderColor: '#ea580c',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                indexAxis: 'y' as const, // Horizontal bars
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        )}

        {/* Insurance Claim Status */}
        {(user?.role === 'System Administrator' || user?.role === 'Branch Manager') && insuranceClaimStatus.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Claim Status</h3>
            <Doughnut
              data={{
                labels: insuranceClaimStatus.map((s: any) => s.claim_status),
                datasets: [{
                  data: insuranceClaimStatus.map((s: any) => s.count),
                  backgroundColor: [
                    '#22c55e', // Green for Paid
                    '#f97316', // Orange for Pending
                    '#ef4444', // Red for Rejected
                    '#8b5cf6', // Purple for other statuses
                    '#06b6d4'  // Cyan for additional statuses
                  ],
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}

        {/* Appointment Status Distribution - Modern Progress Bars */}
        {appointmentStatusDistribution.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Appointment Status Distribution (3 Months)
              </Typography>
              <Box sx={{ mt: 3 }}>
                {appointmentStatusDistribution.map((status: any, index: number) => {
                  const total = appointmentStatusDistribution.reduce((sum: number, s: any) => sum + s.count, 0);
                  const percentage = ((status.count / total) * 100).toFixed(1);
                  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
                  
                  return (
                    <Box key={status.status} sx={{ mb: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {status.status}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            {status.count} appointments
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {percentage}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 12, 
                          backgroundColor: 'grey.200',
                          borderRadius: 6,
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: colors[index % colors.length],
                            borderRadius: 6,
                            transition: 'width 0.8s ease-in-out',
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                              animation: 'shimmer 2s infinite',
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Revenue by Specialty Chart */}
      {(user?.role === 'System Administrator' || user?.role === 'Branch Manager') && revenueBySpecialty.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Revenue by Medical Specialty (6 Months)
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <Bar
                data={{
                  labels: revenueBySpecialty.map((s: any) => s.specialty_name),
                  datasets: [{
                    label: 'Total Revenue',
                    data: revenueBySpecialty.map((s: any) => s.total_revenue),
                    backgroundColor: '#8b5cf6',
                    borderColor: '#7c3aed',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(Number(value));
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Trends Chart */}
      {(user?.role === 'Accountant' || user?.role === 'System Administrator' || user?.role === 'Branch Manager') && paymentMethodTrends.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Method Trends (30 Days)
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <Line
                data={{
                  labels: [...new Set(paymentMethodTrends.map((p: any) => formatDate(p.date)))],
                  datasets: [
                    {
                      label: 'Cash',
                      data: paymentMethodTrends
                        .filter((p: any) => p.method === 'Cash')
                        .map((p: any) => p.total_amount),
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderWidth: 2,
                      fill: false
                    },
                    {
                      label: 'Card',
                      data: paymentMethodTrends
                        .filter((p: any) => p.method === 'Card')
                        .map((p: any) => p.total_amount),
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 2,
                      fill: false
                    },
                    {
                      label: 'Bank Transfer',
                      data: paymentMethodTrends
                        .filter((p: any) => p.method === 'Bank Transfer')
                        .map((p: any) => p.total_amount),
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderWidth: 2,
                      fill: false
                    },
                    {
                      label: 'Mobile Wallet',
                      data: paymentMethodTrends
                        .filter((p: any) => p.method === 'Mobile Wallet')
                        .map((p: any) => p.total_amount),
                      borderColor: '#ec4899',
                      backgroundColor: 'rgba(236, 72, 153, 0.1)',
                      borderWidth: 2,
                      fill: false
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(Number(value));
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Top Doctors Leaderboard */}
      {(user?.role === 'System Administrator' || user?.role === 'Branch Manager') && topDoctors.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Top Doctors by Revenue
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Appointments</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Collected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topDoctors.map((doctor, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'primary.main',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            Dr. {doctor.doctor_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.total_appointments}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium" color="success.main">
                          {formatCurrency(doctor.total_revenue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(doctor.collected_amount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <Card 
                component="a" 
                href="/appointments"
                sx={{ 
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.100', mr: 2 }}>
                      <CalendarIcon color="primary" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        View Appointments
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage today's schedule
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card 
                component="a" 
                href="/billing"
                sx={{ 
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.100', mr: 2 }}>
                      <MoneyIcon color="success" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Billing & Payments
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Process payments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Card 
                component="a" 
                href="/patients"
                sx={{ 
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'secondary.100', mr: 2 }}>
                      <PeopleIcon color="secondary" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Patient Records
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View patient information
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Hidden Printable Report Component */}
      <Box sx={{ display: 'none' }}>
        <ReportPrint 
          ref={reportPrintRef} 
          overview={overview}
          userRole={user?.role}
          userName={user?.email}
        />
      </Box>
    </Box>
  );
}
