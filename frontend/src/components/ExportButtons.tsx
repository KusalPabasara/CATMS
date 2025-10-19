import React from 'react';
import { useAuthStore } from '../store/authStore';
import { exportToCSV, exportToPDF } from '../utils/export.util';
import { formatLKR } from '../utils/currency';

interface ExportButtonsProps {
  data: any[];
  dataType: 'appointments' | 'invoices' | 'auditLogs' | 'patients' | 'users' | 'payments';
  filename: string;
  title?: string;
  allowedRoles?: string[];
  className?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  dataType,
  filename,
  title,
  allowedRoles = ['System Administrator', 'Accountant', 'Billing Staff', 'Manager'],
  className = ''
}) => {
  const { user } = useAuthStore();
  
  // Check if user has permission to export
  const canExport = user && allowedRoles.includes(user.role);
  
  if (!canExport) {
    return null;
  }

  const handleCSVExport = () => {
    try {
      const { columns, data: formattedData } = getExportData(dataType, data);
      exportToCSV(filename, columns, formattedData);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handlePDFExport = () => {
    try {
      const { columns, data: formattedData } = getExportData(dataType, data);
      const reportTitle = title || `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`;
      exportToPDF(reportTitle, columns, formattedData, filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const getExportData = (type: string, data: any[]) => {
    switch (type) {
      case 'appointments':
        return {
          columns: [
            'Appointment ID', 'Patient Name', 'Doctor Name', 'Date', 'Time', 
            'Status', 'Type', 'Notes'
          ],
          data: data.map(apt => [
            apt.appointment_id || 'N/A',
            apt.Patient?.full_name || 'N/A',
            apt.Doctor?.full_name || 'N/A',
            apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString() : 'N/A',
            apt.appointment_time || 'N/A',
            apt.status || 'N/A',
            apt.appointment_type || 'N/A',
            apt.notes || 'N/A'
          ])
        };
      
      case 'invoices':
        return {
          columns: [
            'Invoice ID', 'Patient Name', 'Total Amount', 'Paid Amount', 
            'Balance', 'Status', 'Date', 'Due Date'
          ],
          data: data.map(inv => [
            inv.invoice_id || 'N/A',
            inv.Patient?.full_name || 'N/A',
            formatLKR(inv.total_amount || 0),
            formatLKR(inv.paid_amount || 0),
            formatLKR((inv.total_amount || 0) - (inv.paid_amount || 0)),
            inv.status || 'N/A',
            inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A',
            inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'
          ])
        };
      
      case 'auditLogs':
        return {
          columns: [
            'User', 'Action', 'Module', 'Entity ID', 'IP Address', 'Timestamp', 'Details'
          ],
          data: data.map(log => [
            log.User?.full_name || 'N/A',
            log.action || 'N/A',
            log.target_table || 'N/A',
            log.target_id || 'N/A',
            log.ip_address || 'N/A',
            log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A',
            log.details || 'N/A'
          ])
        };
      
      case 'patients':
        return {
          columns: [
            'Patient ID', 'Full Name', 'Email', 'Phone', 'Date of Birth', 
            'Gender', 'Address', 'Registration Date'
          ],
          data: data.map(patient => [
            patient.patient_id || 'N/A',
            patient.full_name || 'N/A',
            patient.email || 'N/A',
            patient.phone || 'N/A',
            patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A',
            patient.gender || 'N/A',
            patient.address || 'N/A',
            patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'
          ])
        };
      
      case 'users':
        return {
          columns: [
            'User ID', 'Full Name', 'Email', 'Role', 'Branch', 'Status', 'Created Date'
          ],
          data: data.map(user => [
            user.user_id || 'N/A',
            user.full_name || 'N/A',
            user.email || 'N/A',
            user.Role?.role_name || 'N/A',
            user.Branch?.branch_name || 'N/A',
            user.status || 'N/A',
            user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
          ])
        };
      
      case 'payments':
        return {
          columns: [
            'Payment ID', 'Invoice ID', 'Patient Name', 'Amount', 'Method', 'Status', 'Date'
          ],
          data: data.map(payment => [
            payment.payment_id || 'N/A',
            payment.invoice_id || 'N/A',
            payment.Invoice?.Patient?.full_name || 'N/A',
            formatLKR(payment.amount || 0),
            payment.payment_method || 'N/A',
            payment.status || 'N/A',
            payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'
          ])
        };
      
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  };

  return (
    <div className={`flex justify-end space-x-2 mb-4 ${className}`}>
      <button
        onClick={handleCSVExport}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        title="Export to CSV"
      >
        <span>📊</span>
        <span>Export CSV</span>
      </button>
      
      <button
        onClick={handlePDFExport}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        title="Export to PDF"
      >
        <span>📄</span>
        <span>Export PDF</span>
      </button>
    </div>
  );
};

export default ExportButtons;
