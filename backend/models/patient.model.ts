import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PatientAttributes {
  patient_id: number;
  full_name: string;
  national_id?: string;
  dob?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  blood_type?: string;
  phone?: string;
  email?: string;
  password_hash?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  allergies?: string;
  active: boolean;
  profile_picture?: string;
  created_at: Date;
}

class Patient extends Model<PatientAttributes, PatientAttributes> {
  public patient_id!: number;
  public full_name!: string;
  public national_id?: string;
  public dob?: Date;
  public gender?: 'Male' | 'Female' | 'Other';
  public blood_type?: string;
  public phone?: string;
  public email?: string;
  public password_hash?: string;
  public address?: string;
  public emergency_contact_name?: string;
  public emergency_contact_phone?: string;
  public insurance_provider?: string;
  public insurance_policy_number?: string;
  public allergies?: string;
  public active!: boolean;
  public profile_picture?: string;
  public created_at!: Date;
}

Patient.init({
  patient_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  national_id: { type: DataTypes.STRING(20), unique: true },
  dob: DataTypes.DATEONLY,
  gender: DataTypes.ENUM('Male', 'Female', 'Other'),
  blood_type: DataTypes.STRING(3),
  phone: DataTypes.STRING(20),
  email: DataTypes.STRING(100),
  password_hash: DataTypes.STRING(255),
  address: DataTypes.TEXT,
  emergency_contact_name: DataTypes.STRING(100),
  emergency_contact_phone: DataTypes.STRING(20),
  insurance_provider: DataTypes.STRING(100),
  insurance_policy_number: DataTypes.STRING(50),
  allergies: DataTypes.TEXT,
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  profile_picture: DataTypes.STRING(500),
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Patient',
  tableName: 'patients',
  timestamps: false
});

export { Patient };
export default Patient;
export type { PatientAttributes };
