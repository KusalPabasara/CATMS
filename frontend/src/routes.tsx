import { Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Staff from './pages/Staff'; // ADD THIS IMPORT
import Appointments from './pages/Appointments';
import CalendarView from './pages/Appointments/CalendarView';
import Treatments from './pages/Treatments';
import Billing from './pages/Billing';
import AuditLogs from './pages/Audit';
import PatientLogin from './pages/Patient/Login';
import PatientRegister from './pages/Patient/Register';
import PatientDashboard from './pages/Patient/Dashboard';
import BookAppointment from './pages/Patient/BookAppointment';
import AppointmentHistory from './pages/Patient/AppointmentHistory';
import PatientProfile from './pages/Patient/Profile';
import DoctorProfile from './pages/DoctorProfile';
import MainLayout from './layouts/MainLayout';
import { useAuthStore } from './store/authStore';
import { usePatientStore } from './store/patientStore';

export default function AppRoutes() {
  const { token } = useAuthStore();
  const { isAuthenticated: patientAuthenticated, patient } = usePatientStore();

  return (
    <Routes>
      {/* Public Routes with smart landing redirect */}
      <Route
        path="/"
        element={
          token ? (
            <Navigate to="/admin" replace />
          ) : patientAuthenticated && patient ? (
            <Navigate to="/patient/dashboard" replace />
          ) : (
            <Homepage />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<PatientRegister />} />
      <Route path="/patient/login" element={
        patientAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <PatientLogin />
      } />
      <Route path="/patient/register" element={
        patientAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <PatientRegister />
      } />
      
      {/* Protected Staff/Admin Routes */}
      {token ? (
        <Route path="/admin" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="staff" element={<Staff />} /> {/* ADD THIS LINE */}
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/calendar" element={<CalendarView />} />
          <Route path="treatments" element={<Treatments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="doctor-profile" element={<DoctorProfile />} />
        </Route>
      ) : null}
      
      {/* Protected Patient Routes */}
      {patientAuthenticated && patient ? (
        <>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<AppointmentHistory />} />
          <Route path="/patient/book-appointment" element={<BookAppointment />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
        </>
      ) : (
        <Route path="/patient/*" element={<Navigate to="/patient/login" replace />} />
      )}
      
      {/* Top-level helpers to avoid accidental fallbacks */}
      {!token && (
        <>
          <Route path="/patients" element={<Navigate to="/login" replace />} />
          <Route path="/appointments" element={<Navigate to="/login" replace />} />
          <Route path="/treatments" element={<Navigate to="/login" replace />} />
          <Route path="/billing" element={<Navigate to="/login" replace />} />
          <Route path="/audit-logs" element={<Navigate to="/login" replace />} />
        </>
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}