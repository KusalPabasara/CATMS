import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AppointmentAttributes {
  appointment_id: number;
  patient_id: number | null;
  doctor_id: number | null;
  branch_id: number | null;
  appointment_date: Date | null;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'Emergency' | 'Rejected' | null;
  is_walkin: boolean | null;
  reason: string | null;
  created_by: number | null;
  created_at: Date | null;
  approved_by?: number | null;
  approved_at?: Date | null;
  approval_status?: string | null;
  receptionist_approval_status?: string | null;
  receptionist_approved_by?: number | null;
  receptionist_approved_at?: Date | null;
  doctor_approval_status?: string | null;
  doctor_approved_by?: number | null;
  doctor_approved_at?: Date | null;
  rejection_reason?: string | null;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'appointment_id' | 'created_at'> {}

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public appointment_id!: number;
  public patient_id!: number | null;
  public doctor_id!: number | null;
  public branch_id!: number | null;
  public appointment_date!: Date | null;
  public status!: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'Emergency' | 'Rejected' | null;
  public is_walkin!: boolean | null;
  public reason!: string | null;
  public created_by!: number | null;
  public created_at!: Date | null;
  public approved_by?: number | null;
  public approved_at?: Date | null;
  public approval_status?: string | null;
  public receptionist_approval_status?: string | null;
  public receptionist_approved_by?: number | null;
  public receptionist_approved_at?: Date | null;
  public doctor_approval_status?: string | null;
  public doctor_approved_by?: number | null;
  public doctor_approved_at?: Date | null;
  public rejection_reason?: string | null;

  // Timestamps
  public readonly createdAt!: Date;
}

Appointment.init(
  {
    appointment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled', 'No-Show', 'Emergency', 'Rejected'),
      allowNull: true,
      defaultValue: 'Scheduled',
    },
    is_walkin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approval_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receptionist_approval_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    doctor_approval_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'appointments',
    timestamps: false,
    freezeTableName: true,
  }
);

export { Appointment };
export default Appointment;
export type { AppointmentAttributes, AppointmentCreationAttributes };