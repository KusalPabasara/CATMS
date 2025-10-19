import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import PaymentModal from "./PaymentModal";
import InvoicePrint from "./InvoicePrint";
import type { Invoice, BillingStats } from "./types";
import { useAuthStore } from "../../store/authStore";
import ExportButtons from "../../components/ExportButtons";
import { formatLKR } from '../../utils/currency';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as PaidIcon,
  Warning as OverdueIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [stats, setStats] = useState<BillingStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueAmount: 0
  });
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user has permission to view invoices
      const userRole = user?.role;
      if (!userRole) {
        setError('User role not found');
        return;
      }
      
      if (!['Billing Staff', 'System Administrator', 'Branch Manager'].includes(userRole)) {
        setError('You do not have permission to view invoices');
        return;
      }
      
      const response = await axios.get('/api/invoices');
      setInvoices(response.data);
      calculateStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoiceData: Invoice[]) => {
    const totalInvoices = invoiceData.length;
    const totalRevenue = invoiceData.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = invoiceData.reduce((sum, inv) => sum + inv.paid_amount, 0);
    const pendingAmount = invoiceData
      .filter(inv => inv.status === 'Pending' || inv.status === 'Partially Paid')
      .reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);

    setStats({
      totalInvoices,
      totalRevenue,
      pendingAmount,
      paidAmount,
      overdueAmount: pendingAmount // Simplified for now
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      invoice.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_id.toString().includes(searchTerm) ||
      invoice.total_amount.toString().includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return formatLKR(amount);
  };
  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { color: 'warning' as const, variant: 'filled' as const },
      'Partially Paid': { color: 'info' as const, variant: 'filled' as const },
      'Paid': { color: 'success' as const, variant: 'filled' as const },
      'Refunded': { color: 'error' as const, variant: 'outlined' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default' as const, variant: 'outlined' as const };

    return (
      <Chip 
        label={status}
        color={config.color}
        variant={config.variant}
        size="small"
      />
    );
  };

  const handlePaymentSuccess = () => {
    setSelectedInvoice(null);
    fetchInvoices(); // Refresh the list
  };

  // Print functionality
  const invoicePrintRef = useRef<HTMLDivElement>(null);
  const handleInvoicePrint = useReactToPrint({
    content: () => invoicePrintRef.current,
    documentTitle: `Invoice_${printInvoice?.invoice_id}`,
    onAfterPrint: () => setPrintInvoice(null)
  } as any);

  const handlePrintInvoice = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    setTimeout(() => handleInvoicePrint(), 100);
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading billing data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        alignItems={{ sm: 'center' }} 
        justifyContent="space-between" 
        mb={4}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Billing & Invoicing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage patient invoices and payments
          </Typography>
        </Box>
        {(user?.role === 'Accountant' || user?.role === 'System Administrator') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Create Invoice
          </Button>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchInvoices} startIcon={<RefreshIcon />}>
              Try again
            </Button>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle>Error loading invoices</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Statistics Overview */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }}
        gap={3} 
        sx={{ mb: 4 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <ReceiptIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Invoices
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.totalInvoices}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(stats.totalRevenue)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <PendingIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Pending Amount
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(stats.pendingAmount)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <PaidIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Paid Amount
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(stats.paidAmount)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <OverdueIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(stats.overdueAmount)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={2} alignItems={{ md: 'end' }}>
            <TextField
              label="Search Invoices"
              placeholder="Search by patient name, invoice ID, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partially paid">Partially Paid</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              sx={{ height: 'fit-content' }}
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" component="h2">
              Invoice Records ({filteredInvoices.length})
            </Typography>
            <ExportButtons
              data={filteredInvoices}
              dataType="invoices"
              filename="invoices"
              title="Invoices Report"
              allowedRoles={['System Administrator', 'Accountant', 'Billing Staff', 'Manager']}
            />
          </Box>
        </CardContent>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Amount Details</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.invoice_id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        #{invoice.invoice_id}
                      </Typography>
                      {invoice.appointment_id && (
                        <Typography variant="caption" color="text.secondary">
                          Appt: #{invoice.appointment_id}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {invoice.patient?.full_name}
                      </Typography>
                      {invoice.patient?.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {invoice.patient.phone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Total: {formatCurrency(invoice.total_amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Paid: {formatCurrency(invoice.paid_amount)}
                      </Typography>
                      {invoice.total_amount > invoice.paid_amount && (
                        <Typography variant="caption" color="error.main" sx={{ fontWeight: 'medium', display: 'block' }}>
                          Due: {formatCurrency(invoice.total_amount - invoice.paid_amount)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(invoice.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setSelectedInvoice(invoice)}
                        disabled={invoice.status === 'Paid'}
                        title={invoice.status === 'Paid' ? 'Invoice fully paid' : 'Add payment'}
                      >
                        <PaymentIcon />
                      </IconButton>
                      <IconButton size="small" color="secondary" title="View details">
                        <ViewIcon />
                      </IconButton>
                      {(user?.role === 'Accountant' || user?.role === 'System Administrator') && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Print invoice"
                        >
                          <PrintIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="info"
                        onClick={async () => {
                          try {
                            await axios.post(`/api/email/send-invoice/${invoice.invoice_id}`);
                            alert("📩 Invoice sent via email 🎉");
                          } catch (err: any) {
                            alert(err.response?.data?.error || "Failed to send invoice.");
                          }
                        }}
                        title="Email invoice"
                      >
                        <EmailIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredInvoices.length === 0 && (
          <Box textAlign="center" py={6}>
            <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              No invoices found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by creating your first invoice'
              }
            </Typography>
          </Box>
        )}
      </Card>

      {/* Payment Modal */}
      {selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Hidden Printable Invoice Component */}
      {printInvoice && (
        <div className="hidden">
          <InvoicePrint ref={invoicePrintRef} invoice={printInvoice} />
        </div>
      )}
    </Box>
  );
}
