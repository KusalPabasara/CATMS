import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TreatmentCatalogueAttributes {
  treatment_id: number;
  name: string | null;
  description: string | null;
  cost: number | null;
  duration: number | null;
  category: string | null;
  icd10_code: string | null;
  cpt_code: string | null;
  is_active: boolean | null;
}

interface TreatmentCatalogueCreationAttributes extends Optional<TreatmentCatalogueAttributes, 'treatment_id'> {}

class TreatmentCatalogue extends Model<TreatmentCatalogueAttributes, TreatmentCatalogueCreationAttributes> implements TreatmentCatalogueAttributes {
  public treatment_id!: number;
  public name!: string | null;
  public description!: string | null;
  public cost!: number | null;
  public duration!: number | null;
  public category!: string | null;
  public icd10_code!: string | null;
  public cpt_code!: string | null;
  public is_active!: boolean | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TreatmentCatalogue.init(
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
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    icd10_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    cpt_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'treatments',
    timestamps: false,
    freezeTableName: true,
  }
);

export { TreatmentCatalogue };
export default TreatmentCatalogue;
export type { TreatmentCatalogueAttributes, TreatmentCatalogueCreationAttributes };
