import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PositionEntity } from './entities/position.entity';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    SequelizeModule.forFeature([PositionEntity]),
    DatabaseModule
  ],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService]
})
export class PositionModule {}

