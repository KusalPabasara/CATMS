import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import User from './user.model';

class MedicalDocument extends Model {}

MedicalDocument.init({
  document_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patient_id: {
    type: DataTypes.INTEGER,
    references: { model: 'patients', key: 'patient_id' }
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'user_id' }
  },
  document_type: {
    type: DataTypes.ENUM(
      'lab_result',
      'prescription',
      'medical_report',
      'imaging',
      'insurance',
      'consent_form',
      'other'
    ),
    allowNull: false
  },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: DataTypes.TEXT,
  file_path: { type: DataTypes.STRING(255), allowNull: false },
  file_type: { type: DataTypes.STRING(50), allowNull: false },
  file_size: { type: DataTypes.INTEGER, allowNull: false }, // in bytes
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true, document is visible to patient in portal'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_accessed: DataTypes.DATE,
  expires_at: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('active', 'archived', 'deleted'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'MedicalDocument',
  tableName: 'medical_documents',
  paranoid: true // Enables soft deletes
});

// Associations
MedicalDocument.belongsTo(Patient, { foreignKey: 'patient_id' });
MedicalDocument.belongsTo(User, { as: 'Uploader', foreignKey: 'uploaded_by' });

export default MedicalDocument;