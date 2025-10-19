import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Role from './role.model';
import { Branch } from './branch.model';

interface UserAttributes {
  user_id: number;
  branch_id?: number;
  role_id: number;
  full_name: string;
  email: string;
  phone?: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  last_login?: Date;
  Role?: Role;
  Branch?: Branch;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'user_id' | 'is_active' | 'created_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public user_id!: number;
  public branch_id?: number;
  public role_id!: number;
  public full_name!: string;
  public email!: string;
  public phone?: string;
  public password_hash!: string;
  public is_active!: boolean;
  public created_at!: Date;
  public last_login?: Date;
  
  // Associations
  public readonly Role?: Role;
  public readonly Branch?: Branch;
}

User.init({
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  branch_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  role_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  phone: DataTypes.STRING,
  password_hash: { type: DataTypes.STRING, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  last_login: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
});

// Associations are now defined in models/index.ts

export default User;
