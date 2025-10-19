import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import User from './user.model';
import Treatment from './treatment.model';

class TreatmentSession extends Model {}

TreatmentSession.init({
  session_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  treatment_id: {
    type: DataTypes.INTEGER,
    references: { model: 'treatments', key: 'treatment_id' }
  },
  patient_id: {
    type: DataTypes.INTEGER,
    references: { model: 'patients', key: 'patient_id' }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'user_id' }
  },
  session_date: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  notes: DataTypes.TEXT,
  progress_scale: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 10 }
  },
  symptoms: DataTypes.TEXT,
  vital_signs: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  next_session_date: DataTypes.DATE,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'TreatmentSession',
  tableName: 'treatment_sessions'
});

// Associations
TreatmentSession.belongsTo(Treatment, { foreignKey: 'treatment_id' });
TreatmentSession.belongsTo(Patient, { foreignKey: 'patient_id' });
TreatmentSession.belongsTo(User, { as: 'Doctor', foreignKey: 'doctor_id' });

export default TreatmentSession;