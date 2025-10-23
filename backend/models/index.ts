import Branch from './branch.model'
import Staff from './staff.model'
import Patient from './patient.model'
import Appointment from './appointment.model'
import Treatment from './treatment.model'
import TreatmentCatalogue from './treatment_catalogue.model'
import Invoice from './invoice.model'
import Payment from './payment.model'
import AuditLog from './audit_log.model'
import User from './user.model'
import Role from './role.model'
import Specialty from './specialty.model'
import DoctorSpecialty from './doctor_specialty.model'
import InsurancePolicy from './insurance_policy.model'
import PatientInsurance from './patient_insurance.model'
import InsuranceClaim from './insurance_claim.model'
import TreatmentCoverage from './treatment_coverage.model'

// Associations for new ER diagram structure
Staff.belongsTo(Branch, { foreignKey: 'branch_id', as: 'Branch' })
Branch.hasMany(Staff, { foreignKey: 'branch_id', as: 'Staff' })

Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'Patient' })
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'Doctor' })
Appointment.belongsTo(Branch, { foreignKey: 'branch_id', as: 'Branch' })

Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'Appointments' })
User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'Appointments' })
Branch.hasMany(Appointment, { foreignKey: 'branch_id', as: 'Appointments' })

Treatment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'Appointment' })
Treatment.belongsTo(TreatmentCatalogue, { foreignKey: 'treatment_id', as: 'TreatmentCatalogue' })

Appointment.hasMany(Treatment, { foreignKey: 'appointment_id', as: 'Treatments' })
TreatmentCatalogue.hasMany(Treatment, { foreignKey: 'treatment_id', as: 'Treatments' })

Invoice.belongsTo(User, { foreignKey: 'patient_id', as: 'Patient' })
Invoice.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'Appointment' })

User.hasMany(Invoice, { foreignKey: 'patient_id', as: 'Invoices' })
Appointment.hasMany(Invoice, { foreignKey: 'appointment_id', as: 'Invoices' })

Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'Invoice' })
Invoice.hasMany(Payment, { foreignKey: 'invoice_id', as: 'Payments' })

InsuranceClaim.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'Invoice' })
Invoice.hasMany(InsuranceClaim, { foreignKey: 'invoice_id', as: 'InsuranceClaims' })

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'User' })
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'AuditLogs' })

// User and Role associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'Role' })
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'Branch' })
Role.hasMany(User, { foreignKey: 'role_id', as: 'Users' })
Branch.hasMany(User, { foreignKey: 'branch_id', as: 'Users' })

// MedSync Multi-Specialty associations
DoctorSpecialty.belongsTo(User, { foreignKey: 'doctor_id', as: 'Doctor' })
DoctorSpecialty.belongsTo(Specialty, { foreignKey: 'specialty_id', as: 'Specialty' })
User.hasMany(DoctorSpecialty, { foreignKey: 'doctor_id', as: 'DoctorSpecialties' })
Specialty.hasMany(DoctorSpecialty, { foreignKey: 'specialty_id', as: 'DoctorSpecialties' })

// MedSync Insurance System associations
PatientInsurance.belongsTo(User, { foreignKey: 'patient_id', as: 'Patient' })
PatientInsurance.belongsTo(InsurancePolicy, { foreignKey: 'policy_id', as: 'InsurancePolicy' })
User.hasMany(PatientInsurance, { foreignKey: 'patient_id', as: 'PatientInsurance' })
InsurancePolicy.hasMany(PatientInsurance, { foreignKey: 'policy_id', as: 'PatientInsurance' })

InsuranceClaim.belongsTo(User, { foreignKey: 'patient_id', as: 'Patient' })
InsuranceClaim.belongsTo(InsurancePolicy, { foreignKey: 'policy_id', as: 'InsurancePolicy' })
InsuranceClaim.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'Appointment' })
InsuranceClaim.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'Invoice' })
User.hasMany(InsuranceClaim, { foreignKey: 'patient_id', as: 'InsuranceClaims' })
InsurancePolicy.hasMany(InsuranceClaim, { foreignKey: 'policy_id', as: 'InsuranceClaims' })
Appointment.hasMany(InsuranceClaim, { foreignKey: 'appointment_id', as: 'InsuranceClaims' })
Invoice.hasMany(InsuranceClaim, { foreignKey: 'invoice_id', as: 'InsuranceClaims' })

TreatmentCoverage.belongsTo(InsurancePolicy, { foreignKey: 'policy_id', as: 'InsurancePolicy' })
TreatmentCoverage.belongsTo(TreatmentCatalogue, { foreignKey: 'treatment_id', as: 'TreatmentCatalogue' })
InsurancePolicy.hasMany(TreatmentCoverage, { foreignKey: 'policy_id', as: 'TreatmentCoverage' })
TreatmentCatalogue.hasMany(TreatmentCoverage, { foreignKey: 'treatment_id', as: 'TreatmentCoverage' })

export default {
  Branch,
  Staff,
  Patient,
  Appointment,
  Treatment,
  TreatmentCatalogue,
  Invoice,
  Payment,
  AuditLog,
  User,
  Role,
  Specialty,
  DoctorSpecialty,
  InsurancePolicy,
  PatientInsurance,
  InsuranceClaim,
  TreatmentCoverage
}
