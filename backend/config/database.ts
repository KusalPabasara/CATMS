import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'catms_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: Number(process.env.DB_PORT) || 3306,
    logging: false,
    define: {
      timestamps: false,
      freezeTableName: true,
    },
    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  }
);

export default sequelize;
export { sequelize, QueryTypes };
