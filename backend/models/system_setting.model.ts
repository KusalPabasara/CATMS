import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class SystemSetting extends Model {}

SystemSetting.init({
  setting_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  key_name: { type: DataTypes.STRING, unique: true },
  value: DataTypes.TEXT
}, {
  sequelize,
  modelName: 'SystemSetting',
  tableName: 'system_settings'
});

export default SystemSetting;
