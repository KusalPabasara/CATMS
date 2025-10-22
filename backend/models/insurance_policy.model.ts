import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InsurancePolicyAttributes {
  policy_id: number;
  insurance_company_name: string;
  policy_type: 'Health' | 'Life' | 'Accident' | 'Dental' | 'Vision' | 'Other';
  policy_name: string;
  policy_description?: string;
  coverage_percentage: number;
  annual_limit?: number;
  deductible_amount: number;
  co_payment_amount: number;
  max_out_of_pocket?: number;
  preauth_required: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface InsurancePolicyCreationAttributes extends Optional<InsurancePolicyAttributes, 'policy_id' | 'policy_description' | 'annual_limit' | 'deductible_amount' | 'co_payment_amount' | 'max_out_of_pocket' | 'preauth_required' | 'is_active' | 'created_at' | 'updated_at'> {}

class InsurancePolicy extends Model<InsurancePolicyAttributes, InsurancePolicyCreationAttributes> implements InsurancePolicyAttributes {
  public policy_id!: number;
  public insurance_company_name!: string;
  public policy_type!: 'Health' | 'Life' | 'Accident' | 'Dental' | 'Vision' | 'Other';
  public policy_name!: string;
  public policy_description?: string;
  public coverage_percentage!: number;
  public annual_limit?: number;
  public deductible_amount!: number;
  public co_payment_amount!: number;
  public max_out_of_pocket?: number;
  public preauth_required!: boolean;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InsurancePolicy.init(
  {
    policy_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    insurance_company_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    policy_type: {
      type: DataTypes.ENUM('Health', 'Life', 'Accident', 'Dental', 'Vision', 'Other'),
      allowNull: false,
      defaultValue: 'Health',
    },
    policy_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    policy_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coverage_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 80.00,
    },
    annual_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    deductible_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    co_payment_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    max_out_of_pocket: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    preauth_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'insurance_policies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['insurance_company_name'],
      },
      {
        fields: ['policy_type'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default InsurancePolicy;
