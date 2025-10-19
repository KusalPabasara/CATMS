import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BranchAttributes {
  branch_id: number;
  branch_name: string;        // maps to DB column "name"
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: Date | null;   // keep only if you add the column in DB (see note)
}

type BranchCreationAttributes = Optional<
  BranchAttributes,
  'branch_id' | 'location' | 'phone' | 'email' | 'created_at'
>;

class Branch extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  public branch_id!: number;
  public branch_name!: string;
  public location!: string | null;
  public phone!: string | null;
  public email!: string | null;
  public created_at!: Date | null;
}

Branch.init(
  {
    branch_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // IMPORTANT: your DB column is "name"; we expose it in the model as "branch_name"
    branch_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'name',
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Keep this only if you add the column in DB (recommended for compatibility)
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'branches', // match your schema
    timestamps: false,      // branches table has no createdAt/updatedAt managed by Sequelize
    freezeTableName: true,  // don't auto-pluralize
  }
);

export { Branch };
export default Branch;
export type { BranchAttributes, BranchCreationAttributes };