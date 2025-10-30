import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './database.config';
import { databaseProviders } from './database.provider';

@Module({
  imports: [SequelizeModule.forRoot(databaseConfig.database)],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
