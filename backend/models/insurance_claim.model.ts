import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Appointment from './appointment.model';
import Invoice from './invoice.model';

interface InsuranceClaimAttributes {
  claim_id: number;
  patient_id: number;
  policy_id: number;
  appointment_id?: number;
  invoice_id?: number;
  claim_number: string;
  claim_amount: number;
  covered_amount: number;
  patient_responsibility: number;
  deductible_applied: number;
  co_payment_applied: number;
  claim_status: 'Draft' | 'Submitted' | 'Under_Review' | 'Approved' | 'Rejected' | 'Paid' | 'Denied';
  submission_date?: Date;
  approval_date?: Date;
  payment_date?: Date;
  rejection_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  Patient?: User;
  Appointment?: Appointment;
  Invoice?: Invoice;
}

interface InsuranceClaimCreationAttributes extends Optional<InsuranceClaimAttributes, 'claim_id' | 'appointment_id' | 'invoice_id' | 'covered_amount' | 'patient_responsibility' | 'deductible_applied' | 'co_payment_applied' | 'submission_date' | 'approval_date' | 'payment_date' | 'rejection_reason' | 'notes' | 'created_at' | 'updated_at'> {}

class InsuranceClaim extends Model<InsuranceClaimAttributes, InsuranceClaimCreationAttributes> implements InsuranceClaimAttributes {
  public claim_id!: number;
  public patient_id!: number;
  public policy_id!: number;
  public appointment_id?: number;
  public invoice_id?: number;
  public claim_number!: string;
  public claim_amount!: number;
  public covered_amount!: number;
  public patient_responsibility!: number;
  public deductible_applied!: number;
  public co_payment_applied!: number;
  public claim_status!: 'Draft' | 'Submitted' | 'Under_Review' | 'Approved' | 'Rejected' | 'Paid' | 'Denied';
  public submission_date?: Date;
  public approval_date?: Date;
  public payment_date?: Date;
  public rejection_reason?: string;
  public notes?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public Patient?: User;
  public Appointment?: Appointment;
  public Invoice?: Invoice;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InsuranceClaim.init(
  {
    claim_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'insurance_policies',
        key: 'policy_id',
      },
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'appointments',
        key: 'appointment_id',
      },
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'invoices',
        key: 'invoice_id',
      },
    },
    claim_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    claim_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    covered_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    patient_responsibility: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    deductible_applied: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    co_payment_applied: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    claim_status: {
      type: DataTypes.ENUM('Draft', 'Submitted', 'Under_Review', 'Approved', 'Rejected', 'Paid', 'Denied'),
      allowNull: false,
      defaultValue: 'Draft',
    },
    submission_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    approval_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'insurance_claims',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['patient_id'],
      },
      {
        fields: ['policy_id'],
      },
      {
        fields: ['claim_status'],
      },
      {
        fields: ['submission_date'],
      },
      {
        fields: ['claim_number'],
      },
    ],
  }
);

export default InsuranceClaim;