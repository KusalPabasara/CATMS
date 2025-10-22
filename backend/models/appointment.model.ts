import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AppointmentAttributes {
  appointment_id: number;
  patient_id: number | null;
  doctor_id: number | null;
  branch_id: number | null;
  appointment_date: Date | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | null;
  is_walkin: boolean | null;
  reason: string | null;
  created_by: number | null;
  approved_by: number | null;
  approved_at: Date | null;
  rejection_reason: string | null;
  created_at: Date | null;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'appointment_id' | 'created_at'> {}

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public appointment_id!: number;
  public patient_id!: number | null;
  public doctor_id!: number | null;
  public branch_id!: number | null;
  public appointment_date!: Date | null;
  public status!: 'Pending' | 'Approved' | 'Rejected' | 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | null;
  public is_walkin!: boolean | null;
  public reason!: string | null;
  public created_by!: number | null;
  public approved_by!: number | null;
  public approved_at!: Date | null;
  public rejection_reason!: string | null;
  public created_at!: Date | null;

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
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Scheduled', 'Completed', 'Cancelled', 'No-Show'),
      allowNull: true,
    },
    is_walkin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
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