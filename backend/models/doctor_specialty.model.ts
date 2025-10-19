import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class DoctorSpecialty extends Model {}

DoctorSpecialty.init({
  user_id: { type: DataTypes.INTEGER, primaryKey: true },
  specialty_id: { type: DataTypes.INTEGER, primaryKey: true }
}, {
  sequelize,
  modelName: 'DoctorSpecialty',
  tableName: 'doctor_specialties'
});

export default DoctorSpecialty;
