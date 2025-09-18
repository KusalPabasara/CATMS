import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
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
import MainLayout from './layouts/MainLayout';
import { useAuthStore } from './store/authStore';
import { usePatientStore } from './store/patientStore';

export default function AppRoutes() {
  const { token } = useAuthStore();
  const { isAuthenticated: patientAuthenticated, patient } = usePatientStore();


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/patient/login" element={
        patientAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <PatientLogin />
      } />
      <Route path="/patient/register" element={
        patientAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <PatientRegister />
      } />
      
      {/* Protected Staff/Admin Routes */}
      {token ? (
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/calendar" element={<CalendarView />} />
          <Route path="treatments" element={<Treatments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="audit-logs" element={<AuditLogs />} />
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
      
      {/* Default Redirects */}
      <Route path="/" element={
        token ? <Navigate to="/" replace /> : 
        patientAuthenticated ? <Navigate to="/patient/dashboard" replace /> :
        <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
