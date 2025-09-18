import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BranchAttributes {
  branch_id: number;
  branch_name: string | null;
  location: string | null;
  phone: string | null;
  created_at: Date | null;
}

interface BranchCreationAttributes extends Optional<BranchAttributes, 'branch_id' | 'created_at'> {}

class Branch extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  public branch_id!: number;
  public branch_name!: string | null;
  public location!: string | null;
  public phone!: string | null;
  public created_at!: Date | null;

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
    branch_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'branch',
    timestamps: false,
    freezeTableName: true,
  }
);

export { Branch };
export default Branch;
export type { BranchAttributes, BranchCreationAttributes };