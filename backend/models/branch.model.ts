import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BranchAttributes {
  branch_id: number;
  name: string | null;
  branch_name?: string | null;  // Alias for name
  location: string | null;
  phone: string | null;
  email: string | null;
}

interface BranchCreationAttributes extends Optional<BranchAttributes, 'branch_id'> {}

class Branch extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  public branch_id!: number;
  public name!: string | null;
  public branch_name?: string | null;  // Alias for name
  public location!: string | null;
  public phone!: string | null;
  public email!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Branch.init(
  {
    branch_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'branches',
    timestamps: false,
    freezeTableName: true,
  }
);

export { Branch };
export default Branch;
export type { BranchAttributes, BranchCreationAttributes };