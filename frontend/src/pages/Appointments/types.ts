export interface Appointment {
  appointment_id: number;
  appointment_date: string;
  status: string;
  is_walkin: boolean;
  reason: string;
  patient_id: number;
  doctor_id: number;
  branch_id: number;
  created_at: string;
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
