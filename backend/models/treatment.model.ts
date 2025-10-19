import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TreatmentCatalogueAttributes {
  treatment_id: number;
  name: string;
  description: string | null;
  cost: string | number; // DECIMAL often returns string
  is_active: boolean;
}

export type TreatmentCatalogueCreationAttributes = Optional<
  TreatmentCatalogueAttributes,
  'treatment_id' | 'description' | 'is_active'
>;

export default class Treatments extends Model<TreatmentCatalogueAttributes, TreatmentCatalogueCreationAttributes>
  implements TreatmentCatalogueAttributes {
  public treatment_id!: number;
  public name!: string;
  public description!: string | null;
  public cost!: string | number;
  public is_active!: boolean;
}

Treatments.init(
  {
    treatment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'treatments', // catalogue table (plural)
    timestamps: false,
    freezeTableName: true,
    indexes: [{ name: 'idx_treatments_name', fields: ['name'] }],
  }
);