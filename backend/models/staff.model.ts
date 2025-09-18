import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface StaffAttributes {
  staff_id: number;
  first_name: string | null;
  last_name: string | null;
  role: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Other';
  speciality: string | null;
  email: string | null;
  branch_id: number | null;
  created_at: Date | null;
  is_active: boolean | null;
}

interface StaffCreationAttributes extends Optional<StaffAttributes, 'staff_id' | 'created_at'> {}

class Staff extends Model<StaffAttributes, StaffCreationAttributes> implements StaffAttributes {
  public staff_id!: number;
  public first_name!: string | null;
  public last_name!: string | null;
  public role!: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Other';
  public speciality!: string | null;
  public email!: string | null;
  public branch_id!: number | null;
  public created_at!: Date | null;
  public is_active!: boolean | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Staff.init(
  {
    staff_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Doctor', 'Nurse', 'Receptionist', 'Other'),
      allowNull: false,
    },
    speciality: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'staff',
    timestamps: false,
    freezeTableName: true,
  }
);

export { Staff };
export default Staff;
export type { StaffAttributes, StaffCreationAttributes };
