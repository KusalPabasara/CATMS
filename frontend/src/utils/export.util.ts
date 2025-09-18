import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatLKR } from './currency';

// CSV Export
export function exportToCSV(filename: string, columns: string[], data: any[]) {
  try {
    const csv = Papa.unparse({ fields: columns, data });
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(csvData, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error('Failed to export CSV');
  }
}

// PDF Export
export function exportToPDF(title: string, columns: string[], data: any[], filename: string) {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Add table
    autoTable(doc, {
      startY: 35,
      head: [columns],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 35, right: 14, bottom: 14, left: 14 }
    });
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF');
  }
}

// Specialized export functions for common data types
export const exportUtils = {
  // Appointments export
  appointments: (appointments: any[]) => {
    const columns = [
      'Appointment ID', 'Patient Name', 'Doctor Name', 'Date', 'Time', 
      'Status', 'Type', 'Notes'
    ];
    
    const data = appointments.map(apt => [
      apt.appointment_id || 'N/A',
      apt.Patient?.full_name || 'N/A',
      apt.Doctor?.full_name || 'N/A',
      apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString() : 'N/A',
      apt.appointment_time || 'N/A',
      apt.status || 'N/A',
      apt.appointment_type || 'N/A',
      apt.notes || 'N/A'
    ]);
    
    return { columns, data };
  },

  // Invoices export
  invoices: (invoices: any[]) => {
    const columns = [
      'Invoice ID', 'Patient Name', 'Total Amount', 'Paid Amount', 
      'Balance', 'Status', 'Date', 'Due Date'
    ];
    
    const data = invoices.map(inv => [
      inv.invoice_id || 'N/A',
      inv.Patient?.full_name || 'N/A',
      formatLKR(inv.total_amount || 0),
      formatLKR(inv.paid_amount || 0),
      formatLKR((inv.total_amount || 0) - (inv.paid_amount || 0)),
      inv.status || 'N/A',
      inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A',
      inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'
    ]);
    
    return { columns, data };
  },

  // Audit logs export
  auditLogs: (logs: any[]) => {
    const columns = [
      'User', 'Action', 'Module', 'Entity ID', 'IP Address', 'Timestamp', 'Details'
    ];
    
    const data = logs.map(log => [
      log.User?.full_name || 'N/A',
      log.action || 'N/A',
      log.target_table || 'N/A',
      log.target_id || 'N/A',
      log.ip_address || 'N/A',
      log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A',
      log.details || 'N/A'
    ]);
    
    return { columns, data };
  },

  // Patients export
  patients: (patients: any[]) => {
    const columns = [
      'Patient ID', 'Full Name', 'Email', 'Phone', 'Date of Birth', 
      'Gender', 'Address', 'Registration Date'
    ];
    
    const data = patients.map(patient => [
      patient.patient_id || 'N/A',
      patient.full_name || 'N/A',
      patient.email || 'N/A',
      patient.phone || 'N/A',
      patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A',
      patient.gender || 'N/A',
      patient.address || 'N/A',
      patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'
    ]);
    
    return { columns, data };
  },

  // Users export
  users: (users: any[]) => {
    const columns = [
      'User ID', 'Full Name', 'Email', 'Role', 'Branch', 'Status', 'Created Date'
    ];
    
    const data = users.map(user => [
      user.user_id || 'N/A',
      user.full_name || 'N/A',
      user.email || 'N/A',
      user.Role?.role_name || 'N/A',
      user.Branch?.branch_name || 'N/A',
      user.status || 'N/A',
      user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'
    ]);
    
    return { columns, data };
  },

  // Payments export
  payments: (payments: any[]) => {
    const columns = [
      'Payment ID', 'Invoice ID', 'Patient Name', 'Amount', 'Method', 'Status', 'Date'
    ];
    
    const data = payments.map(payment => [
      payment.payment_id || 'N/A',
      payment.invoice_id || 'N/A',
      payment.Invoice?.Patient?.full_name || 'N/A',
      formatLKR(payment.amount || 0),
      payment.payment_method || 'N/A',
      payment.status || 'N/A',
      payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'
    ]);
    
    return { columns, data };
  }
};

// Generic export function that automatically detects data type
export function smartExport(data: any[], dataType: string, filename: string) {
  const exportData = exportUtils[dataType as keyof typeof exportUtils];
  
  if (!exportData) {
    throw new Error(`Unknown data type: ${dataType}`);
  }
  
  const { columns, data: formattedData } = exportData(data);
  
  return {
    exportToCSV: () => exportToCSV(filename, columns, formattedData),
    exportToPDF: () => exportToPDF(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report`, columns, formattedData, filename)
  };
}
