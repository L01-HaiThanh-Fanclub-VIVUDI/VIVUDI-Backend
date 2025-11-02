import { Module } from '@nestjs/common';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PositionEntity } from './entities/position.entity';

@Module({
  imports: [SequelizeModule.forFeature([PositionEntity])],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService]
})
export class PositionModule {}

