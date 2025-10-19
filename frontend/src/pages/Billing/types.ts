export interface Invoice {
  invoice_id: number;
  patient_id: number;
  appointment_id?: number;
  branch_id?: number;
  total_amount: number;
  paid_amount: number;
  status: 'Pending' | 'Partially Paid' | 'Paid' | 'Refunded';
  created_at: string;
  patient?: {
    patient_id: number;
    full_name: string;
    phone?: string;
    email?: string;
  };
  appointment?: {
    appointment_id: number;
    appointment_date: string;
    reason?: string;
  };
  branch?: {
    branch_id: number;
    name: string;
  };
}

export interface Payment {
  payment_id: number;
  invoice_id: number;
  amount: number;
  method: 'Cash' | 'Card' | 'Bank Transfer' | 'Mobile Wallet';
  transaction_id?: string;
  payment_date: string;
  invoice?: Invoice;
}

export interface PaymentForm {
  invoice_id: number;
  amount: number;
  method: 'Cash' | 'Card' | 'Bank Transfer' | 'Mobile Wallet';
  transaction_id?: string;
}

export interface BillingStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
}
