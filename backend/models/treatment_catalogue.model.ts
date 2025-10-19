import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TreatmentCatalogueAttributes {
  treatment_type_id: number;
  treatment_name: string | null;
  description: string | null;
  icd10_code: string | null;
  cpt_code: string | null;
  standard_cost: number | null;
  category: string | null;
  is_active: boolean | null;
}

interface TreatmentCatalogueCreationAttributes extends Optional<TreatmentCatalogueAttributes, 'treatment_type_id'> {}

class TreatmentCatalogue extends Model<TreatmentCatalogueAttributes, TreatmentCatalogueCreationAttributes> implements TreatmentCatalogueAttributes {
  public treatment_type_id!: number;
  public treatment_name!: string | null;
  public description!: string | null;
  public icd10_code!: string | null;
  public cpt_code!: string | null;
  public standard_cost!: number | null;
  public category!: string | null;
  public is_active!: boolean | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TreatmentCatalogue.init(
  {
    treatment_type_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    treatment_name: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icd10_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    cpt_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    standard_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'treatment_catalogue',
    timestamps: false,
    freezeTableName: true,
  }
);

export { TreatmentCatalogue };
export default TreatmentCatalogue;
export type { TreatmentCatalogueAttributes, TreatmentCatalogueCreationAttributes };
