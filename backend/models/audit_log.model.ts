import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AuditLog extends Model {}

AuditLog.init({
  log_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  action: DataTypes.STRING,
  ip_address: DataTypes.STRING,
  target_table: DataTypes.STRING,
  target_id: DataTypes.INTEGER,
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'AuditLog',
  tableName: 'audit_log'
});

export default AuditLog;
