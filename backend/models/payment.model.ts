import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Payment extends Model {}

Payment.init({
  payment_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  method: DataTypes.ENUM('Cash', 'Card', 'Bank Transfer', 'Mobile Wallet'),
  transaction_id: DataTypes.STRING,
  payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  modelName: 'Payment',
  tableName: 'payments'
});

export default Payment;
