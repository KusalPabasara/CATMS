import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class TreatmentRecord extends Model {}

TreatmentRecord.init({
  record_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  appointment_id: { type: DataTypes.INTEGER, allowNull: false },
  doctor_id: { type: DataTypes.INTEGER, allowNull: false },
  treatment_id: { type: DataTypes.INTEGER, allowNull: false },
  notes: DataTypes.TEXT,
  prescription: DataTypes.TEXT,
  image_url: DataTypes.STRING,
  digitally_signed: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'TreatmentRecord',
  tableName: 'treatment_records'
});

export default TreatmentRecord;
