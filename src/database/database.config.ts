import * as dotenv from 'dotenv';
import { IDatabaseConfig } from './interfaces/dbConfig.interface';
import { Dialect } from 'sequelize';
import { AuthEntity } from '../modules/auth/entities/auth.entity';

dotenv.config();

export const databaseConfig: IDatabaseConfig = {
  database: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT as Dialect,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
        ca: process.env.CA_CERTIFICATE,
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  },
};
console.log(databaseConfig)