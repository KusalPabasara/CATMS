import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import Treatment from './treatment.model';
import TreatmentSession from './treatment.session.model';

class TreatmentProgress extends Model {}

TreatmentProgress.init({
  progress_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patient_id: {
    type: DataTypes.INTEGER,
    references: { model: 'patients', key: 'patient_id' }
  },
  treatment_id: {
    type: DataTypes.INTEGER,
    references: { model: 'treatments', key: 'treatment_id' }
  },
  session_id: {
    type: DataTypes.INTEGER,
    references: { model: 'treatment_sessions', key: 'session_id' }
  },
  progress_date: { type: DataTypes.DATE, allowNull: false },
  pain_level: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 10 }
  },
  mobility_level: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 10 }
  },
  symptoms: DataTypes.TEXT,
  notes: DataTypes.TEXT,
  complications: DataTypes.TEXT,
  recovery_status: {
    type: DataTypes.ENUM('improving', 'stable', 'worsening', 'recovered'),
    defaultValue: 'stable'
  },
  next_assessment_date: DataTypes.DATE,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'TreatmentProgress',
  tableName: 'treatment_progress'
});

// Associations
TreatmentProgress.belongsTo(Patient, { foreignKey: 'patient_id' });
TreatmentProgress.belongsTo(Treatment, { foreignKey: 'treatment_id' });
TreatmentProgress.belongsTo(TreatmentSession, { foreignKey: 'session_id' });

export default TreatmentProgress;