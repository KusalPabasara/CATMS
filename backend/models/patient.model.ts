import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PatientAttributes {
  patient_id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
  national_id?: string;
  dob?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  blood_type?: string;
  phone?: string;
  email: string;
  password_hash?: string;
  address?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  allergies?: string;
  profile_picture?: string;
  active: boolean;
  created_at: Date;
}

class Patient extends Model<PatientAttributes, PatientAttributes> {
  public patient_id!: number;
  public full_name!: string;
  public first_name?: string;
  public last_name?: string;
  public national_id?: string;
  public dob?: Date;
  public gender?: 'Male' | 'Female' | 'Other';
  public blood_type?: string;
  public phone?: string;
  public email!: string;
  public password_hash?: string;
  public address?: string;
  public emergency_contact?: string;
  public emergency_contact_name?: string;
  public emergency_contact_phone?: string;
  public insurance_provider?: string;
  public insurance_policy_number?: string;
  public allergies?: string;
  public profile_picture?: string;
  public active!: boolean;
  public created_at!: Date;
}

Patient.init({
  patient_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  first_name: { type: DataTypes.STRING(25), allowNull: true },
  last_name: { type: DataTypes.STRING(25), allowNull: true },
  national_id: { type: DataTypes.STRING(20), unique: true },
  dob: DataTypes.DATEONLY,
  gender: DataTypes.ENUM('Male', 'Female', 'Other'),
  blood_type: DataTypes.STRING(3),
  phone: DataTypes.STRING,
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING },
  address: DataTypes.TEXT,
  emergency_contact: DataTypes.STRING(10),
  emergency_contact_name: DataTypes.STRING,
  emergency_contact_phone: DataTypes.STRING,
  insurance_provider: DataTypes.STRING,
  insurance_policy_number: DataTypes.STRING,
  allergies: DataTypes.TEXT,
  profile_picture: DataTypes.STRING,
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Patient',
  tableName: 'patients'
});

export { Patient };
export default Patient;
export type { PatientAttributes };
