import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import User from './user.model';
import TreatmentSession from './treatment.session.model';

class Medication extends Model {}

Medication.init({
  medication_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patient_id: {
    type: DataTypes.INTEGER,
    references: { model: 'patients', key: 'patient_id' }
  },
  prescribed_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'user_id' }
  },
  session_id: {
    type: DataTypes.INTEGER,
    references: { model: 'treatment_sessions', key: 'session_id' }
  },
  name: { type: DataTypes.STRING(100), allowNull: false },
  dosage: { type: DataTypes.STRING(50), allowNull: false },
  frequency: { type: DataTypes.STRING(50), allowNull: false },
  duration: DataTypes.INTEGER, // in days
  start_date: { type: DataTypes.DATE, allowNull: false },
  end_date: DataTypes.DATE,
  instructions: DataTypes.TEXT,
  side_effects: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('active', 'completed', 'discontinued'),
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Medication',
  tableName: 'medications'
});

// Associations
Medication.belongsTo(Patient, { foreignKey: 'patient_id' });
Medication.belongsTo(User, { as: 'Prescriber', foreignKey: 'prescribed_by' });
Medication.belongsTo(TreatmentSession, { foreignKey: 'session_id' });

export default Medication;