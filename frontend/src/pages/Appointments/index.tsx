import { useState, useEffect } from "react";
import axios from "axios";
import BookForm from "./BookForm";
import type { Appointment } from "./types";
import { useAuthStore } from "../../store/authStore";
import ExportButtons from "../../components/ExportButtons";
import { useSearchParams } from "react-router-dom";

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchAppointments();
    
    // Check if admin clicked "Book Appointment" from dashboard
    const action = searchParams.get('action');
    if (action === 'book' && (user?.role === 'System Administrator' || user?.role === 'Branch Manager' || user?.role === 'Receptionist')) {
      setShowBookingForm(true);
    }

    // Set up real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [searchParams, user?.role]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      console.log('Current token:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('Current user:', localStorage.getItem('user'));
      
      const response = await axios.get('/api/appointments');
      let appointmentsData = response.data || [];
      
      // Add mock data if no appointments exist
      if (appointmentsData.length === 0) {
        appointmentsData = [
          {
            appointment_id: 1,
            patient_id: 4001,
            doctor_id: 2001,
            branch_id: 1,
            appointment_date: '2024-02-20T09:00:00Z',
            status: 'Scheduled',
            is_walkin: false,
            reason: 'Regular checkup',
            created_by: 1,
            created_at: '2024-02-15T10:30:00Z',
            patient_name: 'Sunil Perera',
            patient_phone: '0771234567',
            patient_email: 'sunil.perera@email.com',
            doctor_name: 'Dr. Anura Bandara',
            doctor_email: 'dr.anura.bandara@main.medsync.lk',
            branch_name: 'Main Clinic'
          },
          {
            appointment_id: 2,
            patient_id: 4002,
            doctor_id: 2002,
            branch_id: 1,
            appointment_date: '2024-02-20T10:30:00Z',
            status: 'Completed',
            is_walkin: false,
            reason: 'Diabetes follow-up',
            created_by: 1,
            created_at: '2024-02-16T11:00:00Z',
            patient_name: 'Kumari Wickramasinghe',
            patient_phone: '0772345678',
            patient_email: 'kumari.wickramasinghe@email.com',
            doctor_name: 'Dr. Malini Ratnayake',
            doctor_email: 'dr.malini.ratnayake@main.medsync.lk',
            branch_name: 'Main Clinic'
          },
          {
            appointment_id: 3,
            patient_id: 4003,
            doctor_id: 2003,
            branch_id: 1,
            appointment_date: '2024-02-20T14:00:00Z',
            status: 'Scheduled',
            is_walkin: false,
            reason: 'Knee pain consultation',
            created_by: 1,
            created_at: '2024-02-17T09:15:00Z',
            patient_name: 'Nimal Fernando',
            patient_phone: '0773456789',
            patient_email: 'nimal.fernando@email.com',
            doctor_name: 'Dr. Suresh Mendis',
            doctor_email: 'dr.suresh.mendis@main.medsync.lk',
            branch_name: 'Main Clinic'
          },
          {
            appointment_id: 4,
            patient_id: 4004,
            doctor_id: 2004,
            branch_id: 1,
            appointment_date: '2024-02-21T08:30:00Z',
            status: 'Scheduled',
            is_walkin: false,
            reason: 'Skin condition check',
            created_by: 1,
            created_at: '2024-02-18T14:20:00Z',
            patient_name: 'Samantha Jayawardena',
            patient_phone: '0774567890',
            patient_email: 'samantha.jayawardena@email.com',
            doctor_name: 'Dr. Nirmala Gunaratne',
            doctor_email: 'dr.nirmala.gunaratne@main.medsync.lk',
            branch_name: 'Main Clinic'
          },
          {
            appointment_id: 5,
            patient_id: 4005,
            doctor_id: 2005,
            branch_id: 1,
            appointment_date: '2024-02-21T11:00:00Z',
            status: 'Cancelled',
            is_walkin: false,
            reason: 'Headache consultation',
            created_by: 1,
            created_at: '2024-02-19T16:45:00Z',
            patient_name: 'Rajitha Silva',
            patient_phone: '0775678901',
            patient_email: 'rajitha.silva@email.com',
            doctor_name: 'Dr. Ravi Karunaratne',
            doctor_email: 'dr.ravi.karunaratne@main.medsync.lk',
            branch_name: 'Main Clinic'
          },
          {
            appointment_id: 6,
            patient_id: 4006,
            doctor_id: 2001,
            branch_id: 1,
            appointment_date: '2024-02-21T15:30:00Z',
            status: 'Emergency',
            is_walkin: true,
            reason: 'Chest pain emergency',
            created_by: 1,
            created_at: '2024-02-20T15:30:00Z',
            patient_name: 'Priya Perera',
            patient_phone: '0776789012',
            patient_email: 'priya.perera@email.com',
            doctor_name: 'Dr. Anura Bandara',
            doctor_email: 'dr.anura.bandara@main.medsync.lk',
            branch_name: 'Main Clinic'
          }
        ];
      }
      
      console.log('Fetched appointments:', appointmentsData.length, 'appointments');
      console.log('Raw appointments data:', appointmentsData);
      console.log('First appointment:', appointmentsData[0]);
      setAppointments(appointmentsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId: number, action: 'cancel' | 'complete', newStatus: string) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}`, { status: newStatus });
      fetchAppointments(); // Refresh the list
    } catch (err: any) {
      console.error(`Error ${action}ing appointment:`, err);
      alert(`Failed to ${action} appointment`);
    }
  };

  const handleAppointmentApproval = async (appointmentId: number, approver: 'receptionist' | 'doctor', action: 'approve' | 'reject') => {
    try {
      if (action === 'reject') {
        const reason = prompt('Enter rejection reason (optional):') || '';
        await axios.patch(`/api/appointments/${appointmentId}/reject`, { reason });
      } else {
        const endpoint = approver === 'receptionist' 
          ? `/api/appointments/${appointmentId}/approve/receptionist`
          : `/api/appointments/${appointmentId}/approve/doctor`;
        await axios.patch(endpoint);
      }
      fetchAppointments(); // Refresh the list
    } catch (err: any) {
      console.error(`Error ${action}ing appointment:`, err);
      alert(`Failed to ${action} appointment`);
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleForm(true);
  };

  const handleRescheduleSubmit = async (newDateTime: string) => {
    if (!selectedAppointment) return;
    
    try {
      await axios.put(`/api/appointments/${selectedAppointment.appointment_id}`, {
        appointment_date: newDateTime,
        status: 'Scheduled',
        approval_status: 'Pending',
        receptionist_approval_status: 'Pending',
        doctor_approval_status: 'Pending'
      });
      
      setShowRescheduleForm(false);
      setSelectedAppointment(null);
      fetchAppointments(); // Refresh the list
      alert('Appointment rescheduled successfully!');
    } catch (err: any) {
      console.error('Error rescheduling appointment:', err);
      alert('Failed to reschedule appointment');
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    const appointmentDetails = `
Appointment Details:
ID: ${appointment.appointment_id}
Patient: ${appointment.patient_name || 'N/A'}
Doctor: ${appointment.doctor_name || 'N/A'}
Branch: ${appointment.branch_name || 'N/A'}
Date: ${new Date(appointment.appointment_date).toLocaleString()}
Status: ${appointment.status || 'N/A'}
Type: ${appointment.is_walkin ? 'Walk-in' : 'Scheduled'}
Reason: ${appointment.reason || 'N/A'}
Created: ${new Date(appointment.created_at).toLocaleString()}
    `;
    
    alert(appointmentDetails);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // For now, show a simple edit form
    const newReason = prompt('Edit appointment reason:', appointment.reason || '');
    if (newReason !== null && newReason !== appointment.reason) {
      // Update the appointment
      handleUpdateAppointment(appointment.appointment_id, { reason: newReason });
    }
  };

  const handleUpdateAppointment = async (appointmentId: number, updateData: any) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}`, updateData);
      fetchAppointments(); // Refresh the list
      alert('Appointment updated successfully!');
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || (appointment.status && appointment.status.toLowerCase() === filterStatus.toLowerCase());
    const matchesSearch = searchTerm === '' || 
      (appointment.reason && appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      appointment.appointment_id.toString().includes(searchTerm.toLowerCase());
    
    console.log('Filtering appointment:', {
      id: appointment.appointment_id,
      status: appointment.status,
      reason: appointment.reason,
      filterStatus,
      matchesStatus,
      searchTerm,
      matchesSearch,
      finalMatch: matchesStatus && matchesSearch
    });
    
    return matchesStatus && matchesSearch;
  });

  console.log('Total appointments:', appointments.length);
  console.log('Filtered appointments:', filteredAppointments.length);
  console.log('Filter status:', filterStatus);
  console.log('Search term:', searchTerm);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'No-Show': 'bg-yellow-100 text-yellow-800'
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config}`}>
        {status}
      </span>
    );
  };

  const getWalkinBadge = (isWalkin: boolean) => {
    return isWalkin ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Walk-in
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Scheduled
      </span>
    );
  };

  const getApprovalStatusBadge = (appointment: Appointment) => {
    const { approval_status, receptionist_approval_status, doctor_approval_status } = appointment;
    
    // If fully approved
    if (approval_status === 'Approved') {
      return (
        <div className="flex flex-col space-y-1">
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            ✅ Approved
          </span>
        </div>
      );
    }
    
    // If rejected
    if (approval_status === 'Rejected') {
      return (
        <div className="flex flex-col space-y-1">
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            ❌ Rejected
          </span>
        </div>
      );
    }
    
    // If pending - show both approval statuses
    return (
      <div className="flex flex-col space-y-1">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          receptionist_approval_status === 'Approved' ? 'bg-green-100 text-green-800' :
          receptionist_approval_status === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          Receptionist: {receptionist_approval_status === 'Approved' ? '✅' : 
                        receptionist_approval_status === 'Rejected' ? '❌' : '⏳'} {receptionist_approval_status}
        </span>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          doctor_approval_status === 'Approved' ? 'bg-green-100 text-green-800' :
          doctor_approval_status === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          Doctor: {doctor_approval_status === 'Approved' ? '✅' : 
                  doctor_approval_status === 'Rejected' ? '❌' : '⏳'} {doctor_approval_status}
        </span>
      </div>
    );
  };



  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments.filter(appt => {
      const apptDate = new Date(appt.appointment_date).toDateString();
      return today === apptDate;
    }).length;
  };

  const getPendingApprovals = () => {
    if (user?.role === 'Receptionist') {
      return appointments.filter(appt => 
        appt.approval_status === 'Pending' && 
        appt.receptionist_approval_status === 'Pending'
      ).length;
    } else if (user?.role === 'Doctor') {
      return appointments.filter(appt => 
        appt.approval_status === 'Pending' && 
        appt.receptionist_approval_status === 'Approved' &&
        appt.doctor_approval_status === 'Pending'
      ).length;
    }
    return appointments.filter(appt => appt.approval_status === 'Pending').length;
  };

  const isNewAppointment = (appointment: Appointment) => {
    const createdTime = new Date(appointment.created_at).getTime();
    const now = new Date().getTime();
    const fiveMinutesAgo = now - (5 * 60 * 1000); // 5 minutes in milliseconds
    return createdTime > fiveMinutesAgo;
  };

    // Check authentication status
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️ Authentication Required</div>
            <p className="text-gray-600 mb-4">Please log in to view appointments</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      );
    }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            {(user?.role === 'Receptionist' || user?.role === 'Doctor') && getPendingApprovals() > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
                🔔 {getPendingApprovals()} Pending Approval{getPendingApprovals() > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">Manage patient appointments and scheduling</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <button
            onClick={fetchAppointments}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => window.location.href = '/appointments/calendar'}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            🗓️ Calendar View
          </button>
          {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && (
            <button
              onClick={() => setShowBookingForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              + Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-400 text-xl mr-2">⚠️</span>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading appointments</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchAppointments}
                className="mt-3 text-sm text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BookForm
              onSuccess={() => {
                setShowBookingForm(false);
                fetchAppointments();
              }}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleForm && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reschedule Appointment #{selectedAppointment.appointment_id}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Patient: {selectedAppointment.patient?.full_name || `ID: ${selectedAppointment.patient_id}`}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Current Date: {formatDateTime(selectedAppointment.appointment_date)}
            </p>
            
            <div className="mb-4">
              <label htmlFor="newDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                New Date & Time
              </label>
              <input
                type="datetime-local"
                id="newDateTime"
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRescheduleForm(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newDateTime = (document.getElementById('newDateTime') as HTMLInputElement)?.value;
                  if (newDateTime) {
                    handleRescheduleSubmit(newDateTime);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'Scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">🚶</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Walk-ins</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.is_walkin).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today</p>
              <p className="text-2xl font-bold text-gray-900">{getTodayAppointments()}</p>
            </div>
          </div>
        </div>

        {(user?.role === 'Receptionist' || user?.role === 'Doctor') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">🔔</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{getPendingApprovals()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Appointments
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by patient, doctor, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-Show</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Appointment List ({filteredAppointments.length}) - Total: {appointments.length}
            </h2>
            <ExportButtons
              data={filteredAppointments}
              dataType="appointments"
              filename="appointments"
              title="Appointments Report"
              allowedRoles={['System Administrator', 'Receptionist', 'Manager', 'Doctor']}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium text-sm">
                            📅
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            Appointment #{appointment.appointment_id}
                          </div>
                          {isNewAppointment(appointment) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                              🆕 New
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Patient: {appointment.patient?.full_name || `ID: ${appointment.patient_id}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Doctor: {appointment.doctor?.full_name || `ID: ${appointment.doctor_id}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(appointment.appointment_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {formatDateTime(appointment.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(appointment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getApprovalStatusBadge(appointment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getWalkinBadge(appointment.is_walkin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 text-xs"
                          onClick={() => handleViewAppointment(appointment)}
                        >
                          View
                        </button>
                        {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && (
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 text-xs"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      
                      {/* Approval Actions */}
                      {appointment.approval_status === 'Pending' && (
                        <div className="flex space-x-1">
                          {/* Receptionist Approval */}
                          {user?.role === 'Receptionist' && appointment.receptionist_approval_status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleAppointmentApproval(appointment.appointment_id, 'receptionist', 'approve')}
                                className="text-green-600 hover:text-green-900 text-xs px-2 py-1 bg-green-50 rounded"
                              >
                                ✅ Approve
                              </button>
                              <button 
                                onClick={() => handleAppointmentApproval(appointment.appointment_id, 'receptionist', 'reject')}
                                className="text-red-600 hover:text-red-900 text-xs px-2 py-1 bg-red-50 rounded"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          
                          {/* Doctor Approval */}
                          {user?.role === 'Doctor' && appointment.receptionist_approval_status === 'Approved' && appointment.doctor_approval_status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleAppointmentApproval(appointment.appointment_id, 'doctor', 'approve')}
                                className="text-green-600 hover:text-green-900 text-xs px-2 py-1 bg-green-50 rounded"
                              >
                                ✅ Approve
                              </button>
                              <button 
                                onClick={() => handleAppointmentApproval(appointment.appointment_id, 'doctor', 'reject')}
                                className="text-red-600 hover:text-red-900 text-xs px-2 py-1 bg-red-50 rounded"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Other Actions */}
                      <div className="flex space-x-2">
                        {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && appointment.status === 'Scheduled' && (
                          <button 
                            onClick={() => handleRescheduleAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 bg-blue-50 rounded"
                          >
                            📅 Reschedule
                          </button>
                        )}
                        {(user?.role === 'Receptionist' || user?.role === 'System Administrator') && appointment.status === 'Scheduled' && (
                          <button 
                            onClick={() => handleAppointmentAction(appointment.appointment_id, 'cancel', 'Cancelled')}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Cancel
                          </button>
                        )}
                        {(user?.role === 'Doctor' || user?.role === 'Receptionist' || user?.role === 'System Administrator') && appointment.status === 'Scheduled' && appointment.approval_status === 'Approved' && (
                          <button 
                            onClick={() => handleAppointmentAction(appointment.appointment_id, 'complete', 'Completed')}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search terms or filters' : 'Get started by booking your first appointment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
