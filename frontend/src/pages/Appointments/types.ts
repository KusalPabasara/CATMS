export interface Appointment {
  appointment_id: number;
  appointment_date: string;
  status: string;
  approval_status: string;
  is_walkin: boolean;
  reason: string;
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  created_at: string;
  // Dual approval workflow fields
  receptionist_approval_status: string;
  doctor_approval_status: string;
  receptionist_approved_by: number | null;
  doctor_approved_by: number | null;
  receptionist_approved_at: string | null;
  doctor_approved_at: string | null;
  rejection_reason: string | null;
  patient?: {
    patient_id: number;
    full_name: string;
    phone?: string;
    email?: string;
  };
  doctor?: {
    user_id: number;
    full_name: string;
    email?: string;
  };
  branch?: {
    branch_id: number;
    name: string;
  };
}

export interface AppointmentForm {
  appointment_date: string;
  doctor_id: string;
  patient_id: string;
  reason: string;
  is_walkin: boolean;
  branch_id: number;
  priority: string;
  notes: string;
}

export interface Doctor {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface Patient {
  patient_id: number;
  full_name: string;
  phone: string;
  email: string;
  national_id: string;
}

export interface BookingConflict {
  hasConflict: boolean;
  message?: string;
  conflictingAppointment?: Appointment;
}
