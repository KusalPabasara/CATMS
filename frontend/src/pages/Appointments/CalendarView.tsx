import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventDropArg } from '@fullcalendar/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  PlayArrow as InProgressIcon,
  List as ListIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';

interface Appointment {
  appointment_id: number;
  appointment_date: string;
  status: string;
  patient?: {
    full_name: string;
  };
  doctor?: {
    full_name: string;
  };
  reason?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    status: string;
    patientName: string;
    doctorName?: string;
    reason?: string;
  };
}

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthStore();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Check if user can edit appointments
  const canEditAppointments = user?.role === 'System Administrator' || 
                             user?.role === 'Branch Manager' || 
                             user?.role === 'Receptionist' || 
                             user?.role === 'Doctor';

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/appointments');
      const appts = response.data.map((a: Appointment) => ({
        id: a.appointment_id.toString(),
        title: `${a.patient?.full_name || 'Unknown Patient'} - ${a.doctor?.full_name || 'Unknown Doctor'}`,
        start: a.appointment_date,
        end: a.appointment_date,
        color: getColorByStatus(a.status),
        extendedProps: {
          status: a.status,
          patientName: a.patient?.full_name || 'Unknown Patient',
          doctorName: a.doctor?.full_name || 'Unknown Doctor',
          reason: a.reason || ''
        }
      }));
      setEvents(appts);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getColorByStatus = (status: string) => {
    switch (status) {
      case 'Scheduled': return '#3b82f6'; // Blue
      case 'Completed': return '#10b981'; // Green
      case 'Cancelled': return '#ef4444'; // Red
      case 'No-Show': return '#f59e0b'; // Amber
      case 'In Progress': return '#8b5cf6'; // Purple
      default: return '#9ca3af'; // Gray
    }
  };

  const handleDateClick = (arg: any) => {
    const clickedDate = arg.dateStr;
    alert(`📅 Clicked on date: ${clickedDate}\n\nYou can implement "Book Appointment" here for this date.`);
  };

  const handleEventClick = (arg: any) => {
    const event = arg.event;
    const { status, patientName, doctorName, reason } = event.extendedProps;
    
    alert(`📋 Appointment Details:\n\nPatient: ${patientName}\nDoctor: ${doctorName}\nStatus: ${status}\nReason: ${reason || 'Not specified'}\n\nYou can implement "Edit/Reschedule" here.`);
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const { id, start } = info.event;
    
    if (!start) {
      alert('❌ Invalid date/time selected');
      info.revert();
      return;
    }

    try {
      // Show loading state
      alert('🔄 Updating appointment...');
      
      await axios.put(`/api/appointments/${id}`, {
        appointment_date: start.toISOString()
      });

      alert('✅ Appointment moved successfully!');
      
      // Refresh the calendar data
      fetchAppointments();
      
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update appointment';
      alert(`❌ ${errorMessage}\n\nReverting to original position...`);
      info.revert(); // Rollback on error
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading calendar...
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
            Try Again
          </Button>
        }
        sx={{ textAlign: 'center' }}
      >
        <AlertTitle>Failed to load calendar</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
          <CalendarIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            Appointment Calendar
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px' }}>
          Visual overview of all appointments with color-coded status indicators. 
          Drag and drop appointments to reschedule them instantly.
        </Typography>
      </Box>

      {/* Drag & Drop Instructions */}
      <Card 
        sx={{ 
          mb: 4, 
          bgcolor: canEditAppointments 
            ? (isDark ? 'primary.900' : 'primary.50')
            : (isDark ? 'grey.800' : 'grey.50'),
          borderColor: canEditAppointments 
            ? (isDark ? 'primary.700' : 'primary.200')
            : (isDark ? 'grey.600' : 'grey.300'),
          border: 1,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="flex-start">
            <Box sx={{ flexShrink: 0, mr: 2 }}>
              {canEditAppointments ? (
                <LightbulbIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              ) : (
                <LockIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 1,
                  color: canEditAppointments ? 'primary.main' : 'text.primary'
                }}
              >
                Drag & Drop Rescheduling
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2,
                  color: canEditAppointments 
                    ? (isDark ? 'primary.light' : 'primary.dark') 
                    : 'text.secondary',
                  lineHeight: 1.6
                }}
              >
                {canEditAppointments 
                  ? 'You can now drag appointments to new time slots to reschedule them! Simply click and drag any appointment to a new date or time. The system will automatically update the backend and send notifications.'
                  : 'Drag and drop rescheduling is only available to authorized staff members (Receptionist, Doctor, Branch Manager, or System Administrator).'
                }
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 'medium',
                  color: canEditAppointments 
                    ? (isDark ? 'primary.light' : 'primary.main') 
                    : 'text.secondary'
                }}
              >
                <strong>Tip:</strong> {canEditAppointments 
                  ? 'Drag appointments within business hours (Monday-Friday, 8 AM - 6 PM)'
                  : 'Contact your administrator for access to appointment rescheduling'
                }
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Status Legend */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Status Legend
          </Typography>
          <Box 
            display="grid" 
            gridTemplateColumns={{ xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }}
            gap={2}
          >
            <Chip
              icon={<CalendarIcon />}
              label="Scheduled"
              color="primary"
              variant="outlined"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              icon={<CheckIcon />}
              label="Completed"
              color="success"
              variant="filled"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              icon={<CancelIcon />}
              label="Cancelled"
              color="error"
              variant="outlined"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              icon={<WarningIcon />}
              label="No-Show"
              color="warning"
              variant="filled"
              sx={{ justifyContent: 'flex-start' }}
            />
            <Chip
              icon={<InProgressIcon />}
              label="In Progress"
              color="secondary"
              variant="filled"
              sx={{ justifyContent: 'flex-start' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box 
            sx={{
              '& .fc': {
                backgroundColor: 'background.paper',
                color: 'text.primary',
              },
              '& .fc-theme-standard .fc-scrollgrid': {
                border: `1px solid ${theme.palette.divider}`,
              },
              '& .fc-theme-standard td, & .fc-theme-standard th': {
                borderColor: theme.palette.divider,
              },
              '& .fc-col-header-cell': {
                backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[50],
                color: 'text.primary',
              },
              '& .fc-daygrid-day': {
                backgroundColor: 'background.paper',
              },
              '& .fc-timegrid-slot': {
                borderColor: theme.palette.divider,
              },
              '& .fc-timegrid-axis': {
                color: 'text.secondary',
              },
              '& .fc-button-primary': {
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  borderColor: theme.palette.primary.dark,
                },
              },
              '& .fc-button-primary:disabled': {
                backgroundColor: theme.palette.action.disabled,
                borderColor: theme.palette.action.disabled,
              },
              '& .fc-toolbar-title': {
                color: 'text.primary',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              },
              '& .fc-daygrid-day-number': {
                color: 'text.primary',
              },
              '& .fc-timegrid-slot-label': {
                color: 'text.secondary',
              },
              '& .fc-now-indicator-line': {
                borderColor: theme.palette.error.main,
              },
              '& .fc-daygrid-day:hover': {
                backgroundColor: isDark ? theme.palette.grey[700] : theme.palette.grey[100],
              },
              '& .fc-timegrid-slot:hover': {
                backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[50],
              },
              '& .fc-event': {
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                boxShadow: theme.shadows[1],
              },
              '& .fc-event:hover': {
                boxShadow: theme.shadows[3],
                filter: 'brightness(1.1)',
              },
              '& .fc-today': {
                backgroundColor: isDark 
                  ? `${theme.palette.primary.dark}20` 
                  : `${theme.palette.primary.light}20`,
              },
              '& .fc-non-business': {
                backgroundColor: isDark 
                  ? theme.palette.grey[900] 
                  : theme.palette.grey[100],
              },
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              height="auto"
              selectable={true}
              editable={canEditAppointments}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              eventConstraint="businessHours"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
              dayHeaderFormat={{
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              }}
              titleFormat={{
                month: 'long',
                year: 'numeric'
              }}
              eventDisplay="block"
              eventTextColor={"#ffffff"}
              eventBackgroundColor={theme.palette.primary.main}
              eventBorderColor={theme.palette.primary.dark}
              nowIndicator={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                startTime: '08:00',
                endTime: '18:00',
              }}
              weekends={false}
              locale="en"
              timeZone="local"
              firstDay={1} // Monday
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day'
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Quick Actions
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => window.location.href = '/appointments/new'}
            >
              Book New Appointment
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<ListIcon />}
              onClick={() => window.location.href = '/appointments'}
            >
              View All Appointments
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={fetchAppointments}
            >
              Refresh Calendar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
