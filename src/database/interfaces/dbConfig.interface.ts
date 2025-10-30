import { SequelizeOptions } from 'sequelize-typescript';
import { Dialect } from 'sequelize';

export interface IDatabaseConfigAttributes extends SequelizeOptions {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  dialect?: Dialect;
  dialectOptions?: any;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  models?: string[];
}
export interface IDatabaseConfig {
  database: IDatabaseConfigAttributes;
}
