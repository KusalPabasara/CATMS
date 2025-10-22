import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SpecialtyAttributes {
  specialty_id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface SpecialtyCreationAttributes extends Optional<SpecialtyAttributes, 'specialty_id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Specialty extends Model<SpecialtyAttributes, SpecialtyCreationAttributes> implements SpecialtyAttributes {
  public specialty_id!: number;
  public name!: string;
  public description?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Specialty.init(
  {
    specialty_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
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
    tableName: 'specialties',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['is_active'],
      },
    ],
  }
);

export default Specialty;