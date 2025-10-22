import { Navigate, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Users from './pages/Users';
import BranchManagers from './pages/BranchManagers';
import DoctorsManagement from './pages/DoctorsManagement';
import CrewManagement from './pages/CrewManagement';
import Doctors from './pages/Doctors';
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
import InsuranceManagement from './pages/Insurance';
import Reports from './pages/Reports';
import EmergencyWalkIns from './pages/EmergencyWalkIns';
import PerformanceMonitoring from './pages/PerformanceMonitoring';
import MainLayout from './layouts/MainLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';
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
              
              {/* Main Admin specific routes */}
              <Route path="branch-managers" element={
                <RoleProtectedRoute allowedRoles={['System Administrator']}>
                  <BranchManagers />
                </RoleProtectedRoute>
              } />
              
              {/* Branch Manager specific routes */}
              <Route path="doctors-management" element={
                <RoleProtectedRoute allowedRoles={['Branch Manager']}>
                  <DoctorsManagement />
                </RoleProtectedRoute>
              } />
              <Route path="crew-management" element={
                <RoleProtectedRoute allowedRoles={['Branch Manager']}>
                  <CrewManagement />
                </RoleProtectedRoute>
              } />
              
              {/* General admin routes */}
              <Route path="users" element={
                <RoleProtectedRoute allowedRoles={['System Administrator', 'Branch Manager']}>
                  <Users />
                </RoleProtectedRoute>
              } />
              <Route path="doctors" element={
                <RoleProtectedRoute allowedRoles={['System Administrator', 'Branch Manager']}>
                  <Doctors />
                </RoleProtectedRoute>
              } />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/calendar" element={<CalendarView />} />
          <Route path="emergency" element={
            <RoleProtectedRoute allowedRoles={['System Administrator', 'Branch Manager', 'Receptionist']}>
              <EmergencyWalkIns />
            </RoleProtectedRoute>
          } />
          <Route path="treatments" element={<Treatments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="insurance" element={
            <RoleProtectedRoute allowedRoles={['System Administrator', 'Branch Manager', 'Receptionist']}>
              <InsuranceManagement />
            </RoleProtectedRoute>
          } />
          <Route path="reports" element={
            <RoleProtectedRoute allowedRoles={['System Administrator', 'Branch Manager', 'Receptionist']}>
              <Reports />
            </RoleProtectedRoute>
          } />
          <Route path="performance" element={
            <RoleProtectedRoute allowedRoles={['System Administrator', 'Branch Manager', 'Receptionist']}>
              <PerformanceMonitoring />
            </RoleProtectedRoute>
          } />
          <Route path="audit-logs" element={
            <RoleProtectedRoute allowedRoles={['System Administrator', 'Branch Manager', 'Receptionist']}>
              <AuditLogs />
            </RoleProtectedRoute>
          } />
          <Route path="doctor-profile" element={
            <RoleProtectedRoute allowedRoles={['Doctor']}>
              <DoctorProfile />
            </RoleProtectedRoute>
          } />
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
