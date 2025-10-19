import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class StaffSchedule extends Model {}

StaffSchedule.init({
  schedule_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: false },
  day_of_week: DataTypes.ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
  start_time: DataTypes.TIME,
  end_time: DataTypes.TIME
}, {
  sequelize,
  modelName: 'StaffSchedule',
  tableName: 'staff_schedule'
});

export default StaffSchedule;
