import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import ExportButtons from "../../components/ExportButtons";
import { useAuthStore } from "../../store/authStore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  TrendingUp as TrendingIcon,
  Person as PersonIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

interface AuditLog {
  log_id: number;
  user_id: number;
  action: string;
  target_table: string;
  target_id?: number;
  ip_address: string;
  timestamp: string;
  User?: {
    full_name: string;
    email: string;
    username: string;
  };
}

interface AuditStats {
  action_stats: Array<{ action: string; count: number }>;
  table_stats: Array<{ target_table: string; count: number }>;
  user_stats: Array<{ user_id: number; count: number; User: { full_name: string; username: string } }>;
  recent_activity: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_records: number;
  records_per_page: number;
}

export default function AuditLogPage() {
  const { user } = useAuthStore();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    target_table: "",
    user_id: "",
    ip_address: "",
    start_date: "",
    end_date: "",
    page: 1,
    limit: 50
  });

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Check if user has permission to view audit logs
      const userRole = user?.role;
      if (!userRole) {
        console.error('User role not found');
        return;
      }
      
      if (!['System Administrator', 'Branch Manager'].includes(userRole)) {
        console.error('User does not have permission to view audit logs');
        return;
      }
      
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await axios.get(`/api/audit-logs?${params.toString()}`);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      // Check if user has permission to view audit stats
      const userRole = user?.role;
      if (!userRole) {
        console.error('User role not found');
        return;
      }
      
      if (!['System Administrator', 'Branch Manager'].includes(userRole)) {
        console.error('User does not have permission to view audit stats');
        return;
      }
      
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const response = await axios.get(`/api/audit-logs/stats/overview?${params.toString()}`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch audit stats:", error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const exportAuditLogs = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('format', format);
      
      const response = await axios.get(`/api/audit-logs/export/data?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export audit logs:", error);
    }
  };

  const getActionChipProps = (action: string) => {
    if (action.includes('Created')) return { color: 'success' as const, variant: 'filled' as const };
    if (action.includes('Updated')) return { color: 'primary' as const, variant: 'filled' as const };
    if (action.includes('Deleted') || action.includes('Archived') || action.includes('Cancelled')) return { color: 'error' as const, variant: 'filled' as const };
    if (action.includes('Login')) return { color: 'secondary' as const, variant: 'filled' as const };
    if (action.includes('Payment')) return { color: 'info' as const, variant: 'filled' as const };
    return { color: 'default' as const, variant: 'outlined' as const };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Audit Trail
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor all system activities and user actions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Box 
          display="grid" 
          gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }}
          gap={3} 
          sx={{ mb: 4 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TrendingIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Recent Activity (24h)
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.recent_activity}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Top Action
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                    {stats.action_stats[0]?.action || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.action_stats[0]?.count || 0} times
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <StorageIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Most Active Table
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                    {stats.table_stats[0]?.target_table || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.table_stats[0]?.count || 0} actions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Most Active User
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                    {stats.user_stats[0]?.User?.full_name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.user_stats[0]?.count || 0} actions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Filters
          </Typography>
          <Box 
            display="grid" 
            gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }}
            gap={2}
            sx={{ mb: 3 }}
          >
            <TextField
              label="Action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="Search actions..."
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              label="Table"
              value={filters.target_table}
              onChange={(e) => handleFilterChange('target_table', e.target.value)}
              placeholder="Search tables..."
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              label="User ID"
              type="number"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              placeholder="User ID"
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              label="IP Address"
              value={filters.ip_address}
              onChange={(e) => handleFilterChange('ip_address', e.target.value)}
              placeholder="IP address"
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              label="Start Date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Button
              onClick={() => setFilters({
                action: "",
                target_table: "",
                user_id: "",
                ip_address: "",
                start_date: "",
                end_date: "",
                page: 1,
                limit: 50
              })}
              variant="outlined"
              size="small"
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => exportAuditLogs('csv')}
              variant="contained"
              color="success"
              size="small"
            >
              Export CSV
            </Button>
            <Button
              onClick={() => exportAuditLogs('json')}
              variant="contained"
              color="primary"
              size="small"
            >
              Export JSON
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" component="h3">
                Audit Logs
              </Typography>
              {pagination && (
                <Typography variant="body2" color="text.secondary">
                  Showing {((pagination.current_page - 1) * pagination.records_per_page) + 1} to{' '}
                  {Math.min(pagination.current_page * pagination.records_per_page, pagination.total_records)} of{' '}
                  {pagination.total_records} records
                </Typography>
              )}
            </Box>
            <ExportButtons
              data={logs}
              dataType="auditLogs"
              filename="audit_logs"
              title="Audit Logs Report"
              allowedRoles={['System Administrator', 'Manager', 'Auditor']}
            />
          </Box>
        </CardContent>

        {loading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <Box textAlign="center">
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading audit logs...
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <TableContainer 
              sx={{ 
                backgroundColor: 'background.paper',
                '& .MuiTableCell-head': {
                  backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[50],
                  fontWeight: 'bold',
                },
                '& .MuiTableRow-root:hover': {
                  backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[50],
                }
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Module</TableCell>
                    <TableCell>Entity ID</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.log_id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {log.User?.full_name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.User?.email || 'No email'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          {...getActionChipProps(log.action)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.target_table}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.target_id || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }} color="text.secondary">
                          {log.ip_address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      variant="outlined"
                      size="small"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.total_pages}
                      variant="outlined"
                      size="small"
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}
