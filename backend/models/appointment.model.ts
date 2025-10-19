import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AppointmentAttributes {
  appointment_id: number;
  patient_id: number | null;
  doctor_id: number | null;
  branch_id: number | null;
  appointment_date: Date | null;
  appointment_time: string | null;
  reason: string | null;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | null;
  created_at: Date | null;
  updated_at: Date | null;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'appointment_id' | 'created_at' | 'updated_at'> {}

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public appointment_id!: number;
  public patient_id!: number | null;
  public doctor_id!: number | null;
  public branch_id!: number | null;
  public appointment_date!: Date | null;
  public appointment_time!: string | null;
  public reason!: string | null;
  public status!: 'Scheduled' | 'Completed' | 'Cancelled' | null;
  public created_at!: Date | null;
  public updated_at!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    appointment_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'appointment',
    timestamps: false,
    freezeTableName: true,
  }
);

export { Appointment };
export default Appointment;
export type { AppointmentAttributes, AppointmentCreationAttributes };