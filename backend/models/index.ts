import Branch from './branch.model'
import Staff from './staff.model'
import Patient from './patient.model'
import Appointment from './appointment.model'
import Treatment from './treatment.model'
import TreatmentCatalogue from './treatment_catalogue.model'
import Invoice from './invoice.model'
import Payment from './payment.model'
import InsuranceClaim from './insurance_claim.model'
import AuditLog from './audit_log.model'

// Associations for new ER diagram structure
Staff.belongsTo(Branch, { foreignKey: 'branch_id', as: 'Branch' })
Branch.hasMany(Staff, { foreignKey: 'branch_id', as: 'Staff' })

Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'Patient' })
Appointment.belongsTo(Staff, { foreignKey: 'doctor_id', as: 'Doctor' })
Appointment.belongsTo(Branch, { foreignKey: 'branch_id', as: 'Branch' })

Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'Appointments' })
Staff.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'Appointments' })
Branch.hasMany(Appointment, { foreignKey: 'branch_id', as: 'Appointments' })

Treatment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'Appointment' })
Treatment.belongsTo(TreatmentCatalogue, { foreignKey: 'treatment_type_id', as: 'TreatmentCatalogue' })

Appointment.hasMany(Treatment, { foreignKey: 'appointment_id', as: 'Treatments' })
TreatmentCatalogue.hasMany(Treatment, { foreignKey: 'treatment_type_id', as: 'Treatments' })

Invoice.belongsTo(Patient, { foreignKey: 'patient_id', as: 'Patient' })
Invoice.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'Appointment' })

Patient.hasMany(Invoice, { foreignKey: 'patient_id', as: 'Invoices' })
Appointment.hasMany(Invoice, { foreignKey: 'appointment_id', as: 'Invoices' })

Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'Invoice' })
Invoice.hasMany(Payment, { foreignKey: 'invoice_id', as: 'Payments' })

InsuranceClaim.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'Invoice' })
Invoice.hasMany(InsuranceClaim, { foreignKey: 'invoice_id', as: 'InsuranceClaims' })

AuditLog.belongsTo(Staff, { foreignKey: 'staff_id', as: 'Staff' })
Staff.hasMany(AuditLog, { foreignKey: 'staff_id', as: 'AuditLogs' })

export default {
  Branch,
  Staff,
  Patient,
  Appointment,
  Treatment,
  TreatmentCatalogue,
  Invoice,
  Payment,
  InsuranceClaim,
  AuditLog
}
