import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TreatmentAttributes {
  record_id: number;
  appointment_id: number | null;
  doctor_id: number | null;
  treatment_id: number | null;
  notes: string | null;
  prescription: string | null;
  image_url: string | null;
  digitally_signed: boolean | null;
  created_at: Date | null;
}

interface TreatmentCreationAttributes extends Optional<TreatmentAttributes, 'record_id' | 'created_at'> {}

class Treatment extends Model<TreatmentAttributes, TreatmentCreationAttributes> implements TreatmentAttributes {
  public record_id!: number;
  public appointment_id!: number | null;
  public doctor_id!: number | null;
  public treatment_id!: number | null;
  public notes!: string | null;
  public prescription!: string | null;
  public image_url!: string | null;
  public digitally_signed!: boolean | null;
  public created_at!: Date | null;

  // Timestamps
  public readonly createdAt!: Date;
}

Treatment.init(
  {
    record_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    digitally_signed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'treatment_records',
    timestamps: false,
    freezeTableName: true,
  }
);

export { Treatment };
export default Treatment;
export type { TreatmentAttributes, TreatmentCreationAttributes };