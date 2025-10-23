import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SpecialtyAttributes {
  specialty_id: number;
  name: string;
}

interface SpecialtyCreationAttributes extends Optional<SpecialtyAttributes, 'specialty_id'> {}

class Specialty extends Model<SpecialtyAttributes, SpecialtyCreationAttributes> implements SpecialtyAttributes {
  public specialty_id!: number;
  public name!: string;
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
  },
  {
    sequelize,
    tableName: 'specialties',
    timestamps: false,
    freezeTableName: true,
  }
);

export default Specialty;