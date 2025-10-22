import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';
import InsurancePolicy from './insurance_policy.model';

interface PatientInsuranceAttributes {
  patient_insurance_id: number;
  patient_id: number;
  policy_id: number;
  policy_number: string;
  member_id: string;
  group_number?: string;
  effective_date: Date;
  expiry_date?: Date;
  is_primary: boolean;
  is_active: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  Patient?: User;
  InsurancePolicy?: InsurancePolicy;
}

interface PatientInsuranceCreationAttributes extends Optional<PatientInsuranceAttributes, 'patient_insurance_id' | 'group_number' | 'expiry_date' | 'is_primary' | 'is_active' | 'notes' | 'created_at' | 'updated_at'> {}

class PatientInsurance extends Model<PatientInsuranceAttributes, PatientInsuranceCreationAttributes> implements PatientInsuranceAttributes {
  public patient_insurance_id!: number;
  public patient_id!: number;
  public policy_id!: number;
  public policy_number!: string;
  public member_id!: string;
  public group_number?: string;
  public effective_date!: Date;
  public expiry_date?: Date;
  public is_primary!: boolean;
  public is_active!: boolean;
  public notes?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public Patient?: User;
  public InsurancePolicy?: InsurancePolicy;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PatientInsurance.init(
  {
    patient_insurance_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    policy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'insurance_policies',
        key: 'policy_id',
      },
    },
    policy_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    member_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    group_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'patient_insurance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['patient_id'],
      },
      {
        fields: ['policy_id'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['is_primary'],
      },
      {
        unique: true,
        fields: ['patient_id', 'policy_id'],
        name: 'unique_patient_policy',
      },
    ],
  }
);

export default PatientInsurance;
