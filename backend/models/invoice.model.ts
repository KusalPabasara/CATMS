import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Invoice extends Model {}

Invoice.init({
  invoice_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  patient_id: { type: DataTypes.INTEGER, allowNull: false },
  appointment_id: DataTypes.INTEGER,
  branch_id: DataTypes.INTEGER,
  total_amount: DataTypes.DECIMAL(10,2),
  paid_amount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.0 },
  due_date: { type: DataTypes.DATE, allowNull: true },
  status: DataTypes.ENUM('Pending', 'Partially Paid', 'Paid', 'Refunded'),
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  modelName: 'Invoice',
  tableName: 'invoices'
});

export default Invoice;
