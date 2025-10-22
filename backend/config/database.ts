import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Determine database configuration based on environment
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided (Railway/Heroku style), use it directly
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      dialect: 'postgres' as const,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    };
  }

  // Otherwise, use individual environment variables
  const dialect = process.env.DB_DIALECT || 'mysql';
  return {
    database: process.env.DB_NAME || 'catms_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    dialect: dialect as 'mysql' | 'postgres',
    port: Number(process.env.DB_PORT) || (dialect === 'postgres' ? 5432 : 3306),
    dialectOptions: dialect === 'postgres' && process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  };
};

const config = getDatabaseConfig();

const sequelize = new Sequelize(
  config.url || config.database!,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
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
    dialectOptions: config.dialectOptions
  }
);

export default sequelize;
export { sequelize, QueryTypes };
