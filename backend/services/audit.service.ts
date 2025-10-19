import AuditLog from "../models/audit_log.model";

export interface AuditLogData {
  user_id: number;
  action: string;
  target_table: string;
  target_id?: number;
  ip_address: string;
  details?: string;
}

export const logAudit = async (auditData: AuditLogData) => {
  try {
    await AuditLog.create({
      user_id: auditData.user_id,
      action: auditData.action,
      target_table: auditData.target_table,
      target_id: auditData.target_id,
      ip_address: auditData.ip_address,
      timestamp: new Date()
    });
    
    console.log(`🔍 Audit logged: ${auditData.action} on ${auditData.target_table}`);
  } catch (error) {
    console.error("❌ Failed to log audit:", error);
    // Don't throw error - audit logging should not break main operations
  }
};

// Predefined audit actions for consistency
export const auditActions = {
  // Document management actions
  DOCUMENT_UPLOADED: 'Document Uploaded',
  DOCUMENT_ACCESSED: 'Document Accessed',
  DOCUMENT_UPDATED: 'Document Updated',
  DOCUMENT_DELETED: 'Document Deleted',
  DOCUMENT_SHARED: 'Document Shared',
  // Patient actions
  PATIENT_CREATED: "Patient Created",
  PATIENT_UPDATED: "Patient Updated",
  PATIENT_ARCHIVED: "Patient Archived",
  
  // Appointment actions
  APPOINTMENT_CREATED: "Appointment Created",
  APPOINTMENT_UPDATED: "Appointment Updated",
  APPOINTMENT_CANCELLED: "Appointment Cancelled",
  APPOINTMENT_COMPLETED: "Appointment Completed",
  
  // Invoice actions
  INVOICE_CREATED: "Invoice Created",
  INVOICE_UPDATED: "Invoice Updated",
  INVOICE_PAID: "Invoice Paid",
  
  // Payment actions
  PAYMENT_CREATED: "Payment Created",
  PAYMENT_REFUNDED: "Payment Refunded",
  
  // User actions
  USER_CREATED: "User Created",
  
  // Generic actions
  CREATE: "Create",
  UPDATE: "Update",
  
  // Treatment session actions
  TREATMENT_SESSION_CREATED: "Treatment Session Created",
  USER_UPDATED: "User Updated",
  USER_DEACTIVATED: "User Deactivated",
  
  // Treatment actions
  TREATMENT_CREATED: "Treatment Created",
  TREATMENT_UPDATED: "Treatment Updated",
  
  // System actions
  LOGIN: "User Login",
  LOGOUT: "User Logout",
  PASSWORD_CHANGED: "Password Changed",
  ROLE_CHANGED: "Role Changed",
  
  // Insurance actions
  CLAIM_CREATED: "Insurance Claim Created",
  CLAIM_UPDATED: "Insurance Claim Updated",
  CLAIM_APPROVED: "Insurance Claim Approved",
  CLAIM_REJECTED: "Insurance Claim Rejected"
};

// Helper function to get client IP address
export const getClientIP = (req: any): string => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket?.remoteAddress || 
         'unknown';
};

// Helper function to log with request context
export const logAuditWithRequest = async (
  req: any, 
  action: string, 
  targetTable: string, 
  targetId?: number,
  details?: string
) => {
  if (!req.user?.user_id) {
    console.warn("⚠️ Cannot log audit: No user context");
    return;
  }

  await logAudit({
    user_id: req.user.user_id,
    action,
    target_table: targetTable,
    target_id: targetId,
    ip_address: getClientIP(req),
    details
  });
};
