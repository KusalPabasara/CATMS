import AuditLog from "../models/audit_log.model";

export interface AuditLogData {
  user_id: number;
  action: string;
  target_table: string;
  target_id?: number;
  ip_address: string;
  details?: string; // optional; not stored in DB schema currently
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
    // Do not throw — audit logging must never break main operations
  }
};

// Predefined audit actions for consistency (no duplicate keys)
export const auditActions = {
  // Document management
  DOCUMENT_UPLOADED: "Document Uploaded",
  DOCUMENT_ACCESSED: "Document Accessed",
  DOCUMENT_UPDATED: "Document Updated",
  DOCUMENT_DELETED: "Document Deleted",
  DOCUMENT_SHARED: "Document Shared",

  // Patient
  PATIENT_CREATED: "Patient Created",
  PATIENT_UPDATED: "Patient Updated",
  PATIENT_ARCHIVED: "Patient Archived",

  // Appointment
  APPOINTMENT_CREATED: "Appointment Created",
  APPOINTMENT_UPDATED: "Appointment Updated",
  APPOINTMENT_CANCELLED: "Appointment Cancelled",
  APPOINTMENT_COMPLETED: "Appointment Completed",

  // Invoice
  INVOICE_CREATED: "Invoice Created",
  INVOICE_UPDATED: "Invoice Updated",
  INVOICE_PAID: "Invoice Paid",

  // Payment
  PAYMENT_CREATED: "Payment Created",
  PAYMENT_REFUNDED: "Payment Refunded",

  // User
  USER_CREATED: "User Created",
  USER_UPDATED: "User Updated",
  USER_DELETED: "User Deleted",
  USER_PASSWORD_RESET: "User Password Reset",
  USER_DEACTIVATED: "User Deactivated",

  // Generic
  CREATE: "Create",
  UPDATE: "Update",

  // Treatment session
  TREATMENT_SESSION_CREATED: "Treatment Session Created",

  // Treatment catalogue/records
  TREATMENT_CREATED: "Treatment Created",
  TREATMENT_UPDATED: "Treatment Updated",

  // System
  LOGIN: "User Login",
  LOGOUT: "User Logout",
  PASSWORD_CHANGED: "Password Changed",
  ROLE_CHANGED: "Role Changed",

  // Insurance
  CLAIM_CREATED: "Insurance Claim Created",
  CLAIM_UPDATED: "Insurance Claim Updated",
  CLAIM_APPROVED: "Insurance Claim Approved",
  CLAIM_REJECTED: "Insurance Claim Rejected",

  // AI Medical Assistant
  AI_QUERY: "AI Medical Query",
  AI_QUERY_SAVED: "AI Medical Query Saved",
  AI_MODEL_SELECTED: "AI Model Selected",
  AI_RECOMMENDATION_GENERATED: "AI Recommendation Generated"
} as const;

// Helper: best-effort client IP extraction
export const getClientIP = (req: any): string => {
  const xff = req?.headers?.["x-forwarded-for"];
  const forwarded =
    Array.isArray(xff) ? xff[0] :
    typeof xff === "string" ? xff.split(",")[0].trim() : undefined;

  return (
    forwarded ||
    req?.ip ||
    req?.connection?.remoteAddress ||
    req?.socket?.remoteAddress ||
    req?.connection?.socket?.remoteAddress ||
    "unknown"
  );
};

// Helper: log with request context
export const logAuditWithRequest = async (
  req: any,
  action: string,
  targetTable: string,
  targetId?: number,
  details?: string
) => {
  if (!req?.user?.user_id) {
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