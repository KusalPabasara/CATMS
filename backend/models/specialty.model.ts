import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Specialty extends Model {}

Specialty.init({
  specialty_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), unique: true, allowNull: false }
}, {
  sequelize,
  modelName: 'Specialty',
  tableName: 'specialties'
});

export default Specialty;
