import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class InsuranceClaim extends Model {}

InsuranceClaim.init({
  claim_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false },
  provider_name: DataTypes.STRING,
  claim_status: DataTypes.ENUM('Submitted', 'Paid', 'Rejected', 'Pending'),
  submitted_at: DataTypes.DATE,
  processed_at: DataTypes.DATE,
  response_notes: DataTypes.TEXT
}, {
  sequelize,
  modelName: 'InsuranceClaim',
  tableName: 'insurance_claims'
});

export default InsuranceClaim;
