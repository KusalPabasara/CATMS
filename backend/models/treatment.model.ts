import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TreatmentAttributes {
  treatment_id: number;
  appointment_id: number | null;
  treatment_type_id: number | null;
  consultation_notes: string | null;
  prescription: string | null;
  treatment_date: Date | null;
  cost: number | null;
  doctor_signature: string | null;
  is_active: boolean | null;
  created_at: Date | null;
}

interface TreatmentCreationAttributes extends Optional<TreatmentAttributes, 'treatment_id' | 'created_at'> {}

class Treatment extends Model<TreatmentAttributes, TreatmentCreationAttributes> implements TreatmentAttributes {
  public treatment_id!: number;
  public appointment_id!: number | null;
  public treatment_type_id!: number | null;
  public consultation_notes!: string | null;
  public prescription!: string | null;
  public treatment_date!: Date | null;
  public cost!: number | null;
  public doctor_signature!: string | null;
  public is_active!: boolean | null;
  public created_at!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Treatment.init(
  {
    treatment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    treatment_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    consultation_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    treatment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    doctor_signature: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'treatment',
    timestamps: false,
    freezeTableName: true,
  }
);

export { Treatment };
export default Treatment;
export type { TreatmentAttributes, TreatmentCreationAttributes };