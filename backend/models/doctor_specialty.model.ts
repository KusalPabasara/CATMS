import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import Specialty from './specialty.model';

interface DoctorSpecialtyAttributes {
  doctor_specialty_id: number;
  doctor_id: number;
  specialty_id: number;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
  Doctor?: User;
  Specialty?: Specialty;
}

interface DoctorSpecialtyCreationAttributes extends Optional<DoctorSpecialtyAttributes, 'doctor_specialty_id' | 'is_primary' | 'created_at' | 'updated_at'> {}

class DoctorSpecialty extends Model<DoctorSpecialtyAttributes, DoctorSpecialtyCreationAttributes> implements DoctorSpecialtyAttributes {
  public doctor_specialty_id!: number;
  public doctor_id!: number;
  public specialty_id!: number;
  public is_primary!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public Doctor?: User;
  public Specialty?: Specialty;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DoctorSpecialty.init(
  {
    doctor_specialty_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    specialty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'specialties',
        key: 'specialty_id',
      },
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'doctor_specialties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['doctor_id'],
      },
      {
        fields: ['specialty_id'],
      },
      {
        fields: ['is_primary'],
      },
      {
        unique: true,
        fields: ['doctor_id', 'specialty_id'],
        name: 'unique_doctor_specialty',
      },
    ],
  }
);

export default DoctorSpecialty;