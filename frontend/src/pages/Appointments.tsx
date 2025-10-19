import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  DirectionsWalk as WalkIcon,
  Today as TodayIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  appointment_date: string; // ISO or MySQL DATETIME string
  status: "Scheduled" | "Completed" | "Cancelled" | "No-Show" | string;
  is_walkin?: boolean; // optional to be compatible with APIs not providing it
  reason?: string;
  created_at: string;
}

type AppointmentForm = {
  patient_id: string;
  doctor_id: string;
  branch_id: string;
  appointment_date: string; // datetime-local value: YYYY-MM-DDTHH:mm
  status: "Scheduled" | "Completed" | "Cancelled" | "No-Show";
  is_walkin: boolean;
  reason: string;
};

// Safely parse date strings from API (handles MySQL "YYYY-MM-DD HH:mm:ss" and ISO)
function parseDateSafe(dateString?: string): Date | null {
  if (!dateString) return null;
  let s = dateString.trim();
  if (!s) return null;

  // If it's likely a MySQL DATETIME without 'T', convert to ISO-like
  // Example: "2025-10-28 10:00:00" -> "2025-10-28T10:00:00"
  if (s.length >= 19 && s[10] === " " && s.indexOf("T") === -1) {
    s = s.replace(" ", "T");
  }

  const d = new Date(s);
  if (isNaN(d.getTime())) {
    // last resort: try appending 'Z' if it's intended as UTC without timezone
    const dz = new Date(s.endsWith("Z") ? s : s + "Z");
    return isNaN(dz.getTime()) ? null : dz;
  }
  return d;
}

// Convert Date to datetime-local string (YYYY-MM-DDTHH:mm) in local time
function toDatetimeLocalValueFromDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useAuthStore();

  // Book modal
  const [openBook, setOpenBook] = useState(false);
  const [bookError, setBookError] = useState("");
  const [bookingForm, setBookingForm] = useState<AppointmentForm>({
    patient_id: "",
    doctor_id: "",
    branch_id: "",
    appointment_date: "",
    status: "Scheduled",
    is_walkin: false,
    reason: "",
  });

  // View modal
  const [openView, setOpenView] = useState(false);
  const [viewAppt, setViewAppt] = useState<Appointment | null>(null);

  // Edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState<AppointmentForm>({
    patient_id: "",
    doctor_id: "",
    branch_id: "",
    appointment_date: "",
    status: "Scheduled",
    is_walkin: false,
    reason: "",
  });

  // Delete confirm
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteAppt, setDeleteAppt] = useState<Appointment | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const canModify = user?.role === "Receptionist" || user?.role === "System Administrator";

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get("/api/appointments");
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus === "all") return true;
    return appointment.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const formatDateTime = (dateString: string) => {
    const d = parseDateSafe(dateString);
    if (!d) return dateString || "";
    return d.toLocaleString();
  };

  const toDatetimeLocalValue = (dateString: string) => {
    const d = parseDateSafe(dateString);
    if (!d) return "";
    return toDatetimeLocalValueFromDate(d);
  };

  const toMySQLDatetime = (datetimeLocalValue: string) => {
    // Convert YYYY-MM-DDTHH:mm to "YYYY-MM-DD HH:mm:00"
    if (!datetimeLocalValue) return "";
    const [date, time] = datetimeLocalValue.split("T");
    if (!date || !time) return "";
    return `${date} ${time}:00`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Scheduled: { color: "primary" as const, variant: "outlined" as const },
      Completed: { color: "success" as const, variant: "filled" as const },
      Cancelled: { color: "error" as const, variant: "outlined" as const },
      "No-Show": { color: "warning" as const, variant: "filled" as const },
    };
    const config = (statusConfig as any)[status] || { color: "default", variant: "outlined" };
    return <Chip label={status} color={config.color} variant={config.variant} size="small" />;
  };

  const getWalkinBadge = (isWalkin?: boolean) => {
    return (
      <Chip
        label={isWalkin ? "Walk-in" : "Scheduled"}
        color={isWalkin ? "secondary" : "default"}
        variant={isWalkin ? "filled" : "outlined"}
        size="small"
        icon={isWalkin ? <WalkIcon /> : <CalendarIcon />}
      />
    );
  };

  // Book
  const openBookDialog = () => {
    setBookError("");
    setBookingForm({
      patient_id: "",
      doctor_id: "",
      branch_id: "",
      appointment_date: "",
      status: "Scheduled",
      is_walkin: false,
      reason: "",
    });
    setOpenBook(true);
  };

  const closeBookDialog = () => {
    setOpenBook(false);
  };

  const handleCreateAppointment = async () => {
    setBookError("");
    try {
      const payload = {
        patient_id: Number(bookingForm.patient_id),
        doctor_id: Number(bookingForm.doctor_id),
        branch_id: Number(bookingForm.branch_id),
        appointment_date: toMySQLDatetime(bookingForm.appointment_date) || bookingForm.appointment_date,
        status: bookingForm.status,
        is_walkin: bookingForm.is_walkin,
        reason: bookingForm.reason,
      };
      const { data } = await axios.post("/api/appointments", payload);
      setAppointments((prev) => [data, ...prev]);
      setOpenBook(false);
    } catch (err: any) {
      setBookError(err.response?.data?.error || "Failed to create appointment");
    }
  };

  // View
  const openViewDialog = (appt: Appointment) => {
    setViewAppt(appt);
    setOpenView(true);
  };
  const closeViewDialog = () => {
    setOpenView(false);
    setViewAppt(null);
  };

  // Edit
  const openEditDialog = (appt: Appointment) => {
    setEditAppt(appt);
    setEditForm({
      patient_id: String(appt.patient_id ?? ""),
      doctor_id: String(appt.doctor_id ?? ""),
      branch_id: String(appt.branch_id ?? ""),
      appointment_date: toDatetimeLocalValue(appt.appointment_date),
      status: (["Scheduled", "Completed", "Cancelled", "No-Show"].includes(appt.status) ? appt.status : "Scheduled") as
        | "Scheduled"
        | "Completed"
        | "Cancelled"
        | "No-Show",
      is_walkin: !!appt.is_walkin,
      reason: appt.reason || "",
    });
    setEditError("");
    setOpenEdit(true);
  };
  const closeEditDialog = () => {
    setOpenEdit(false);
    setEditAppt(null);
    setEditError("");
  };
  const handleUpdateAppointment = async () => {
    if (!editAppt) return;
    setEditError("");
    try {
      const payload = {
        patient_id: Number(editForm.patient_id),
        doctor_id: Number(editForm.doctor_id),
        branch_id: Number(editForm.branch_id),
        appointment_date: toMySQLDatetime(editForm.appointment_date) || editForm.appointment_date,
        status: editForm.status,
        is_walkin: editForm.is_walkin,
        reason: editForm.reason,
      };
      const { data } = await axios.put(`/api/appointments/${editAppt.appointment_id}`, payload);
      setAppointments((prev) =>
        prev.map((a) => (a.appointment_id === data.appointment_id ? data : a))
      );
      closeEditDialog();
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to update appointment");
    }
  };

  // Delete
  const openDeleteDialog = (appt: Appointment) => {
    setDeleteAppt(appt);
    setDeleteError("");
    setOpenDelete(true);
  };
  const closeDeleteDialog = () => {
    setOpenDelete(false);
    setDeleteAppt(null);
    setDeleteError("");
  };
  const handleDeleteAppointment = async () => {
    if (!deleteAppt) return;
    setDeleteError("");
    try {
      await axios.delete(`/api/appointments/${deleteAppt.appointment_id}`);
      setAppointments((prev) => prev.filter((a) => a.appointment_id !== deleteAppt.appointment_id));
      closeDeleteDialog();
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || "Failed to delete appointment");
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading appointments...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchAppointments} startIcon={<RefreshIcon />}>
            Try again
          </Button>
        }
        sx={{ mb: 2 }}
      >
        <AlertTitle>Error loading appointments</AlertTitle>
        {error}
      </Alert>
    );
  }

  // Robust "Today" count using local date parts to avoid timezone edge-cases and invalid parses
  const todayCount = appointments.filter((a) => {
    const d = parseDateSafe(a.appointment_date);
    if (!d) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length;

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        mb={4}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
            Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage patient appointments and scheduling
          </Typography>
        </Box>
        {canModify && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: { xs: 2, sm: 0 } }}
            onClick={openBookDialog}
          >
            Book Appointment
          </Button>
        )}
      </Box>

      {/* Stats Overview */}
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap={3}
        sx={{ mb: 4 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                <CalendarIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                <CheckIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Scheduled
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.filter((a) => a.status === "Scheduled").length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
                <WalkIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Walk-ins
                </Typography>
                <Typography variant="h4" component="div">
                  {appointments.filter((a) => a.is_walkin).length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                <TodayIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Today
                </Typography>
                <Typography variant="h4" component="div">
                  {todayCount}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} alignItems={{ sm: "end" }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="no-show">No-Show</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => setFilterStatus("all")} sx={{ height: "fit-content" }}>
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Appointment List ({filteredAppointments.length})
          </Typography>
        </CardContent>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Appointment</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.appointment_id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Appointment #{appointment.appointment_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Patient ID: {appointment.patient_id}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Doctor ID: {appointment.doctor_id}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Branch ID: {appointment.branch_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{formatDateTime(appointment.appointment_date)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDateTime(appointment.created_at)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>{getWalkinBadge(appointment.is_walkin)}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <IconButton size="small" color="primary" onClick={() => openViewDialog(appointment)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      {canModify && (
                        <IconButton size="small" color="secondary" onClick={() => openEditDialog(appointment)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canModify && (
                        <IconButton size="small" color="error" onClick={() => openDeleteDialog(appointment)}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredAppointments.length === 0 && (
          <Box textAlign="center" py={6}>
            <CalendarIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              No appointments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterStatus !== "all" ? "Try adjusting your filters" : "Get started by booking your first appointment"}
            </Typography>
          </Box>
        )}
      </Card>

      {/* Book Appointment Dialog */}
      <Dialog open={openBook} onClose={closeBookDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Book Appointment
            </Typography>
            <IconButton onClick={closeBookDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {bookError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookError}
            </Alert>
          )}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
            <TextField
              label="Patient ID"
              value={bookingForm.patient_id}
              onChange={(e) => setBookingForm((p) => ({ ...p, patient_id: e.target.value }))}
              required
              type="number"
            />
            <TextField
              label="Doctor ID"
              value={bookingForm.doctor_id}
              onChange={(e) => setBookingForm((p) => ({ ...p, doctor_id: e.target.value }))}
              required
              type="number"
            />
            <TextField
              label="Branch ID"
              value={bookingForm.branch_id}
              onChange={(e) => setBookingForm((p) => ({ ...p, branch_id: e.target.value }))}
              required
              type="number"
            />
            <TextField
              label="Appointment Date & Time"
              type="datetime-local"
              value={bookingForm.appointment_date}
              onChange={(e) => setBookingForm((p) => ({ ...p, appointment_date: e.target.value }))}
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={bookingForm.status}
                label="Status"
                onChange={(e) =>
                  setBookingForm((p) => ({ ...p, status: e.target.value as AppointmentForm["status"] }))
                }
              >
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="No-Show">No-Show</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={bookingForm.is_walkin}
                  onChange={(e) => setBookingForm((p) => ({ ...p, is_walkin: e.target.checked }))}
                />
              }
              label="Walk-in"
              sx={{ ml: 1 }}
            />
            <TextField
              label="Reason"
              value={bookingForm.reason}
              onChange={(e) => setBookingForm((p) => ({ ...p, reason: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeBookDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCreateAppointment} variant="contained" startIcon={<AddIcon />}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Appointment Dialog */}
      <Dialog open={openView} onClose={closeViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Appointment Details
            </Typography>
            <IconButton onClick={closeViewDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewAppt && (
            <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Appointment ID
                </Typography>
                <Typography>{viewAppt.appointment_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                {getStatusBadge(viewAppt.status)}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient ID
                </Typography>
                <Typography>{viewAppt.patient_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Doctor ID
                </Typography>
                <Typography>{viewAppt.doctor_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Branch ID
                </Typography>
                <Typography>{viewAppt.branch_id}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                {getWalkinBadge(viewAppt.is_walkin)}
              </Box>
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Appointment Date
                </Typography>
                <Typography>{formatDateTime(viewAppt.appointment_date)}</Typography>
              </Box>
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reason
                </Typography>
                <Typography whiteSpace="pre-wrap">{viewAppt.reason || "—"}</Typography>
              </Box>
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography>{formatDateTime(viewAppt.created_at)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeViewDialog} variant="contained">
            Close
          </Button>
          {canModify && viewAppt && (
            <Button
              variant="outlined"
              onClick={() => {
                closeViewDialog();
                openEditDialog(viewAppt);
              }}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={openEdit} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Edit Appointment
            </Typography>
            <IconButton onClick={closeEditDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
            <TextField
              label="Patient ID"
              value={editForm.patient_id}
              onChange={(e) => setEditForm((p) => ({ ...p, patient_id: e.target.value }))}
              required
              type="number"
            />
            <TextField
              label="Doctor ID"
              value={editForm.doctor_id}
              onChange={(e) => setEditForm((p) => ({ ...p, doctor_id: e.target.value }))}
              required
              type="number"
            />
            <TextField
              label="Branch ID"
              value={editForm.branch_id}
              onChange={(e) => setEditForm((p) => ({ ...p, branch_id: e.target.value }))}
              required
              type="number"
            />
            <TextField
              label="Appointment Date & Time"
              type="datetime-local"
              value={editForm.appointment_date}
              onChange={(e) => setEditForm((p) => ({ ...p, appointment_date: e.target.value }))}
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as AppointmentForm["status"] }))}
              >
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="No-Show">No-Show</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.is_walkin}
                  onChange={(e) => setEditForm((p) => ({ ...p, is_walkin: e.target.checked }))}
                />
              }
              label="Walk-in"
              sx={{ ml: 1 }}
            />
            <TextField
              label="Reason"
              value={editForm.reason}
              onChange={(e) => setEditForm((p) => ({ ...p, reason: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleUpdateAppointment} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Appointment</DialogTitle>
        <DialogContent dividers>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Typography>
            Are you sure you want to delete appointment{" "}
            <strong>#{deleteAppt?.appointment_id}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteAppointment} variant="contained" color="error" startIcon={<CancelIcon />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}