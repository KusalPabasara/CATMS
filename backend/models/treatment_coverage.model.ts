import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import InsurancePolicy from './insurance_policy.model';
import TreatmentCatalogue from './treatment_catalogue.model';

interface TreatmentCoverageAttributes {
  coverage_id: number;
  policy_id: number;
  treatment_id: number;
  coverage_percentage: number;
  requires_preauth: boolean;
  annual_limit?: number;
  co_payment_amount: number;
  is_excluded: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  InsurancePolicy?: InsurancePolicy;
  TreatmentCatalogue?: TreatmentCatalogue;
}

interface TreatmentCoverageCreationAttributes extends Optional<TreatmentCoverageAttributes, 'coverage_id' | 'annual_limit' | 'requires_preauth' | 'co_payment_amount' | 'is_excluded' | 'is_active' | 'created_at' | 'updated_at'> {}

class TreatmentCoverage extends Model<TreatmentCoverageAttributes, TreatmentCoverageCreationAttributes> implements TreatmentCoverageAttributes {
  public coverage_id!: number;
  public policy_id!: number;
  public treatment_id!: number;
  public coverage_percentage!: number;
  public requires_preauth!: boolean;
  public annual_limit?: number;
  public co_payment_amount!: number;
  public is_excluded!: boolean;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public InsurancePolicy?: InsurancePolicy;
  public TreatmentCatalogue?: TreatmentCatalogue;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TreatmentCoverage.init(
  {
    coverage_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'insurance_policies',
        key: 'policy_id',
      },
    },
    treatment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'treatment_catalogue',
        key: 'treatment_id',
      },
    },
    coverage_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 80.00,
    },
    requires_preauth: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    annual_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    co_payment_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    is_excluded: {
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
    tableName: 'treatment_coverage',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['policy_id'],
      },
      {
        fields: ['treatment_id'],
      },
      {
        fields: ['is_active'],
      },
      {
        unique: true,
        fields: ['policy_id', 'treatment_id'],
        name: 'unique_policy_treatment',
      },
    ],
  }
);

export default TreatmentCoverage;
